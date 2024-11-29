-- Create usage_stats table
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    videos_processed INTEGER DEFAULT 0,
    total_processing_time FLOAT DEFAULT 0,
    total_characters_generated INTEGER DEFAULT 0,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS usage_stats_user_id_idx ON usage_stats(user_id);

-- Create function to update usage stats
CREATE OR REPLACE FUNCTION update_usage_stats()
RETURNS TRIGGER AS $$
DECLARE
    char_count INTEGER;
BEGIN
    -- Calculate total characters generated
    char_count := length(NEW.transcript) + 
                  length(NEW.summary) + 
                  length(NEW.article) + 
                  length(NEW.social_post) +
                  length(array_to_string(NEW.hashtags, ' '));

    -- Update or insert usage stats
    INSERT INTO usage_stats (
        user_id,
        videos_processed,
        total_processing_time,
        total_characters_generated,
        last_processed_at
    )
    VALUES (
        NEW.user_id,
        1,
        NEW.processing_time,
        char_count,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        videos_processed = usage_stats.videos_processed + 1,
        total_processing_time = usage_stats.total_processing_time + NEW.processing_time,
        total_characters_generated = usage_stats.total_characters_generated + char_count,
        last_processed_at = NOW(),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on transcriptions table
DROP TRIGGER IF EXISTS update_usage_stats_trigger ON transcriptions;
CREATE TRIGGER update_usage_stats_trigger
    AFTER INSERT ON transcriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_stats();
