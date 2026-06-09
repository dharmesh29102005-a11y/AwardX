import type { PaginatedResult } from './database';
import type { Category, Judge, JudgeGroup, Organization, Program, Round, Submission, TeamMember } from './models';
import type { Round as ScheduleRound, RoundEdge } from '../types/scheduleRounds';
import {
  DEMO_CATEGORIES,
  DEMO_FORM,
  DEMO_FORM_FIELDS,
  DEMO_FORM_ID,
  DEMO_JUDGE_GROUPS,
  DEMO_JUDGES,
  DEMO_LEGACY_ROUNDS,
  DEMO_ORGANIZATION,
  DEMO_PROGRAM_ID,
  DEMO_SCHEDULE_EDGES,
  DEMO_SCHEDULE_ROUNDS,
  DEMO_SUBMISSIONS,
  DEMO_TEAM_MEMBERS,
  DEMO_USER,
  createDemoProgram,
} from '../lib/demo/mockData';

type DemoState = {
  organization: Organization;
  program: Program;
};

let state: DemoState = {
  organization: DEMO_ORGANIZATION,
  program: createDemoProgram('Draft'),
};

export function resetDemoState(): void {
  state = {
    organization: DEMO_ORGANIZATION,
    program: createDemoProgram('Draft'),
  };
}

export function getDemoState(): DemoState {
  return state;
}

export function getDemoOrganization(): Organization {
  return state.organization;
}

export function getDemoProgram(): Program {
  return state.program;
}

export function updateDemoProgram(program: Program): Program {
  state.program = { ...program };
  return state.program;
}

export function getDemoUserOrganizations(): Organization[] {
  return [state.organization];
}

export function getDemoPrograms(): Program[] {
  return [state.program];
}

export function getDemoProgramById(id: string): Program | undefined {
  return id === state.program.id ? state.program : undefined;
}

export function getDemoCategories(_programId: string): Category[] {
  return DEMO_CATEGORIES;
}

export function getDemoRounds(_programId: string): Round[] {
  return DEMO_LEGACY_ROUNDS;
}

export function getDemoScheduleRounds(_programId: string): ScheduleRound[] {
  return DEMO_SCHEDULE_ROUNDS;
}

export function getDemoScheduleEdges(_programId: string): RoundEdge[] {
  return DEMO_SCHEDULE_EDGES;
}

export function getDemoJudges(_programId?: string): Judge[] {
  return DEMO_JUDGES;
}

export function getDemoJudgeGroups(_programId: string): JudgeGroup[] {
  return DEMO_JUDGE_GROUPS;
}

export function getDemoTeamMembers(_programId?: string): TeamMember[] {
  return DEMO_TEAM_MEMBERS;
}

export function getDemoForms(_programId: string) {
  return _programId === DEMO_PROGRAM_ID ? [DEMO_FORM] : [];
}

export function getDemoFormFields(formId: string) {
  return formId === DEMO_FORM_ID ? DEMO_FORM_FIELDS : [];
}

export function getDemoActiveFormForProgram(_programId: string): string | null {
  return DEMO_FORM_ID;
}

export function getDemoSubmissions(_programId?: string): Submission[] {
  if (_programId && _programId !== DEMO_PROGRAM_ID) return [];
  return DEMO_SUBMISSIONS.map((s) => ({
    ...s,
    image: s.image || `https://picsum.photos/seed/${encodeURIComponent(s.id)}/50/50`,
  }));
}

export function getDemoSubmissionsPaginated(options?: {
  programId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}): PaginatedResult<Submission> {
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.max(1, Math.min(100, options?.pageSize || 20));

  if (!options?.programId || options.programId !== DEMO_PROGRAM_ID) {
    return { items: [], total: 0, page, pageSize, hasMore: false };
  }

  let items = getDemoSubmissions(options.programId);
  const search = options?.search?.trim().toLowerCase();
  if (search) {
    items = items.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        (s.applicantName || s.applicant || '').toLowerCase().includes(search) ||
        s.category.toLowerCase().includes(search),
    );
  }

  const total = items.length;
  const offset = (page - 1) * pageSize;
  const pageItems = items.slice(offset, offset + pageSize);

  return {
    items: pageItems,
    total,
    page,
    pageSize,
    hasMore: offset + pageSize < total,
  };
}

export function getDemoNotifications() {
  return [];
}

export function getDemoRoles() {
  return [
    { id: 'role-1', name: 'Admin', permissions: ['all'], usersCount: 1, color: '#4f46e5' },
  ];
}

export function getDemoLogs() {
  return [
    {
      id: 'log-1',
      action: 'Created program',
      user: 'Alex Morgan',
      userAvatar: '',
      details: 'Innovation Awards 2026',
      timestamp: new Date().toLocaleString(),
      type: 'create' as const,
    },
  ];
}

export function getDemoCurrentUser() {
  return DEMO_USER;
}
