import React, { useEffect, useMemo, useRef, useState } from 'react';
import MiniSearch from 'minisearch';
import {
  Search,
  Book,
  Settings,
  Database,
  Shield,
  Layers,
  Zap,
  Code2,
  Cloud,
  GitBranch,
  Plug,
  Users,
  Mail,
  Webhook,
  FileJson,
  ChevronRight,
  Command,
  X,
  ExternalLink,
  Hash,
  Github,
  BookOpen,
} from 'lucide-react';

// ----- Docs content model -----
type DocBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string; id?: string }
  | { kind: 'code'; lang?: string; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'callout'; tone: 'info' | 'warn' | 'success'; title: string; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] };

type DocSection = {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  blocks: DocBlock[];
};

const sections: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction to AwardX',
    category: 'Getting Started',
    icon: Book,
    description: 'What AwardX is, who it is for, and how the platform is structured.',
    blocks: [
      {
        kind: 'p',
        text: 'AwardX is an open-source operating system for running awards, competitions, hackathons, and recognition programs. It is MIT licensed and shipped as a self-hostable monorepo built on React, TypeScript, Node.js, and PostgreSQL.',
      },
      {
        kind: 'p',
        text: 'The platform covers the full lifecycle of a program — entry collection, multi-round judging with weighted criteria, payments, public voting, and winner announcement — without locking your data into a vendor.',
      },
      {
        kind: 'h3', text: 'Who it is for',
      },
      {
        kind: 'list',
        items: [
          'Industry associations running annual awards',
          'Universities running creative or research competitions',
          'Tech communities organising hackathons and demo days',
          'Media companies hosting film, music, and design festivals',
          'Internal HR teams running employee recognition cycles',
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Three deployment modes',
        text: 'Self-host the open source build, run AwardX Cloud (managed), or fork the repo and ship a white-labelled distribution under your own brand. The same codebase powers all three.',
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture overview',
    category: 'Getting Started',
    icon: Layers,
    description: 'How the web app, API server, queue workers, and database fit together.',
    blocks: [
      { kind: 'p', text: 'AwardX is a TypeScript monorepo. The marketing site and dashboard share a Vite + React frontend, the API runs on Fastify, background work runs on BullMQ, and data lives in Postgres with file storage abstracted behind an S3-compatible interface.' },
      { kind: 'h3', text: 'Top-level packages' },
      {
        kind: 'table',
        headers: ['Package', 'Role', 'Stack'],
        rows: [
          ['apps/web', 'Marketing site + admin dashboard', 'Vite, React 18, Tailwind, Framer Motion'],
          ['apps/api', 'REST + tRPC endpoints', 'Node 20, Fastify, Zod'],
          ['apps/worker', 'Async jobs (email, exports, scoring)', 'BullMQ on Redis'],
          ['packages/db', 'Schema, migrations, query helpers', 'Drizzle ORM, Postgres'],
          ['packages/plugins', 'Plugin SDK and core plugins', 'TypeScript, Zod'],
          ['packages/ui', 'Shared component library', 'React, Radix, Tailwind'],
        ],
      },
      { kind: 'h3', text: 'Request lifecycle' },
      {
        kind: 'list',
        items: [
          'Browser hits apps/web served by the React Router shell.',
          'Authenticated calls route to apps/api via /api/* — JWT verified on every request.',
          'Long-running work (PDF export, scoring rollup, email blast) is enqueued on Redis and picked up by apps/worker.',
          'Files (logos, submission attachments) are streamed to your S3 bucket via signed URLs.',
        ],
      },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration & environment',
    category: 'Setup',
    icon: Settings,
    description: 'Every environment variable AwardX understands.',
    blocks: [
      { kind: 'p', text: 'AwardX is configured entirely through environment variables. The .env.example file in the repo is the canonical reference; below are the variables you almost always need to set in production.' },
      {
        kind: 'table',
        headers: ['Variable', 'Required', 'Purpose'],
        rows: [
          ['DATABASE_URL', 'Yes', 'Postgres connection string (postgres://user:pass@host:5432/awardx)'],
          ['REDIS_URL', 'Yes', 'Redis instance for queues, sessions, and rate limiting'],
          ['JWT_SECRET', 'Yes', '32+ char secret for signing auth tokens'],
          ['STORAGE_BUCKET', 'Yes', 'S3-compatible bucket name for uploads'],
          ['STORAGE_ENDPOINT', 'Optional', 'Set to your MinIO/R2/Wasabi endpoint, blank for AWS S3'],
          ['SMTP_URL', 'Recommended', 'Outbound email transport for invites and notifications'],
          ['PUBLIC_APP_URL', 'Yes', 'Public origin used in invite links and OG metadata'],
        ],
      },
      {
        kind: 'callout',
        tone: 'warn',
        title: 'Never commit secrets',
        text: 'AwardX ships with a pre-commit hook that scans for AWS keys, JWT secrets, and Stripe tokens. Audit before pushing if you suspect a leak.',
      },
    ],
  },
  {
    id: 'database',
    title: 'Database schema & migrations',
    category: 'Setup',
    icon: Database,
    description: 'Drizzle, Postgres, and how to add a column.',
    blocks: [
      { kind: 'p', text: 'AwardX uses Drizzle ORM over Postgres 14+. All schema lives in packages/db/schema and migrations are generated, not hand-written.' },
      { kind: 'h3', text: 'Adding a column' },
      {
        kind: 'code',
        lang: 'bash',
        text: `# 1. Edit packages/db/schema/programs.ts
# 2. Generate a migration file
pnpm db:generate

# 3. Review packages/db/migrations/NNNN_*.sql
# 4. Apply
pnpm db:migrate`,
      },
      { kind: 'h3', text: 'Core tables' },
      {
        kind: 'list',
        items: [
          'organizations — top-level tenant',
          'programs — an awards program belonging to an org',
          'categories — sub-divisions within a program',
          'submissions — entries from nominees',
          'judges, rounds, scores — judging pipeline',
          'contacts — unified people record (users, judges, nominees)',
        ],
      },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication & roles',
    category: 'Setup',
    icon: Shield,
    description: 'JWT, OAuth providers, magic links, and role-based access.',
    blocks: [
      { kind: 'p', text: 'AwardX supports email + password, magic link, and OAuth (Google, GitHub, LinkedIn, Microsoft). Tokens are JWTs signed with JWT_SECRET; sessions are stored in Redis for instant revocation.' },
      { kind: 'h3', text: 'Built-in roles' },
      {
        kind: 'table',
        headers: ['Role', 'Scope', 'Can do'],
        rows: [
          ['Owner', 'Organization', 'Billing, delete org, manage all programs'],
          ['Admin', 'Organization', 'Create programs, invite team, view analytics'],
          ['Program Manager', 'Program', 'Edit one program, manage judges, exports'],
          ['Judge', 'Round', 'Score assigned submissions only'],
          ['Nominee', 'Submission', 'Submit and edit their own entries'],
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Custom roles',
        text: 'Need a "Read-only Auditor" or "Sponsor"? Define custom roles in packages/auth/policies.ts — the policy file is plain TypeScript and hot-reloads in dev.',
      },
    ],
  },
  {
    id: 'judging',
    title: 'Judging workflows',
    category: 'Core Concepts',
    icon: Zap,
    description: 'Multi-round judging, weighted criteria, recusal, and scoring rollup.',
    blocks: [
      { kind: 'p', text: 'A program can have any number of rounds. Each round has its own pool of submissions (filtered or carried forward from previous rounds), its own judge panel, and its own scoring rubric.' },
      { kind: 'h3', text: 'Scoring methods' },
      {
        kind: 'list',
        items: [
          'Numeric rubric — judges score each criterion 1–10; weighted average is the final score.',
          'Forced ranking — judges order all entries in their pool; Borda count produces the result.',
          'Yes/No — pass-fail screening rounds for shortlisting.',
          'Custom — plug in your own scoring function via the scoring API.',
        ],
      },
      {
        kind: 'code',
        lang: 'typescript',
        text: `import { defineScoringMethod } from '@awardx/plugins';

export default defineScoringMethod({
  id: 'geometric-mean',
  label: 'Geometric Mean',
  compute: (criteria) => {
    const product = criteria.reduce((acc, c) => acc * c.score, 1);
    return Math.pow(product, 1 / criteria.length);
  },
});`,
      },
    ],
  },
  {
    id: 'forms',
    title: 'Form builder & submissions',
    category: 'Core Concepts',
    icon: FileJson,
    description: 'Build entry forms with conditional logic and file uploads.',
    blocks: [
      { kind: 'p', text: 'The form builder produces a JSON Schema describing fields, validation, and conditional logic. The same schema renders both the admin preview and the public submission page.' },
      { kind: 'h3', text: 'Supported field types' },
      {
        kind: 'list',
        items: [
          'Text, long text, number, date, dropdown, multi-select, country, URL',
          'File upload (single + multi) with per-field size & MIME constraints',
          'Image gallery with drag-to-reorder',
          'Video URL with automatic thumbnail extraction',
          'Repeating groups for team members or work samples',
          'Signature pad for declarations',
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Headless submissions',
        text: 'Every form is also exposed as a REST endpoint at /api/forms/:id/submit. Embed AwardX entry forms inside your own website, mobile app, or chat bot.',
      },
    ],
  },
  {
    id: 'plugins',
    title: 'Plugin SDK',
    category: 'Extending',
    icon: Plug,
    description: 'Hook into the lifecycle with TypeScript plugins.',
    blocks: [
      { kind: 'p', text: 'Plugins are the primary extension surface. Drop a file into packages/plugins/<your-plugin>/index.ts and AwardX will register it automatically on next boot.' },
      {
        kind: 'code',
        lang: 'typescript',
        text: `import { definePlugin } from '@awardx/plugins';

export default definePlugin({
  id: 'slack-winner-announcer',
  on: {
    'round.completed': async (ctx) => {
      const winners = await ctx.db.scores.topN(ctx.round.id, 3);
      await fetch(process.env.SLACK_WEBHOOK!, {
        method: 'POST',
        body: JSON.stringify({
          text: \`Round \${ctx.round.name} winners: \${winners.map(w => w.name).join(', ')}\`,
        }),
      });
    },
  },
});`,
      },
      { kind: 'h3', text: 'Lifecycle events' },
      {
        kind: 'list',
        items: [
          'submission.created · submission.updated · submission.deleted',
          'round.started · round.completed',
          'judge.assigned · score.submitted',
          'payment.succeeded · payment.refunded',
          'program.published · program.archived',
        ],
      },
    ],
  },
  {
    id: 'rest-api',
    title: 'REST & tRPC API',
    category: 'Extending',
    icon: Code2,
    description: 'Programmatic access to every resource in AwardX.',
    blocks: [
      { kind: 'p', text: 'Every operation in the dashboard is available over HTTP. Authenticate with a Personal Access Token (Settings → API Keys) and call /api/v1/* with JSON.' },
      {
        kind: 'code',
        lang: 'bash',
        text: `# List all programs in your org
curl https://your-instance.com/api/v1/programs \\
  -H "Authorization: Bearer awx_pat_..."

# Create a submission
curl -X POST https://your-instance.com/api/v1/programs/PROG_ID/submissions \\
  -H "Authorization: Bearer awx_pat_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "My Entry", "category": "design", "fields": { ... } }'`,
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'tRPC for TypeScript clients',
        text: 'If you are calling AwardX from another TS service, prefer the tRPC client at /api/trpc — you get end-to-end type safety with no codegen step.',
      },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    category: 'Extending',
    icon: Webhook,
    description: 'Push events to your stack as they happen.',
    blocks: [
      { kind: 'p', text: 'Webhooks deliver lifecycle events to any HTTPS endpoint with HMAC-SHA256 signatures, exponential backoff, and a 14-day retention buffer.' },
      {
        kind: 'code',
        lang: 'http',
        text: `POST /your-webhook HTTP/1.1
X-AwardX-Event: submission.created
X-AwardX-Delivery: 7f3b...
X-AwardX-Signature: sha256=...
Content-Type: application/json

{
  "id": "sub_01HXY...",
  "program_id": "prog_01HX...",
  "title": "My Entry",
  "created_at": "2026-06-08T10:23:01Z"
}`,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    category: 'Extending',
    icon: Mail,
    description: 'Email, WhatsApp, Stripe, Slack, Notion, and Zapier.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Email — Resend, SendGrid, Postmark, or any SMTP server',
          'WhatsApp Business — Cloud API for entry reminders and announcements',
          'Payments — Stripe, Razorpay, or Paystack for paid entries',
          'Slack & Discord — Real-time notifications via webhook',
          'Notion — Mirror programs and submissions to a Notion database',
          'Zapier & Make — 3000+ apps via the public API',
        ],
      },
    ],
  },
  {
    id: 'self-hosting',
    title: 'Self-hosting in production',
    category: 'Deployment',
    icon: Cloud,
    description: 'Docker, Kubernetes, and one-click templates.',
    blocks: [
      { kind: 'p', text: 'AwardX ships an official Docker image at ghcr.io/awardx/awardx. Pin to a specific tag in production (e.g. v2.4.1) — :latest is only safe for staging.' },
      { kind: 'h3', text: 'Docker Compose (single host)' },
      {
        kind: 'code',
        lang: 'yaml',
        text: `services:
  app:
    image: ghcr.io/awardx/awardx:v2
    environment:
      DATABASE_URL: postgres://awardx:secret@db:5432/awardx
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
    ports: ["3000:3000"]
  db:
    image: postgres:16
    volumes: ["db:/var/lib/postgresql/data"]
  redis:
    image: redis:7
volumes: { db: {} }`,
      },
      { kind: 'h3', text: 'Kubernetes' },
      { kind: 'p', text: 'A Helm chart is available at oci://ghcr.io/awardx/charts/awardx. It provisions the web, api, worker, plus optional Postgres and Redis dependencies via Bitnami subcharts.' },
      {
        kind: 'callout',
        tone: 'success',
        title: 'One-click deploys',
        text: 'We maintain official templates for Railway, Render, Fly.io, and DigitalOcean App Platform. See docs.awardx.dev/deploy for the buttons.',
      },
    ],
  },
  {
    id: 'contributing',
    title: 'Contributing',
    category: 'Community',
    icon: GitBranch,
    description: 'Set up the repo, run tests, send a PR.',
    blocks: [
      { kind: 'p', text: 'AwardX welcomes contributions of every size — typos in docs, new locales, plugins, or major features. Start by reading CONTRIBUTING.md in the repo root.' },
      { kind: 'h3', text: 'Local dev loop' },
      {
        kind: 'code',
        lang: 'bash',
        text: `pnpm dev          # web + api + worker, watched
pnpm test         # unit + integration (Vitest + Playwright)
pnpm lint         # eslint + prettier
pnpm changeset    # before opening a PR that ships a release`,
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Good first issues',
        text: 'Issues labelled good-first-issue are scoped to half a day or less and have a mentor assigned. Look for the green tag on GitHub.',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community & support',
    category: 'Community',
    icon: Users,
    description: 'Discord, GitHub Discussions, security disclosures.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Discord — discord.gg/awardx for real-time chat and weekly office hours',
          'GitHub Discussions — long-form Q&A and RFCs',
          'security@awardx.dev — coordinated disclosure for vulnerabilities (PGP available)',
          'Twitter / X — @awardx_dev for release notes',
        ],
      },
    ],
  },
];

// ----- Page -----

type IndexedDoc = {
  id: string;
  title: string;
  category: string;
  description: string;
  body: string;
};

const buildIndex = (): { mini: MiniSearch<IndexedDoc>; map: Map<string, DocSection> } => {
  const mini = new MiniSearch<IndexedDoc>({
    fields: ['title', 'category', 'description', 'body'],
    storeFields: ['title', 'category', 'description'],
    searchOptions: { boost: { title: 3, category: 2 }, fuzzy: 0.2, prefix: true },
  });
  const map = new Map<string, DocSection>();
  const docs: IndexedDoc[] = sections.map((s) => {
    map.set(s.id, s);
    const body = s.blocks
      .map((b) => {
        if (b.kind === 'p' || b.kind === 'h3') return b.text;
        if (b.kind === 'code') return b.text;
        if (b.kind === 'list') return b.items.join(' ');
        if (b.kind === 'callout') return `${b.title} ${b.text}`;
        if (b.kind === 'table') return [...b.headers, ...b.rows.flat()].join(' ');
        return '';
      })
      .join(' ');
    return { id: s.id, title: s.title, category: s.category, description: s.description, body };
  });
  mini.addAll(docs);
  return { mini, map };
};

const categories = Array.from(new Set(sections.map((s) => s.category)));

const Block: React.FC<{ block: DocBlock }> = ({ block }) => {
  switch (block.kind) {
    case 'p':
      return <p className="text-slate-600 leading-relaxed mb-4">{block.text}</p>;
    case 'h3':
      return (
        <h3 className="text-xl font-bold text-slate-900 mt-10 mb-3 font-display flex items-center gap-2 group">
          <Hash className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          {block.text}
        </h3>
      );
    case 'code':
      return (
        <pre className="bg-slate-950 text-slate-100 rounded-xl p-5 overflow-x-auto text-sm font-mono mb-6 border border-slate-800 shadow-lg">
          <code>{block.text}</code>
        </pre>
      );
    case 'list':
      return (
        <ul className="space-y-2 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
              <ChevronRight className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'callout': {
      const tones = {
        info: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        warn: 'bg-amber-50 border-amber-200 text-amber-900',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      } as const;
      return (
        <div className={`border rounded-xl p-5 mb-6 ${tones[block.tone]}`}>
          <div className="font-bold text-sm mb-1">{block.title}</div>
          <div className="text-sm leading-relaxed opacity-90">{block.text}</div>
        </div>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto mb-6 rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-bold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-slate-100">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-600 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
};

export const DocsPage: React.FC = () => {
  const { mini, map } = useMemo(buildIndex, []);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return mini.search(query, { fuzzy: 0.2, prefix: true }).slice(0, 8);
  }, [query, mini]);

  // Cmd/Ctrl + K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 30);
      }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Scroll-spy: highlight sidebar entry of the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          setActiveId(top.target.id);
        }
      },
      { rootMargin: '-30% 0px -55% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    setShowSearch(false);
    setQuery('');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-24">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-indigo-600 mb-4">
          <BookOpen className="w-4 h-4" /> AwardX Docs · v2.4
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 font-display tracking-tight mb-4">
          Documentation
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Everything you need to install, configure, extend, and self-host AwardX. Open source,
          MIT licensed, and powered by{' '}
          <a href="https://github.com/lucaong/minisearch" target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-4 hover:text-indigo-800">
            MiniSearch
          </a>
          .
        </p>

        {/* Search trigger */}
        <button
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 30);
          }}
          className="mt-8 flex items-center gap-3 w-full max-w-xl px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left group"
        >
          <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span className="flex-1 text-slate-400 group-hover:text-slate-600">Search docs &mdash; try "judging" or "webhook"</span>
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-1 font-mono">
            <Command className="w-3 h-3" /> K
          </span>
        </button>
      </div>

      {/* Search modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search AwardX docs..."
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">
                  No matches for &ldquo;{query}&rdquo;. Try a broader keyword.
                </div>
              )}
              {!query.trim() && (
                <div className="px-5 py-6">
                  <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">Popular pages</div>
                  <div className="space-y-1">
                    {['introduction', 'plugins', 'rest-api', 'self-hosting'].map((id) => {
                      const s = map.get(id)!;
                      const Icon = s.icon;
                      return (
                        <button
                          key={id}
                          onClick={() => jumpTo(id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                        >
                          <Icon className="w-4 h-4 text-indigo-500" />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                            <div className="text-xs text-slate-500">{s.description}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {results.map((r) => {
                const section = map.get(r.id as string)!;
                const Icon = section.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => jumpTo(r.id as string)}
                    className="w-full flex items-start gap-3 px-5 py-4 hover:bg-indigo-50/50 text-left border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-900">{section.title}</span>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {section.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{section.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
              <span>{results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Powered by MiniSearch'}</span>
              <span className="flex items-center gap-3">
                <kbd className="font-mono">↵</kbd> open · <kbd className="font-mono">esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Body grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <nav className="space-y-6">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3 px-2">{cat}</div>
                <div className="space-y-0.5">
                  {sections.filter((s) => s.category === cat).map((s) => {
                    const Icon = s.icon;
                    const active = activeId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => jumpTo(s.id)}
                        className={`w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-500 -ml-0.5 pl-3'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-indigo-500' : 'text-slate-400'}`} />
                        {s.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <a
                href="https://github.com/awardx/awardx"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2.5 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <Github className="w-4 h-4" /> Edit on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <article className="max-w-3xl">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <section key={s.id} id={s.id} className="scroll-mt-28 mb-20">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-indigo-600 mb-3">
                  <Icon className="w-4 h-4" /> {s.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 font-display tracking-tight">{s.title}</h2>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">{s.description}</p>
                <div className="prose-awardx">
                  {s.blocks.map((b, bi) => (
                    <Block key={bi} block={b} />
                  ))}
                </div>
                {i < sections.length - 1 && (
                  <div className="mt-16 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                )}
              </section>
            );
          })}

          <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden mt-12">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3 font-display">Didn&rsquo;t find what you need?</h3>
              <p className="text-slate-300 mb-6">
                Open a question on GitHub Discussions or join the Discord. Maintainers and 340+ contributors answer most threads within a day.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/awardx/awardx/discussions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100"
                >
                  <Github className="w-4 h-4" /> Ask on GitHub
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10"
                >
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
