-- Short-lived OAuth / connect session state for third-party integrations
create table if not exists public.integration_connect_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  provider varchar not null check (provider in ('razorpay', 'resend')),
  state varchar not null unique,
  program_id uuid references public.programs(id) on delete cascade,
  step varchar not null default 'started',
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_integration_connect_sessions_state
  on public.integration_connect_sessions(state);

create index if not exists idx_integration_connect_sessions_expires
  on public.integration_connect_sessions(expires_at);

alter table public.integration_connect_sessions enable row level security;

drop policy if exists "integration_connect_sessions_own" on public.integration_connect_sessions;
create policy "integration_connect_sessions_own"
  on public.integration_connect_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
