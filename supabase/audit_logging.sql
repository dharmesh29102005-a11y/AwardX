-- Audit logging helpers
-- Creates `log_audit_event` RPC used by the app. Safe to re-run.

create extension if not exists "uuid-ossp";

-- Optional: helpful index for org-scoped log listing
create index if not exists audit_logs_org_created_at_idx
  on public.audit_logs(organization_id, created_at desc);

-- RPC function used by the frontend (services/supabase.ts).
-- Uses auth.uid() when available.
create or replace function public.log_audit_event(
  p_organization_id uuid,
  p_action text,
  p_action_type text,
  p_resource_type text default null,
  p_resource_id uuid default null,
  p_details text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_name text;
  v_user_avatar text;
  v_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is not null then
    select full_name, avatar_url
      into v_user_name, v_user_avatar
    from public.profiles
    where id = v_user_id;
  end if;

  insert into public.audit_logs (
    id,
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
  )
  values (
    uuid_generate_v4(),
    p_organization_id,
    v_user_id,
    p_action,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details,
    coalesce(p_metadata, '{}'::jsonb),
    v_user_name,
    v_user_avatar
  )
  returning id into v_id;

  return v_id;
end;
$$;


