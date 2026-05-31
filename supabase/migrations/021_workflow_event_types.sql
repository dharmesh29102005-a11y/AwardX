-- Replace legacy event type templates with six workflow-specific program templates

-- Deactivate legacy program templates
UPDATE public.program_templates
SET is_active = false
WHERE event_type_id IN (
  SELECT id FROM public.event_types
  WHERE name IN (
    'Award', 'Competition', 'Grant', 'Residency', 'Commission',
    'Exhibition', 'Fair', 'Internal Event'
  )
);

-- Insert new event types
INSERT INTO public.event_types (name, icon, description, category) VALUES
  ('Accelerator & Incubator Programs', 'Rocket', 'Multi-stage startup evaluation with entry collaboration for co-founder teams.', 'Programs'),
  ('Grants & Funding', 'HandCoins', 'Grant applications with multi-stage review, compliance, and COI management.', 'Programs'),
  ('Academic Admissions', 'GraduationCap', 'Student admissions with blind references, academic records, and committee review.', 'Programs'),
  ('Abstracts & Journals', 'BookOpen', 'Abstract and manuscript submission with peer review and editorial decisions.', 'Programs'),
  ('Personnel & Fellowships', 'UserCheck', 'Nomination and fellowship selection with endorsement and executive review.', 'Programs'),
  ('Creative Contests', 'Palette', 'Video, photography, and design contests with jury scoring and public voting.', 'Programs')
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Deactivate any prior templates for the new event types (idempotent re-runs)
UPDATE public.program_templates
SET is_active = false
WHERE event_type_id IN (
  SELECT id FROM public.event_types
  WHERE name IN (
    'Accelerator & Incubator Programs', 'Grants & Funding', 'Academic Admissions',
    'Abstracts & Journals', 'Personnel & Fellowships', 'Creative Contests', 'Other'
  )
);

-- Accelerator & Incubator Programs template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Accelerator & Incubator Programs',
  'Team collaboration through idea pitch, validation, financials, expert review, demo day, and graduation.',
  'Rocket',
  et.id,
  '[
    {"title":"Team Registration & Collaboration","type":"Submission","description":"Multi-founder registration and collaborative workspace for co-founders.","startOffsetDays":-90,"durationDays":30},
    {"title":"Idea Submission","type":"Submission","description":"Elevator pitch, problem statement, solution overview, and video pitch upload.","startOffsetDays":-60,"durationDays":30},
    {"title":"Initial Screening","type":"Judging","description":"Eligibility checks and first-pass evaluation of startup ideas.","startOffsetDays":0,"durationDays":14,"reviewerCount":3},
    {"title":"Business Validation","type":"Judging","description":"Business Model Canvas, market research, competitor analysis, and customer validation.","startOffsetDays":14,"durationDays":21,"reviewerCount":4},
    {"title":"Financial Assessment","type":"Judging","description":"Revenue model, financial forecasting, cash flow projections, and funding requirements.","startOffsetDays":35,"durationDays":14,"reviewerCount":3},
    {"title":"Expert Review & Due Diligence","type":"Judging","description":"Legal verification, founder background checks, IP and company registration validation.","startOffsetDays":49,"durationDays":14,"reviewerCount":5},
    {"title":"Incubation & Mentor Matching","type":"Judging","description":"Mentor assignment, milestone tracking, and incubation program progress.","startOffsetDays":63,"durationDays":28},
    {"title":"Demo Day","type":"Judging","description":"Pitch presentations, live scoring, and investor connect sessions.","startOffsetDays":91,"durationDays":7,"reviewerCount":5},
    {"title":"Graduation","type":"Announcement","description":"Program completion, graduation readiness assessment, and cohort outcomes.","startOffsetDays":98,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":3,"idealReviewersPerEntry":5,"totalJuryPoolSize":20,"blindReview":false,"scoreNormalization":true,"scoringScale":"1-10"},"features":["entry_collaboration"]}'::jsonb,
  true, 1
FROM public.event_types et
WHERE et.name = 'Accelerator & Incubator Programs';

-- Grants & Funding template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Grants & Funding',
  'Application intake through screening, technical, financial, compliance, and final approval.',
  'HandCoins',
  et.id,
  '[
    {"title":"Application Period","type":"Submission","description":"Grant applications with eligibility screening and conditional form logic.","startOffsetDays":-120,"durationDays":120},
    {"title":"Eligibility Screening","type":"Judging","description":"Initial screening with budget validation and eligibility-based routing.","startOffsetDays":0,"durationDays":14,"reviewerCount":3},
    {"title":"Technical Review","type":"Judging","description":"Technical merit assessment and impact scoring by assigned reviewers.","startOffsetDays":14,"durationDays":21,"reviewerCount":4},
    {"title":"Financial Review","type":"Judging","description":"Budget assessment, cost-benefit analysis, and funding recommendation scores.","startOffsetDays":35,"durationDays":14,"reviewerCount":3},
    {"title":"Compliance & COI Review","type":"Judging","description":"Conflict-of-interest checks, compliance controls, and audit trail validation.","startOffsetDays":49,"durationDays":14,"reviewerCount":3},
    {"title":"Final Approval Committee","type":"Judging","description":"Committee review, consensus scoring, and final funding decisions.","startOffsetDays":63,"durationDays":7,"reviewerCount":5},
    {"title":"Funding Notification","type":"Announcement","description":"Grant recipients notified and funding disbursement initiated.","startOffsetDays":70,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":3,"idealReviewersPerEntry":5,"totalJuryPoolSize":25,"blindReview":false,"scoreNormalization":true,"scoringScale":"1-10"}}'::jsonb,
  true, 2
FROM public.event_types et
WHERE et.name = 'Grants & Funding';

-- Academic Admissions template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Academic Admissions',
  'Application through document verification, references, academic review, and admissions committee.',
  'GraduationCap',
  et.id,
  '[
    {"title":"Application Period","type":"Submission","description":"Student applications with document upload and academic record submission.","startOffsetDays":-90,"durationDays":90},
    {"title":"Document Verification","type":"Judging","description":"Transcript validation, qualification checks, and missing document follow-up.","startOffsetDays":0,"durationDays":14,"reviewerCount":2},
    {"title":"Reference Collection","type":"Judging","description":"Blind reference letter management with secure referee submission links.","startOffsetDays":14,"durationDays":21},
    {"title":"Academic Record Review","type":"Judging","description":"GPA evaluation, subject-wise grade validation, and rubric-based scoring.","startOffsetDays":35,"durationDays":14,"reviewerCount":3},
    {"title":"Department Review","type":"Judging","description":"Department-specific evaluation and multi-stage shortlisting.","startOffsetDays":49,"durationDays":14,"reviewerCount":3},
    {"title":"Admissions Committee","type":"Judging","description":"Committee consensus scoring, ranking, and final admission decisions.","startOffsetDays":63,"durationDays":7,"reviewerCount":5},
    {"title":"Decision Release","type":"Announcement","description":"Admission decisions communicated to applicants.","startOffsetDays":70,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":2,"idealReviewersPerEntry":3,"totalJuryPoolSize":15,"blindReview":true,"scoreNormalization":true,"scoringScale":"1-10"}}'::jsonb,
  true, 3
FROM public.event_types et
WHERE et.name = 'Academic Admissions';

-- Abstracts & Journals template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Abstracts & Journals',
  'Submission through compliance, plagiarism screening, peer review, and publication.',
  'BookOpen',
  et.id,
  '[
    {"title":"Abstract & Manuscript Submission","type":"Submission","description":"Abstract, manuscript, and supplementary file submission with draft saving.","startOffsetDays":-60,"durationDays":60},
    {"title":"Formatting & Compliance Check","type":"Judging","description":"Word count enforcement, template compliance, and mandatory field verification.","startOffsetDays":0,"durationDays":7,"reviewerCount":2},
    {"title":"Plagiarism Screening","type":"Judging","description":"Similarity score generation and threshold-based flagging for editorial review.","startOffsetDays":7,"durationDays":7},
    {"title":"Double-Blind Peer Review","type":"Judging","description":"Anonymized manuscripts reviewed by matched experts with conflict-of-interest checks.","startOffsetDays":14,"durationDays":21,"reviewerCount":3},
    {"title":"Editorial Decision","type":"Judging","description":"Editor triage and decision workflow: accept, minor/major revision, or reject.","startOffsetDays":35,"durationDays":7,"reviewerCount":2},
    {"title":"Revision Round","type":"Submission","description":"Authors submit revised manuscripts based on reviewer feedback.","startOffsetDays":42,"durationDays":14},
    {"title":"Publication","type":"Announcement","description":"Final manuscript collection, metadata export, and publication scheduling.","startOffsetDays":56,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":2,"idealReviewersPerEntry":3,"totalJuryPoolSize":20,"blindReview":true,"scoreNormalization":true,"scoringScale":"1-7"}}'::jsonb,
  true, 4
FROM public.event_types et
WHERE et.name = 'Abstracts & Journals';

-- Personnel & Fellowships template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Personnel & Fellowships',
  'Nomination through endorsement, eligibility, blind review, committee, and executive review.',
  'UserCheck',
  et.id,
  '[
    {"title":"Nomination Period","type":"Submission","description":"Nomination submissions with third-party nomination and endorser management.","startOffsetDays":-90,"durationDays":90},
    {"title":"Nominee Endorsement","type":"Submission","description":"Nominee acceptance, consent tracking, and collaborative application completion.","startOffsetDays":0,"durationDays":21},
    {"title":"Eligibility Validation","type":"Judging","description":"Eligibility checks, CV review, and supporting document verification.","startOffsetDays":21,"durationDays":14,"reviewerCount":3},
    {"title":"Blind Review","type":"Judging","description":"Rubric-based evaluation with conflict-of-interest detection and scorecards.","startOffsetDays":35,"durationDays":21,"reviewerCount":4},
    {"title":"Committee Deliberation","type":"Judging","description":"Committee discussion workspace, consensus scoring, and shortlist generation.","startOffsetDays":56,"durationDays":7,"reviewerCount":5},
    {"title":"Executive Review","type":"Judging","description":"Executive briefing, candidate comparison, and final approval workflows.","startOffsetDays":63,"durationDays":7,"reviewerCount":3},
    {"title":"Fellowship Announcement","type":"Announcement","description":"Selected fellows notified and selection outcomes published.","startOffsetDays":70,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":3,"idealReviewersPerEntry":5,"totalJuryPoolSize":15,"blindReview":true,"scoreNormalization":true,"scoringScale":"1-10"}}'::jsonb,
  true, 5
FROM public.event_types et
WHERE et.name = 'Personnel & Fellowships';

-- Creative Contests template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Creative Contests',
  'Submission through validation, jury evaluation, public voting, and winner announcement.',
  'Palette',
  et.id,
  '[
    {"title":"Submission Period","type":"Submission","description":"Multi-format uploads for video, photography, design files, and portfolios.","startOffsetDays":-60,"durationDays":60},
    {"title":"File Validation & Gallery Preview","type":"Judging","description":"Format checking, gallery curation, and side-by-side comparison setup.","startOffsetDays":0,"durationDays":7,"reviewerCount":2},
    {"title":"Jury Evaluation","type":"Judging","description":"Blind rubric-based scoring with weighted criteria and judge feedback.","startOffsetDays":7,"durationDays":14,"reviewerCount":5},
    {"title":"Public Voting","type":"Voting","description":"Audience voting with fraud detection, vote auditing, and real-time leaderboards.","startOffsetDays":21,"durationDays":14},
    {"title":"Final Scoring & Winner Selection","type":"Judging","description":"Combined jury and public scores with tie-breaking and winner selection.","startOffsetDays":35,"durationDays":7,"reviewerCount":5},
    {"title":"Winner Announcement","type":"Announcement","description":"Winners announced with certificates, prizes, and public showcase pages.","startOffsetDays":42,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":3,"idealReviewersPerEntry":5,"totalJuryPoolSize":20,"blindReview":true,"scoreNormalization":true,"scoringScale":"1-10"}}'::jsonb,
  true, 6
FROM public.event_types et
WHERE et.name = 'Creative Contests';

-- Other / Custom template
INSERT INTO public.program_templates (title, description, icon, event_type_id, default_rounds, default_criteria, is_active, sort_order)
SELECT
  'Custom Event',
  'Build a custom process from scratch.',
  'Sparkles',
  et.id,
  '[
    {"title":"Submission Period","type":"Submission","description":"Open submissions for entries.","startOffsetDays":-60,"durationDays":60},
    {"title":"Initial Review","type":"Judging","description":"First round of evaluation and scoring.","startOffsetDays":0,"durationDays":14,"reviewerCount":3},
    {"title":"Final Review","type":"Judging","description":"Final evaluation and selection.","startOffsetDays":14,"durationDays":7,"reviewerCount":5},
    {"title":"Results Announcement","type":"Announcement","description":"Winners and results announced.","startOffsetDays":21,"durationDays":1}
  ]'::jsonb,
  '{"judgingConfig":{"minReviewersPerEntry":3,"idealReviewersPerEntry":5,"totalJuryPoolSize":15,"blindReview":true,"scoreNormalization":true,"scoringScale":"1-7"}}'::jsonb,
  true, 7
FROM public.event_types et
WHERE et.name = 'Other';
