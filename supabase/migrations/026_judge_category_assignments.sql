begin;

create table if not exists public.judge_category_assignments (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid not null references public.judges(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique (judge_id, category_id)
);

alter table public.judge_category_assignments enable row level security;

drop policy if exists judge_category_assignments_org_member_rw on public.judge_category_assignments;
create policy judge_category_assignments_org_member_rw
  on public.judge_category_assignments
  for all
  using (
    exists (
      select 1
      from public.judges j
      join public.programs p on p.id = j.program_id
      join public.organization_members om on om.organization_id = p.organization_id
      where j.id = judge_category_assignments.judge_id
        and om.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.judges j
      join public.categories c on c.id = judge_category_assignments.category_id
      join public.programs p on p.id = j.program_id
      join public.organization_members om on om.organization_id = p.organization_id
      where j.id = judge_category_assignments.judge_id
        and c.program_id = j.program_id
        and om.user_id = auth.uid()
    )
  );

create index if not exists idx_judge_category_assignments_judge
  on public.judge_category_assignments(judge_id);

create index if not exists idx_judge_category_assignments_category
  on public.judge_category_assignments(category_id);

commit;
