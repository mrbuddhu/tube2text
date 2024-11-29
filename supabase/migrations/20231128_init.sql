-- Create transcriptions table
create table if not exists public.transcriptions (
    id uuid default gen_random_uuid() primary key,
    user_id text not null,
    title text not null,
    url text not null,
    transcript text not null,
    summary text,
    keywords text[],
    article text,
    sentiment text,
    sentiment_score double precision,
    topics jsonb,
    social_post text,
    hashtags text[],
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.transcriptions enable row level security;

-- Create policy for users to access their own transcriptions
create policy "Users can access own transcriptions"
    on public.transcriptions
    for all
    using (auth.uid() = user_id);

-- Create index for user_id for faster queries
create index idx_transcriptions_user_id on public.transcriptions(user_id);

-- Create index for created_at for sorting
create index idx_transcriptions_created_at on public.transcriptions(created_at desc);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to call the updated_at function
create trigger set_updated_at
    before update on public.transcriptions
    for each row
    execute function public.handle_updated_at();
