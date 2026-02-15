
-- Build jobs table for resumable builds
CREATE TABLE public.build_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  build_prompt TEXT,
  dependency_graph JSONB,
  status TEXT NOT NULL DEFAULT 'planning',
  current_phase INTEGER NOT NULL DEFAULT 0,
  phase_1_files JSONB,
  phase_2_files JSONB,
  phase_3_files JSONB,
  phase_4_files JSONB,
  quality_score INTEGER,
  quality_report JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.build_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs
CREATE POLICY "Users can view their own build jobs"
ON public.build_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own build jobs"
ON public.build_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own build jobs"
ON public.build_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own build jobs"
ON public.build_jobs FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_build_jobs_updated_at
BEFORE UPDATE ON public.build_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
