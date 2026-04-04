-- Migration 007: Round Pipeline
-- Connects form submissions to rounds, enables advancement tracking

-- 1. Add active_form_id to programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS active_form_id uuid REFERENCES public.program_forms(id);

-- 2. Add advancement columns to rounds
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS advancement_criteria jsonb DEFAULT '{}';
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS advancement_trigger character varying DEFAULT 'manual';
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS is_finalized boolean DEFAULT false;

-- 3. Add round_id to submission_judges (per-round assignments)
ALTER TABLE public.submission_judges ADD COLUMN IF NOT EXISTS round_id uuid REFERENCES public.rounds(id);
CREATE INDEX IF NOT EXISTS idx_submission_judges_round ON public.submission_judges(round_id);

-- 4. Add round_id to judging_criteria (round-scoped criteria)
ALTER TABLE public.judging_criteria ADD COLUMN IF NOT EXISTS round_id uuid REFERENCES public.rounds(id);

-- 5. Extend public_votes for round-scoped voting
ALTER TABLE public.public_votes ADD COLUMN IF NOT EXISTS round_id uuid REFERENCES public.rounds(id);
ALTER TABLE public.public_votes ADD COLUMN IF NOT EXISTS voter_email character varying;
ALTER TABLE public.public_votes ADD COLUMN IF NOT EXISTS voter_name character varying;
CREATE INDEX IF NOT EXISTS idx_public_votes_round ON public.public_votes(round_id);

-- 6. Create round_submissions junction table
CREATE TABLE IF NOT EXISTS public.round_submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  status character varying DEFAULT 'active',
  enrolled_at timestamp with time zone DEFAULT now(),
  advanced_at timestamp with time zone,
  eliminated_at timestamp with time zone,
  elimination_reason text,
  source_round_id uuid REFERENCES public.rounds(id),
  carried_score numeric,
  metadata jsonb DEFAULT '{}',
  CONSTRAINT round_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT round_submissions_unique UNIQUE (round_id, submission_id)
);
CREATE INDEX IF NOT EXISTS idx_round_submissions_round ON public.round_submissions(round_id);
CREATE INDEX IF NOT EXISTS idx_round_submissions_submission ON public.round_submissions(submission_id);
CREATE INDEX IF NOT EXISTS idx_round_submissions_status ON public.round_submissions(status);

-- 7. Create voting_configs table
CREATE TABLE IF NOT EXISTS public.voting_configs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  round_id uuid NOT NULL UNIQUE REFERENCES public.rounds(id) ON DELETE CASCADE,
  votes_per_user integer DEFAULT 1,
  votes_per_submission integer DEFAULT 1,
  require_auth boolean DEFAULT false,
  allow_anonymous boolean DEFAULT true,
  show_results_publicly boolean DEFAULT false,
  show_leaderboard boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT voting_configs_pkey PRIMARY KEY (id)
);

-- 8. Create advancement_events table
CREATE TABLE IF NOT EXISTS public.advancement_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  round_id uuid NOT NULL REFERENCES public.rounds(id),
  target_round_id uuid REFERENCES public.rounds(id),
  trigger_type character varying NOT NULL,
  criteria_used jsonb NOT NULL,
  total_participants integer NOT NULL,
  advanced_count integer NOT NULL,
  eliminated_count integer NOT NULL,
  had_ties boolean DEFAULT false,
  tie_resolution jsonb,
  executed_by uuid REFERENCES public.profiles(id),
  executed_at timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'completed',
  metadata jsonb DEFAULT '{}',
  CONSTRAINT advancement_events_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_advancement_events_round ON public.advancement_events(round_id);

-- 9. Create advancement_details table
CREATE TABLE IF NOT EXISTS public.advancement_details (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  advancement_event_id uuid NOT NULL REFERENCES public.advancement_events(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id),
  outcome character varying NOT NULL,
  rank integer,
  score numeric,
  vote_count integer,
  was_at_cutoff_boundary boolean DEFAULT false,
  override_reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT advancement_details_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_advancement_details_event ON public.advancement_details(advancement_event_id);
CREATE INDEX IF NOT EXISTS idx_advancement_details_submission ON public.advancement_details(submission_id);
