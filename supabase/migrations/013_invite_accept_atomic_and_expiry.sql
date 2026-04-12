alter table if exists public.organization_invites
  add column if not exists expires_at timestamptz;

update public.organization_invites
set expires_at = coalesce(invited_at, now()) + interval '30 days'
where status = 'pending' and expires_at is null;

create index if not exists idx_org_invites_pending_expires_at
  on public.organization_invites(expires_at)
  where status = 'pending';

create or replace function public.accept_organization_invite(
  p_token uuid,
  p_user_id uuid,
  p_user_email text,
  p_user_full_name text default null
)
returns table(ok boolean, error text)
language plpgsql
as $$
declare
  v_invite public.organization_invites%rowtype;
  v_now timestamptz := now();
  v_email text := lower(trim(coalesce(p_user_email, '')));
  v_full_name text := nullif(trim(coalesce(p_user_full_name, '')), '');
begin
  if p_token is null then
    return query select false, 'invalid_token'::text;
    return;
  end if;

  if p_user_id is null then
    return query select false, 'invalid_user'::text;
    return;
  end if;

  select *
  into v_invite
  from public.organization_invites
  where token = p_token
  for update;

  if not found then
    return query select false, 'invalid_or_expired'::text;
    return;
  end if;

  if v_invite.status <> 'pending' then
    return query select false, 'already_processed'::text;
    return;
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at <= v_now then
    update public.organization_invites
    set status = 'expired', accepted_at = null
    where id = v_invite.id and status = 'pending';

    return query select false, 'expired'::text;
    return;
  end if;

  if lower(trim(coalesce(v_invite.email, ''))) <> v_email then
    return query select false, 'email_mismatch'::text;
    return;
  end if;

  insert into public.profiles (id, email, full_name, organization_id, updated_at)
  values (p_user_id, v_email, v_full_name, v_invite.organization_id, v_now)
  on conflict (id)
  do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    organization_id = coalesce(public.profiles.organization_id, excluded.organization_id),
    updated_at = v_now;

  update public.organization_members
  set role_id = coalesce(v_invite.role_id, public.organization_members.role_id),
      status = 'active',
      invited_by = coalesce(public.organization_members.invited_by, v_invite.invited_by),
      invited_at = coalesce(public.organization_members.invited_at, v_now),
      joined_at = coalesce(public.organization_members.joined_at, v_now)
  where organization_id = v_invite.organization_id
    and user_id = p_user_id
    and (
      (program_id is null and v_invite.program_id is null)
      or program_id = v_invite.program_id
    );

  if not found then
    insert into public.organization_members (
      organization_id,
      program_id,
      user_id,
      role_id,
      status,
      invited_by,
      invited_at,
      joined_at
    )
    values (
      v_invite.organization_id,
      v_invite.program_id,
      p_user_id,
      v_invite.role_id,
      'active',
      v_invite.invited_by,
      v_now,
      v_now
    );
  end if;

  update public.organization_invites
  set status = 'accepted', accepted_at = v_now
  where id = v_invite.id and status = 'pending';

  if not found then
    return query select false, 'already_processed'::text;
    return;
  end if;

  return query select true, null::text;
end;
$$;
