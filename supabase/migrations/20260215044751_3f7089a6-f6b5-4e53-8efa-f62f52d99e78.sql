
-- Enable realtime for build_jobs so clients can watch progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.build_jobs;
