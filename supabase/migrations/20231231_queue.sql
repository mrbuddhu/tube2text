-- Create video queue table
CREATE TABLE video_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    video_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    progress INTEGER DEFAULT 0,
    CONSTRAINT status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Add indexes
CREATE INDEX idx_video_queue_user_id ON video_queue(user_id);
CREATE INDEX idx_video_queue_status ON video_queue(status);
CREATE INDEX idx_video_queue_created_at ON video_queue(created_at);

-- Add RLS policies
ALTER TABLE video_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
    ON video_queue FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can add their own jobs
CREATE POLICY "Users can add own jobs"
    ON video_queue FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Only service role can update jobs
CREATE POLICY "Service can update jobs"
    ON video_queue FOR UPDATE
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
