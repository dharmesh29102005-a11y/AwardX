-- Add workflow connection storage for schedule rounds
-- Stores edge metadata inside the condition JSONB payload.

CREATE TABLE IF NOT EXISTS public.round_edges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_id uuid,
  source_round_id uuid NOT NULL,
  target_round_id uuid NOT NULL,
  condition jsonb DEFAULT '{"type": "always"}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT round_edges_pkey PRIMARY KEY (id),
  CONSTRAINT round_edges_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT round_edges_source_round_id_fkey FOREIGN KEY (source_round_id) REFERENCES public.rounds(id),
  CONSTRAINT round_edges_target_round_id_fkey FOREIGN KEY (target_round_id) REFERENCES public.rounds(id)
);

CREATE INDEX IF NOT EXISTS round_edges_program_id_idx ON public.round_edges (program_id);
CREATE INDEX IF NOT EXISTS round_edges_source_round_id_idx ON public.round_edges (source_round_id);
CREATE INDEX IF NOT EXISTS round_edges_target_round_id_idx ON public.round_edges (target_round_id);

-- Audit log helper
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_organization_id uuid,
  p_action text,
  p_action_type text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_details text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_name text;
  v_user_avatar text;
  v_row_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NOT NULL THEN
    SELECT full_name, avatar_url
      INTO v_user_name, v_user_avatar
      FROM public.profiles
      WHERE id = v_user_id
      LIMIT 1;
  END IF;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    action_type,
    resource_type,
    resource_id,
    details,
    metadata,
    user_name,
    user_avatar
  ) VALUES (
    p_organization_id,
    v_user_id,
    p_action,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details,
    COALESCE(p_metadata, '{}'::jsonb),
    v_user_name,
    v_user_avatar
  )
  RETURNING id INTO v_row_id;

  RETURN v_row_id;
END;
$$;
