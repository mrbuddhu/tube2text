-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'FREE',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create payment verifications table
CREATE TABLE payment_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    screenshot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT
);

-- Create usage stats table
CREATE TABLE usage_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    videos_processed INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, DATE_TRUNC('month', NOW())) NOT NULL
);

-- Add indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_payment_verifications_user_id ON payment_verifications(user_id);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can only submit their own payment verification
CREATE POLICY "Users can submit own payment verification"
    ON payment_verifications FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Users can only view their own payment verifications
CREATE POLICY "Users can view own payment verifications"
    ON payment_verifications FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can only view their own usage stats
CREATE POLICY "Users can view own usage stats"
    ON usage_stats FOR SELECT
    USING (auth.uid()::text = user_id);
