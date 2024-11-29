-- Create video categories table
CREATE TABLE IF NOT EXISTS video_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video category mapping table
CREATE TABLE IF NOT EXISTS video_category_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES video_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS video_categories_user_id_idx ON video_categories(user_id);
CREATE INDEX IF NOT EXISTS video_category_mapping_video_id_idx ON video_category_mapping(video_id);
CREATE INDEX IF NOT EXISTS video_category_mapping_category_id_idx ON video_category_mapping(category_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for video_categories
CREATE TRIGGER update_video_categories_updated_at
    BEFORE UPDATE ON video_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_category_mapping ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view their own categories"
    ON video_categories FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own categories"
    ON video_categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories"
    ON video_categories FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories"
    ON video_categories FOR DELETE
    USING (user_id = auth.uid());

-- Category mapping policies
CREATE POLICY "Users can view their own video mappings"
    ON video_category_mapping FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM video_categories
            WHERE id = category_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own video mappings"
    ON video_category_mapping FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM video_categories
            WHERE id = category_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own video mappings"
    ON video_category_mapping FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM video_categories
            WHERE id = category_id
            AND user_id = auth.uid()
        )
    );
