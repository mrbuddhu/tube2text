-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    user_id TEXT REFERENCES auth.users(id),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    user_id TEXT REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_id TEXT REFERENCES auth.users(id),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create usage_stats table
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES auth.users(id) NOT NULL,
    videos_processed INTEGER DEFAULT 0,
    total_processing_time DOUBLE PRECISION DEFAULT 0,
    total_characters_generated INTEGER DEFAULT 0,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);

-- Create function to update usage_stats
CREATE OR REPLACE FUNCTION update_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usage_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        videos_processed = usage_stats.videos_processed + 1,
        total_processing_time = usage_stats.total_processing_time + 
            EXTRACT(EPOCH FROM (NEW.updated_at - NEW.created_at)),
        total_characters_generated = usage_stats.total_characters_generated + 
            length(COALESCE(NEW.transcript, '') || 
                   COALESCE(NEW.article, '') || 
                   COALESCE(NEW.summary, '')),
        last_processed_at = NEW.created_at,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usage stats when new transcription is added
CREATE TRIGGER update_usage_stats_trigger
AFTER INSERT ON transcriptions
FOR EACH ROW
EXECUTE FUNCTION update_usage_stats();
