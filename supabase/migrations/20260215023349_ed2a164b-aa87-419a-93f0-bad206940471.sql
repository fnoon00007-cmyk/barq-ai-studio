
-- Add sharing columns to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS share_id uuid UNIQUE DEFAULT gen_random_uuid();

-- Create project_comments table
CREATE TABLE public.project_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Comments policies: project owner can CRUD
CREATE POLICY "Project owner can view comments"
ON public.project_comments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_comments.project_id AND projects.user_id = auth.uid())
  OR auth.uid() = user_id
);

CREATE POLICY "Users can insert comments on own projects"
ON public.project_comments FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_comments.project_id AND projects.user_id = auth.uid())
);

CREATE POLICY "Users can update own comments"
ON public.project_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.project_comments FOR DELETE
USING (auth.uid() = user_id);

-- Public preview policy: allow viewing shared projects without auth
CREATE POLICY "Anyone can view shared projects by share_id"
ON public.projects FOR SELECT
USING (share_enabled = true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;

-- Trigger for updated_at on comments
CREATE TRIGGER update_project_comments_updated_at
BEFORE UPDATE ON public.project_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
