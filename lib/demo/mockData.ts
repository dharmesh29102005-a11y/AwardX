import type { Category, Judge, JudgeGroup, Organization, Program, Round, Submission, TeamMember } from '../../services/models';
import type { Round as ScheduleRound, RoundEdge } from '../../types/scheduleRounds';

export const DEMO_ORG_ID = 'demo-org-1';
export const DEMO_PROGRAM_ID = 'demo-program-1';
export const DEMO_FORM_ID = 'demo-form-1';

export const DEMO_ORGANIZATION: Organization = {
  id: DEMO_ORG_ID,
  name: 'Acme Foundation',
  slug: 'acme-foundation',
  industry: 'Nonprofit',
  plan: 'Pro',
  eventCount: 1,
};

export const createDemoProgram = (status: Program['status'] = 'Draft'): Program => ({
  id: DEMO_PROGRAM_ID,
  title: 'Innovation Awards 2026',
  category: 'Technology',
  type: 'Award',
  status,
  deadline: '2026-09-30',
  entriesCount: 10,
  description: 'Celebrating breakthrough ideas in science, design, and social impact.',
  slug: 'innovation-awards-2026',
  visibility: 'Public',
  timezone: 'America/New_York',
  activeFormId: DEMO_FORM_ID,
});

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', title: 'Science & Research', programId: DEMO_PROGRAM_ID, parentId: null, entriesCount: 3 },
  { id: 'cat-2', title: 'Product Design', programId: DEMO_PROGRAM_ID, parentId: null, entriesCount: 2 },
  { id: 'cat-3', title: 'Social Impact', programId: DEMO_PROGRAM_ID, parentId: null, entriesCount: 2 },
  { id: 'cat-4', title: 'Emerging Tech', programId: DEMO_PROGRAM_ID, parentId: 'cat-1', entriesCount: 1 },
  { id: 'cat-5', title: 'Climate Solutions', programId: DEMO_PROGRAM_ID, parentId: 'cat-3', entriesCount: 1 },
  { id: 'cat-6', title: 'Healthcare Innovation', programId: DEMO_PROGRAM_ID, parentId: null, entriesCount: 1 },
];

export const DEMO_LEGACY_ROUNDS: Round[] = [
  {
    id: 'round-1',
    programId: DEMO_PROGRAM_ID,
    title: 'Submission Intake',
    type: 'Submission',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'round-2',
    programId: DEMO_PROGRAM_ID,
    title: 'Jury Review',
    type: 'Judging',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'Upcoming',
  },
  {
    id: 'round-3',
    programId: DEMO_PROGRAM_ID,
    title: 'Public Vote',
    type: 'Voting',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    status: 'Upcoming',
  },
  {
    id: 'round-4',
    programId: DEMO_PROGRAM_ID,
    title: 'Finals Announcement',
    type: 'Announcement',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    status: 'Upcoming',
  },
];

const now = new Date().toISOString();

export const DEMO_SCHEDULE_ROUNDS: ScheduleRound[] = [
  {
    id: 'round-1',
    programId: DEMO_PROGRAM_ID,
    name: 'Submission Intake',
    type: 'jury',
    description: 'Collect and validate all entrant submissions.',
    evaluationLogic: 'none',
    evaluatorStrategy: 'all_judges',
    blindEvaluation: false,
    startCondition: { type: 'manual_trigger' },
    endCondition: { type: 'manual_close' },
    shortlistConfig: { enabled: false, method: 'percentage', value: 50, visibility: ['admin'] },
    order: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    version: 1,
  },
  {
    id: 'round-2',
    programId: DEMO_PROGRAM_ID,
    name: 'Jury Review',
    type: 'jury',
    description: 'Expert panel scores shortlisted entries.',
    evaluationLogic: 'scoring',
    evaluatorStrategy: 'assigned_judges',
    blindEvaluation: true,
    startCondition: { type: 'after_previous', roundId: 'round-1' },
    endCondition: { type: 'manual_close' },
    shortlistConfig: { enabled: true, method: 'percentage', value: 30, visibility: ['admin', 'judges'] },
    order: 1,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
    version: 1,
  },
  {
    id: 'round-3',
    programId: DEMO_PROGRAM_ID,
    name: 'Public Vote',
    type: 'public',
    description: 'Community voting on top finalists.',
    evaluationLogic: 'voting',
    evaluatorStrategy: 'all_judges',
    blindEvaluation: false,
    startCondition: { type: 'after_previous', roundId: 'round-2' },
    endCondition: { type: 'manual_close' },
    shortlistConfig: { enabled: true, method: 'fixed_count', value: 5, visibility: ['public'] },
    order: 2,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
    version: 1,
  },
  {
    id: 'round-4',
    programId: DEMO_PROGRAM_ID,
    name: 'Finals Announcement',
    type: 'Announce',
    description: 'Winners revealed and published.',
    evaluationLogic: 'none',
    evaluatorStrategy: 'all_judges',
    blindEvaluation: false,
    startCondition: { type: 'after_previous', roundId: 'round-3' },
    endCondition: { type: 'manual_close' },
    shortlistConfig: { enabled: false, method: 'percentage', value: 100, visibility: ['public'] },
    order: 3,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
    version: 1,
  },
];

export const DEMO_SCHEDULE_EDGES: RoundEdge[] = [
  {
    id: 'edge-1',
    programId: DEMO_PROGRAM_ID,
    sourceRoundId: 'round-1',
    targetRoundId: 'round-2',
    condition: { type: 'always' },
    order: 0,
    createdAt: now,
  },
  {
    id: 'edge-2',
    programId: DEMO_PROGRAM_ID,
    sourceRoundId: 'round-2',
    targetRoundId: 'round-3',
    condition: { type: 'if_shortlisted' },
    order: 0,
    createdAt: now,
  },
  {
    id: 'edge-3',
    programId: DEMO_PROGRAM_ID,
    sourceRoundId: 'round-3',
    targetRoundId: 'round-4',
    condition: { type: 'always' },
    order: 0,
    createdAt: now,
  },
];

export const DEMO_JUDGES: Judge[] = [
  {
    id: 'judge-1',
    name: 'Dr. Sarah Chen',
    avatar: '',
    email: 'sarah.chen@example.com',
    status: 'Active',
    progress: 75,
    assignedCount: 8,
    completedCount: 6,
    role: 'Lead Judge',
    groupId: 'group-1',
  },
  {
    id: 'judge-2',
    name: 'Marcus Webb',
    avatar: '',
    email: 'marcus.webb@example.com',
    status: 'Active',
    progress: 60,
    assignedCount: 5,
    completedCount: 3,
    groupId: 'group-1',
  },
  {
    id: 'judge-3',
    name: 'Elena Rodriguez',
    avatar: '',
    email: 'elena.r@example.com',
    status: 'Invited',
    progress: 0,
    assignedCount: 0,
    completedCount: 0,
    groupId: 'group-1',
  },
  {
    id: 'judge-4',
    name: 'James Okonkwo',
    avatar: '',
    email: 'j.okonkwo@example.com',
    status: 'Active',
    progress: 90,
    assignedCount: 10,
    completedCount: 9,
    groupId: 'group-1',
  },
];

export const DEMO_JUDGE_GROUPS: JudgeGroup[] = [
  {
    id: 'group-1',
    programId: DEMO_PROGRAM_ID,
    name: 'Expert Panel',
    description: 'Core judging group for all categories.',
    judgeCount: 4,
    createdAt: now,
  },
];

export const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    memberId: 'member-1',
    userId: 'demo-user-1',
    name: 'Alex Morgan',
    email: 'alex@acmefoundation.org',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Today',
    avatar: '',
    joinedDate: '2025-01-15',
    programScope: 'organization',
  },
];

export const DEMO_FORM = {
  id: DEMO_FORM_ID,
  program_id: DEMO_PROGRAM_ID,
  title: 'Innovation Awards Entry Form',
  description: 'Submit your project for consideration.',
  is_active: true,
  pages: [{ id: 'page-1', title: 'Application', order: 0 }],
  theme: { primaryColor: '#4f46e5', backgroundColor: '#ffffff' },
  created_at: now,
  updated_at: now,
};

export const DEMO_FORM_FIELDS = [
  { id: 'field-1', form_id: DEMO_FORM_ID, label: 'Project Title', type: 'text', required: true, sort_order: 0, page_id: 'page-1' },
  { id: 'field-2', form_id: DEMO_FORM_ID, label: 'Team / Organization', type: 'text', required: true, sort_order: 1, page_id: 'page-1' },
  { id: 'field-3', form_id: DEMO_FORM_ID, label: 'Award Category', type: 'select', required: true, sort_order: 2, page_id: 'page-1', options: ['Science & Research', 'Product Design', 'Social Impact'] },
  { id: 'field-4', form_id: DEMO_FORM_ID, label: 'Project Summary', type: 'textarea', required: true, sort_order: 3, page_id: 'page-1' },
  { id: 'field-5', form_id: DEMO_FORM_ID, label: 'Problem Statement', type: 'textarea', required: false, sort_order: 4, page_id: 'page-1' },
  { id: 'field-6', form_id: DEMO_FORM_ID, label: 'Demo Video URL', type: 'url', required: false, sort_order: 5, page_id: 'page-1' },
  { id: 'field-7', form_id: DEMO_FORM_ID, label: 'Supporting Documents', type: 'file', required: false, sort_order: 6, page_id: 'page-1' },
  { id: 'field-8', form_id: DEMO_FORM_ID, label: 'How did you hear about us?', type: 'select', required: false, sort_order: 7, page_id: 'page-1', options: ['Website', 'Social Media', 'Referral', 'Conference'] },
];

export const DEMO_SUBMISSIONS: Submission[] = [
  { id: 'sub-1', title: 'NeuralPath Diagnostics', applicantName: 'Dr. Priya Sharma', applicant: 'Dr. Priya Sharma', category: 'Healthcare Innovation', categoryId: 'cat-6', status: 'Accepted', score: 92, date: '2026-03-12', submittedAt: '2026-03-12', votes: 0 },
  { id: 'sub-2', title: 'EcoGrid Battery Network', applicantName: 'GreenLoop Labs', applicant: 'GreenLoop Labs', category: 'Climate Solutions', categoryId: 'cat-5', status: 'Shortlisted', score: 88, date: '2026-03-14', submittedAt: '2026-03-14', votes: 12 },
  { id: 'sub-3', title: 'OpenSource CAD Toolkit', applicantName: 'Maya Lin', applicant: 'Maya Lin', category: 'Product Design', categoryId: 'cat-2', status: 'Under Review', score: 76, date: '2026-03-15', submittedAt: '2026-03-15', votes: 0 },
  { id: 'sub-4', title: 'Quantum Sensor Array', applicantName: 'NexGen Research', applicant: 'NexGen Research', category: 'Emerging Tech', categoryId: 'cat-4', status: 'Shortlisted', score: 85, date: '2026-03-16', submittedAt: '2026-03-16', votes: 8 },
  { id: 'sub-5', title: 'Community Food Hub App', applicantName: 'Urban Harvest Co.', applicant: 'Urban Harvest Co.', category: 'Social Impact', categoryId: 'cat-3', status: 'Pending', score: null, date: '2026-03-18', submittedAt: '2026-03-18', votes: 0 },
  { id: 'sub-6', title: 'BioPrint Organ Scaffolds', applicantName: 'CellForge Inc.', applicant: 'CellForge Inc.', category: 'Science & Research', categoryId: 'cat-1', status: 'Under Review', score: 81, date: '2026-03-19', submittedAt: '2026-03-19', votes: 0 },
  { id: 'sub-7', title: 'Accessible Transit Map', applicantName: 'MoveTogether', applicant: 'MoveTogether', category: 'Social Impact', categoryId: 'cat-3', status: 'Rejected', score: 54, date: '2026-03-20', submittedAt: '2026-03-20', votes: 0 },
  { id: 'sub-8', title: 'Smart Irrigation Controller', applicantName: 'AquaSense', applicant: 'AquaSense', category: 'Climate Solutions', categoryId: 'cat-5', status: 'Pending', score: null, date: '2026-03-21', submittedAt: '2026-03-21', votes: 0 },
  { id: 'sub-9', title: 'Modular Learning Platform', applicantName: 'EduFlow', applicant: 'EduFlow', category: 'Product Design', categoryId: 'cat-2', status: 'Accepted', score: 90, date: '2026-03-22', submittedAt: '2026-03-22', votes: 15 },
  { id: 'sub-10', title: 'CRISPR Screening Pipeline', applicantName: 'GeneWorks', applicant: 'GeneWorks', category: 'Science & Research', categoryId: 'cat-1', status: 'Under Review', score: 79, date: '2026-03-23', submittedAt: '2026-03-23', votes: 0 },
];

export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Alex Morgan',
  email: 'alex@acmefoundation.org',
  role: 'Admin',
  status: 'Active' as const,
  lastActive: 'Now',
  avatar: '',
  joinedDate: '2025-01-15',
};
