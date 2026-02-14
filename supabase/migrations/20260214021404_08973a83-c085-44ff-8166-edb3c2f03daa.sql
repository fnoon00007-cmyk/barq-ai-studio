
-- Create user_usage table for rate limiting
CREATE TABLE public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  planner_calls integer NOT NULL DEFAULT 0,
  builder_calls integer NOT NULL DEFAULT 0,
  reviewer_calls integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON public.user_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own usage (via edge functions with service role)
CREATE POLICY "Service role can manage usage"
ON public.user_usage
FOR ALL
USING (true)
WITH CHECK (true);

-- Make the "Service role" policy only for service_role
DROP POLICY "Service role can manage usage" ON public.user_usage;

CREATE POLICY "Service role full access"
ON public.user_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can only read their own
CREATE POLICY "Users read own usage"
ON public.user_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to check and increment usage
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_user_id uuid,
  p_function_type text,
  p_daily_limit integer DEFAULT 50
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Upsert the usage row for today
  INSERT INTO public.user_usage (user_id, usage_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  -- Get current count
  IF p_function_type = 'planner' THEN
    SELECT planner_calls INTO current_count FROM public.user_usage WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    IF current_count >= p_daily_limit THEN RETURN false; END IF;
    UPDATE public.user_usage SET planner_calls = planner_calls + 1, updated_at = now() WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  ELSIF p_function_type = 'builder' THEN
    SELECT builder_calls INTO current_count FROM public.user_usage WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    IF current_count >= p_daily_limit THEN RETURN false; END IF;
    UPDATE public.user_usage SET builder_calls = builder_calls + 1, updated_at = now() WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  ELSIF p_function_type = 'reviewer' THEN
    SELECT reviewer_calls INTO current_count FROM public.user_usage WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    IF current_count >= p_daily_limit THEN RETURN false; END IF;
    UPDATE public.user_usage SET reviewer_calls = reviewer_calls + 1, updated_at = now() WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  ELSE
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
