
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create build_analytics table
CREATE TABLE public.build_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  build_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  quality_score INTEGER NOT NULL DEFAULT 0,
  code_size_score INTEGER NOT NULL DEFAULT 0,
  tailwind_score INTEGER NOT NULL DEFAULT 0,
  arabic_score INTEGER NOT NULL DEFAULT 0,
  interactivity_score INTEGER NOT NULL DEFAULT 0,
  completeness_score INTEGER NOT NULL DEFAULT 0,
  files_count INTEGER NOT NULL DEFAULT 0,
  total_lines INTEGER NOT NULL DEFAULT 0,
  avg_lines_per_file INTEGER NOT NULL DEFAULT 0,
  files_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  phase_times JSONB,
  model_used TEXT,
  validation_retries INTEGER DEFAULT 0,
  issues JSONB,
  suggestions JSONB
);

ALTER TABLE public.build_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view own analytics
CREATE POLICY "Users can view own analytics"
ON public.build_analytics FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own analytics
CREATE POLICY "Users can insert own analytics"
ON public.build_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics (using security definer function)
CREATE POLICY "Admins can view all analytics"
ON public.build_analytics FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_analytics_created ON public.build_analytics(created_at DESC);
CREATE INDEX idx_analytics_score ON public.build_analytics(quality_score DESC);
CREATE INDEX idx_analytics_user ON public.build_analytics(user_id);
