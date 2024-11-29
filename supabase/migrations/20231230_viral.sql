-- Create referral stats table
CREATE TABLE IF NOT EXISTS referral_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    referral_code TEXT NOT NULL UNIQUE,
    referral_count INTEGER DEFAULT 0,
    videos_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared content table
CREATE TABLE IF NOT EXISTS shared_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_code TEXT NOT NULL REFERENCES referral_stats(referral_code),
    referred_user_id TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS referral_stats_user_id_idx ON referral_stats(user_id);
CREATE INDEX IF NOT EXISTS referral_stats_code_idx ON referral_stats(referral_code);
CREATE INDEX IF NOT EXISTS shared_content_video_id_idx ON shared_content(video_id);
CREATE INDEX IF NOT EXISTS shared_content_user_id_idx ON shared_content(user_id);
CREATE INDEX IF NOT EXISTS referral_tracking_code_idx ON referral_tracking(referral_code);

-- Create function to update referral stats
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Update referral count and videos earned
    UPDATE referral_stats
    SET 
        referral_count = referral_count + 1,
        videos_earned = CASE
            WHEN referral_count + 1 >= 100 THEN -1  -- -1 indicates unlimited
            WHEN referral_count + 1 >= 50 THEN videos_earned + 100
            WHEN referral_count + 1 >= 25 THEN videos_earned + 50
            WHEN referral_count + 1 >= 10 THEN videos_earned + 25
            WHEN referral_count + 1 >= 3 THEN videos_earned + 10
            ELSE videos_earned
        END,
        updated_at = NOW()
    WHERE referral_code = NEW.referral_code;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral processing
CREATE TRIGGER process_referral_trigger
    AFTER INSERT ON referral_tracking
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION process_referral();

-- Create function to track content engagement
CREATE OR REPLACE FUNCTION track_content_engagement(
    content_id UUID,
    engagement_type TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE shared_content
    SET
        views = CASE 
            WHEN engagement_type = 'view' THEN views + 1 
            ELSE views 
        END,
        shares = CASE 
            WHEN engagement_type = 'share' THEN shares + 1 
            ELSE shares 
        END,
        clicks = CASE 
            WHEN engagement_type = 'click' THEN clicks + 1 
            ELSE clicks 
        END,
        updated_at = NOW()
    WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Referral stats policies
CREATE POLICY "Users can view their own referral stats"
    ON referral_stats FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own referral stats"
    ON referral_stats FOR UPDATE
    USING (user_id = auth.uid());

-- Shared content policies
CREATE POLICY "Users can view public shared content"
    ON shared_content FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can update their own shared content"
    ON shared_content FOR UPDATE
    USING (user_id = auth.uid());

-- Referral tracking policies
CREATE POLICY "Users can view their own referral tracking"
    ON referral_tracking FOR SELECT
    USING (referred_user_id = auth.uid());

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a code with prefix and random string
        code := 'TUBE2TEXT' || substr(md5(random()::text), 1, 6);
        
        -- Check if code exists
        SELECT EXISTS (
            SELECT 1 FROM referral_stats WHERE referral_code = code
        ) INTO exists_already;
        
        -- Exit loop if unique code found
        EXIT WHEN NOT exists_already;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;
