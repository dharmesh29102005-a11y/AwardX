-- Organization-level third-party integrations (e.g. Resend for transactional email)
create table if not exists public.organization_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider varchar not null check (provider in ('resend')),
  api_key_encrypted text,
  config jsonb not null default '{}'::jsonb,
  connected boolean not null default false,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_integrations_org_provider_unique unique (organization_id, provider)
);

create index if not exists idx_organization_integrations_org_id
  on public.organization_integrations(organization_id);

alter table public.organization_integrations enable row level security;

drop policy if exists "organization_integrations_org" on public.organization_integrations;
create policy "organization_integrations_org"
  on public.organization_integrations for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));
