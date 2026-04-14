-- Form nomination controls and submission defaults
-- Run this in Supabase SQL editor.

alter table public.program_forms
  add column if not exists allow_multiple_nominations boolean not null default false,
  add column if not exists max_nominations_per_person integer not null default 1,
  add column if not exists auto_accept_submissions boolean not null default true;

update public.program_forms
set max_nominations_per_person = 1
where max_nominations_per_person < 1;

alter table public.program_forms
  drop constraint if exists program_forms_max_nominations_per_person_check;

alter table public.program_forms
  add constraint program_forms_max_nominations_per_person_check
  check (max_nominations_per_person >= 1);

-- Helps nomination limit checks by person and form
create index if not exists idx_submissions_program_applicant_form
  on public.submissions (program_id, applicant_id)
  where submission_data ? 'form_id';

create index if not exists idx_submissions_program_email_form
  on public.submissions (program_id, lower(coalesce(applicant_email, '')))
  where submission_data ? 'form_id';

-- Speeds jsonb containment checks on submission_data
create index if not exists idx_submissions_submission_data_gin
  on public.submissions using gin (submission_data);

-- Additional latency optimizations for common dashboard queries
create index if not exists idx_organization_members_user_joined
  on public.organization_members (user_id, joined_at desc);

create index if not exists idx_programs_organization_id
  on public.programs (organization_id);

create index if not exists idx_submissions_program_submitted_at
  on public.submissions (program_id, submitted_at desc);

create index if not exists idx_submission_judges_submission_round
  on public.submission_judges (submission_id, round_id);
