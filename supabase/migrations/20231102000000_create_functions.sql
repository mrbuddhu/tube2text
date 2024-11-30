-- Function to use credits with concurrency control
CREATE OR REPLACE FUNCTION use_credits(user_id UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- Lock the user row for update
    SELECT credits INTO current_credits
    FROM users
    WHERE id = user_id
    FOR UPDATE;

    IF current_credits < amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Update credits
    UPDATE users
    SET credits = credits - amount
    WHERE id = user_id;

    -- Log usage
    INSERT INTO usage_logs (user_id, credits_used)
    VALUES (user_id, amount);
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE users
    SET credits = credits + amount
    WHERE id = user_id;
END;
$$;

-- Function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
    total_videos INTEGER,
    total_minutes INTEGER,
    total_credits_used INTEGER,
    credits_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(v.id)::INTEGER as total_videos,
        COALESCE(SUM(v.duration)::INTEGER, 0) as total_minutes,
        COALESCE(SUM(l.credits_used)::INTEGER, 0) as total_credits_used,
        u.credits as credits_remaining
    FROM users u
    LEFT JOIN videos v ON v.user_id = u.id
    LEFT JOIN usage_logs l ON l.user_id = u.id
    WHERE u.id = user_id
    GROUP BY u.credits;
END;
$$;

-- Add verify_payment function
CREATE OR REPLACE FUNCTION verify_payment(
  p_payment_id UUID,
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update payment status
  UPDATE payments
  SET status = 'verified'
  WHERE id = p_payment_id;

  -- Add credits to user
  UPDATE users
  SET credits = credits + p_credits
  WHERE id = p_user_id;

  -- Create credit history entry
  INSERT INTO credit_history (
    user_id,
    amount,
    type,
    description,
    payment_id
  ) VALUES (
    p_user_id,
    p_credits,
    'purchase',
    'Credits purchased via PayPal',
    p_payment_id
  );
END;
$$;

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for admin users" ON payments
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Enable insert for all authenticated users" ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for admin users" ON payments
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Add credit_history table if not exists
CREATE TABLE IF NOT EXISTS credit_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for credit_history
ALTER TABLE credit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for own records" ON credit_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for admin users" ON credit_history
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Add is_admin column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
