
-- Add files_data column for full code storage
ALTER TABLE public.build_analytics
ADD COLUMN IF NOT EXISTS files_data JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Keep files_summary as a lightweight fallback, no need to drop it
