CREATE OR REPLACE FUNCTION get_database_size()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_bytes bigint;
    total_rows bigint;
    daily_requests bigint;
    result json;
BEGIN
    -- Get total database size
    SELECT pg_database_size(current_database()) INTO total_bytes;

    -- Get total rows across main tables
    SELECT SUM(n_live_tup)
    INTO total_rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';

    -- Get daily API requests (from analytics_events)
    SELECT COUNT(*)
    INTO daily_requests
    FROM analytics_events
    WHERE created_at >= NOW() - INTERVAL '1 day';

    -- Construct result JSON
    result := json_build_object(
        'total_bytes', total_bytes,
        'total_rows', total_rows,
        'daily_requests', daily_requests
    );

    RETURN result;
END;
$$;
