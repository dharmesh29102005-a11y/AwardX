export type DemoStepAction =
  | { type: 'navigate'; view: string }
  | { type: 'click'; target: string }
  | { type: 'move'; target: string; duration?: number }
  | { type: 'event'; detail: string; waitMs?: number }
  | { type: 'wait'; ms: number }
  | { type: 'highlight'; target?: string; duration: number }
  | { type: 'scroll'; target: string };

export interface DemoStep {
  id: string;
  title: string;
  caption: string;
  actions: DemoStepAction[];
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    caption:
      'AwardX is your operations hub for awards, grants, and competitions — one place to design your program, collect entries, run judging, and announce winners.',
    actions: [
      { type: 'navigate', view: 'overview' },
      { type: 'highlight', target: 'main-content', duration: 3200 },
    ],
  },
  {
    id: 'schedule-rounds-tiles',
    title: 'Schedule & Rounds — Tiles',
    caption:
      'Start with the tile sequence: each round is a card in order — Submission Intake, Jury Review, Public Vote, and Finals. Drag cards to reorder; advancement rules and connections stay in sync.',
    actions: [
      { type: 'click', target: 'nav-schedule-rounds' },
      { type: 'wait', ms: 700 },
      { type: 'event', detail: 'schedule-tiles-view', waitMs: 600 },
      { type: 'highlight', target: 'schedule-tiles-canvas', duration: 2800 },
      { type: 'move', target: 'schedule-tile-round-1', duration: 1400 },
      { type: 'highlight', target: 'schedule-tiles-canvas', duration: 2400 },
    ],
  },
  {
    id: 'schedule-rounds-workflow',
    title: 'Schedule & Rounds — Diagram',
    caption:
      'The block diagram shows the same pipeline on a spatial canvas. Connect rounds with branches, inspect conditions on each edge, and see exactly how entries move from intake through judging to the final announcement.',
    actions: [
      { type: 'event', detail: 'schedule-workflow-view', waitMs: 800 },
      { type: 'highlight', target: 'schedule-workflow-canvas', duration: 2800 },
      { type: 'move', target: 'schedule-round-node-1', duration: 1200 },
      { type: 'event', detail: 'schedule-select-first-round', waitMs: 400 },
      { type: 'move', target: 'schedule-add-round', duration: 1200 },
      { type: 'highlight', target: 'schedule-workflow-canvas', duration: 2600 },
    ],
  },
  {
    id: 'awards-list',
    title: 'Awards — List View',
    caption:
      'Awards and categories open in list view: root tracks like Science & Research and Social Impact, each with nested subcategories. Add categories, expand the tree, and bulk-select entries from a clear card layout.',
    actions: [
      { type: 'click', target: 'nav-awards' },
      { type: 'wait', ms: 700 },
      { type: 'event', detail: 'awards-list-view', waitMs: 600 },
      { type: 'highlight', target: 'awards-list-view', duration: 2800 },
      { type: 'move', target: 'awards-category-card-1', duration: 1400 },
      { type: 'move', target: 'awards-add-category', duration: 1200 },
      { type: 'highlight', target: 'awards-list-view', duration: 2400 },
    ],
  },
  {
    id: 'awards-workflow',
    title: 'Awards — 2D Diagram',
    caption:
      'Switch to the 2D diagram for the same categories as a visual tree. Branch parent awards into specialties, pan and zoom the canvas, and add new tracks as your program scales.',
    actions: [
      { type: 'event', detail: 'awards-workflow-view', waitMs: 600 },
      { type: 'scroll', target: 'awards-workflow-canvas' },
      { type: 'event', detail: 'awards-fit-canvas', waitMs: 900 },
      { type: 'highlight', target: 'awards-workflow-canvas', duration: 2800 },
      { type: 'move', target: 'awards-category-node-1', duration: 1200 },
      { type: 'move', target: 'awards-add-category', duration: 1200 },
      { type: 'highlight', target: 'awards-workflow-canvas', duration: 2600 },
    ],
  },
  {
    id: 'form-builder',
    title: 'Form Builder',
    caption:
      'Build the submission form your entrants actually fill out — drag fields from the toolkit, split across pages, set validation, and match your program branding.',
    actions: [
      { type: 'click', target: 'nav-templates' },
      { type: 'wait', ms: 900 },
      { type: 'event', detail: 'form-open-elements', waitMs: 500 },
      { type: 'move', target: 'form-elements-panel', duration: 1200 },
      { type: 'move', target: 'form-preview-canvas', duration: 1200 },
      { type: 'highlight', target: 'form-preview-canvas', duration: 2800 },
    ],
  },
  {
    id: 'judging',
    title: 'Judging Panel',
    caption:
      'Invite your jury, organize judges into groups, define scorecards, and track who has reviewed what — so you always know when finalists are ready.',
    actions: [
      { type: 'click', target: 'nav-judging' },
      { type: 'wait', ms: 700 },
      { type: 'event', detail: 'judging-panel-tab', waitMs: 600 },
      { type: 'highlight', target: 'judging-panel-area', duration: 2400 },
      { type: 'move', target: 'judging-add-judge', duration: 1000 },
      { type: 'move', target: 'judging-judge-card-1', duration: 1200 },
      { type: 'highlight', target: 'judging-panel-area', duration: 2000 },
    ],
  },
  {
    id: 'publish',
    title: 'Publish',
    caption:
      'When setup is done, publish in one step — your entry form goes live, judges are notified, and submissions start arriving.',
    actions: [
      { type: 'navigate', view: 'overview' },
      { type: 'wait', ms: 600 },
      { type: 'click', target: 'publish-toggle' },
      { type: 'wait', ms: 1200 },
      { type: 'click', target: 'publish-confirm' },
      { type: 'wait', ms: 1800 },
    ],
  },
  {
    id: 'submissions',
    title: 'Submissions',
    caption:
      'Every entry lands in one table — filter by status, open a submission, assign judges, and advance finalists through your round pipeline.',
    actions: [
      { type: 'click', target: 'nav-submissions' },
      { type: 'wait', ms: 800 },
      { type: 'scroll', target: 'demo-submissions-table' },
      { type: 'move', target: 'demo-submission-row-1', duration: 1200 },
      { type: 'highlight', target: 'demo-submissions-table', duration: 3200 },
    ],
  },
  {
    id: 'complete',
    title: 'Ready to launch',
    caption:
      'That covers the full AwardX workflow. Self-host and run your awards on your own infrastructure — your data, your rules, your program.',
    actions: [{ type: 'wait', ms: 3500 }],
  },
];
