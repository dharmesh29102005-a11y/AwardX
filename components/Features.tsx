import React, { useEffect, useRef, useState } from 'react';
import {
  Gavel,
  CalendarClock,
  FileText,
  LayoutTemplate,
  BarChart3,
  Shield,
  Activity,
  Trophy,
  Sparkles,
  Mail,
  Vote,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Animated mini-UIs — each mirrors an actual dashboard view.        */
/* ------------------------------------------------------------------ */

const JudgingMini: React.FC = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 1400);
    return () => clearInterval(t);
  }, []);
  const criteria = [
    { label: 'Originality', weight: 30 },
    { label: 'Execution', weight: 40 },
    { label: 'Impact', weight: 30 },
  ];
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Round 2 · Jury</div>
          <div className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> live
          </div>
        </div>
        <div className="space-y-2.5">
          {criteria.map((c, i) => (
            <div key={c.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-white/80 font-medium">{c.label}</span>
                <span className="text-indigo-300 font-mono">{c.weight}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step >= i ? `${c.weight * 2.5}%` : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">J4</div>
            <span className="text-[11px] text-white/80">Weighted score</span>
          </div>
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-emerald-300 font-mono"
          >
            {(8.1 + step * 0.2).toFixed(1)} / 10
          </motion.span>
        </div>
      </div>
    </div>
  );
};

const RoundsMini: React.FC = () => {
  const rounds = [
    { name: 'Call for Entries', status: 'done', color: 'emerald' },
    { name: 'Shortlisting', status: 'done', color: 'emerald' },
    { name: 'Public Voting', status: 'active', color: 'indigo' },
    { name: 'Final Jury', status: 'queued', color: 'slate' },
  ];
  return (
    <div className="relative h-full w-full p-4">
      <div className="space-y-2">
        {rounds.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 p-2.5 rounded-xl border ${
              r.status === 'active'
                ? 'bg-white/20 border-white/40 backdrop-blur-md shadow-lg'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                r.status === 'done' ? 'bg-emerald-400/30 text-emerald-300' : r.status === 'active' ? 'bg-indigo-400/30 text-indigo-200' : 'bg-white/5 text-white/40'
              }`}
            >
              {r.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </div>
            <div className="flex-1 text-[12px] text-white/90 font-medium">{r.name}</div>
            {r.status === 'active' && (
              <span className="text-[9px] font-bold text-indigo-200 px-2 py-0.5 rounded-full bg-indigo-400/20 border border-indigo-300/30 animate-pulse">
                LIVE
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FormBuilderMini: React.FC = () => {
  const fields = ['Title', 'Category', 'Cover image', 'Team members', 'Description'];
  return (
    <div className="relative h-full w-full p-4">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {['Text', 'File', 'Group', 'Select'].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="text-[10px] font-bold text-white/70 px-2 py-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-center hover:bg-white/20 cursor-grab"
          >
            + {t}
          </motion.div>
        ))}
      </div>
      <div className="space-y-1.5">
        {fields.map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/80"
          >
            <span className="w-1 h-3 bg-indigo-400 rounded-full" />
            {f}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsMini: React.FC = () => {
  const bars = [40, 65, 50, 78, 62, 90, 72];
  return (
    <div className="relative h-full w-full p-4 flex flex-col">
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Entries', value: '1,284' },
          { label: 'Judges', value: '42' },
          { label: 'Avg Score', value: '8.4' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/15"
          >
            <div className="text-[8px] uppercase tracking-wider text-white/50 font-bold">{s.label}</div>
            <div className="text-sm font-bold text-white font-mono">{s.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex-1 flex items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-cyan-300"
          />
        ))}
      </div>
    </div>
  );
};

const ReachMini: React.FC = () => {
  // Real campaign templates exist in components/dashboard/ReachView.tsx
  const templates = ['Call for Entries', 'Early Bird Reminder', 'Winner Announcement'];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % templates.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-full w-full p-4">
      <div className="space-y-1.5 mb-3">
        {templates.map((tpl, i) => (
          <div
            key={tpl}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] transition-all ${
              i === active
                ? 'bg-white/20 border-white/40 text-white shadow'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            <Mail className="w-3 h-3" />
            <span className="font-medium">{tpl}</span>
            {i === active && <span className="ml-auto text-[9px] font-bold text-indigo-200">SENDING</span>}
          </div>
        ))}
      </div>
      <div className="text-[10px] font-mono text-white/40 leading-relaxed bg-black/20 border border-white/10 rounded-lg p-2">
        <span className="text-emerald-300">Hi</span> {'{{nominee_name}}'},
        <br />
        Your entry "<span className="text-indigo-200">{'{{submission_title}}'}</span>"…
      </div>
    </div>
  );
};

const TeamsMini: React.FC = () => {
  const roles = [
    { name: 'Owner', count: 1, color: 'from-amber-400 to-orange-500' },
    { name: 'Admin', count: 3, color: 'from-indigo-400 to-purple-500' },
    { name: 'Program Manager', count: 6, color: 'from-cyan-400 to-blue-500' },
    { name: 'Judge', count: 42, color: 'from-emerald-400 to-teal-500' },
  ];
  return (
    <div className="relative h-full w-full p-4 space-y-1.5">
      {roles.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${r.color} flex items-center justify-center text-[10px] font-bold text-white shadow`}>
            {r.name.charAt(0)}
          </div>
          <div className="text-[11px] text-white/90 font-semibold flex-1">{r.name}</div>
          <div className="text-[10px] text-white/50 font-mono">{r.count}</div>
        </motion.div>
      ))}
    </div>
  );
};

const AuditMini: React.FC = () => {
  const events = [
    { actor: 'sarah@', text: 'created round "Final Jury"', t: '2m' },
    { actor: 'david@', text: 'invited 6 judges', t: '14m' },
    { actor: 'elena@', text: 'published program', t: '1h' },
  ];
  return (
    <div className="relative h-full w-full p-4 space-y-2">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-2 text-[11px] font-mono text-white/70 border-l-2 border-indigo-400/50 pl-2.5"
        >
          <Activity className="w-3 h-3 mt-0.5 text-indigo-300 shrink-0" />
          <div className="flex-1">
            <span className="text-indigo-300">{e.actor}</span> {e.text}
          </div>
          <div className="text-white/30">{e.t}</div>
        </motion.div>
      ))}
    </div>
  );
};

const VotingMini: React.FC = () => {
  const candidates = [
    { name: 'Submission A', votes: 1284, pct: 82 },
    { name: 'Submission B', votes: 942, pct: 60 },
    { name: 'Submission C', votes: 671, pct: 43 },
  ];
  return (
    <div className="relative h-full w-full p-4 space-y-3">
      {candidates.map((c, i) => (
        <div key={c.name}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-white/80 font-medium">{c.name}</span>
            <span className="text-cyan-300 font-mono">{c.votes.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${c.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.9, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400"
            />
          </div>
        </div>
      ))}
      <div className="text-[10px] font-mono text-white/40 text-right">/vote/program-slug</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  span: string;
  mini: React.ReactNode;
};

const features: FeatureCard[] = [
  {
    id: 'judging',
    title: 'Multi-round Judging',
    description:
      'Weighted criteria, automatic recusal, and per-round panels. Aggregate scores roll up the moment a judge hits submit.',
    icon: Gavel,
    gradient: 'from-indigo-600 via-purple-600 to-slate-900',
    span: 'md:col-span-2 md:row-span-2',
    mini: <JudgingMini />,
  },
  {
    id: 'rounds',
    title: 'Schedule & Rounds',
    description:
      'Sequence rounds with custom advancement criteria — top N, score thresholds, or manual curation.',
    icon: CalendarClock,
    gradient: 'from-emerald-600 via-teal-600 to-slate-900',
    span: 'md:col-span-1',
    mini: <RoundsMini />,
  },
  {
    id: 'forms',
    title: 'Form Builder',
    description: 'Drag-and-drop fields including repeating groups, file uploads, and conditional logic.',
    icon: LayoutTemplate,
    gradient: 'from-rose-600 via-pink-600 to-slate-900',
    span: 'md:col-span-1',
    mini: <FormBuilderMini />,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Real-time entry volume, judge throughput, score distribution, and demographic breakdowns.',
    icon: BarChart3,
    gradient: 'from-cyan-600 via-blue-600 to-slate-900',
    span: 'md:col-span-1',
    mini: <AnalyticsMini />,
  },
  {
    id: 'voting',
    title: 'Public Voting',
    description: 'Token-gated voting pages with fraud controls and live result panels.',
    icon: Vote,
    gradient: 'from-fuchsia-600 via-violet-600 to-slate-900',
    span: 'md:col-span-1',
    mini: <VotingMini />,
  },
  {
    id: 'reach',
    title: 'Reach Campaigns',
    description: 'Mass email with merge tags like {{submission_title}} and {{round_title}}. Templates ship in-app.',
    icon: Mail,
    gradient: 'from-orange-600 via-amber-600 to-slate-900',
    span: 'md:col-span-1',
    mini: <ReachMini />,
  },
  {
    id: 'teams',
    title: 'Teams & Roles',
    description:
      'Owner, Admin, Program Manager, and Judge roles. Permissions are scoped per organization or per program.',
    icon: Shield,
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    span: 'md:col-span-1',
    mini: <TeamsMini />,
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    description: 'Every create, update, and delete is recorded with actor, IP, and diff. Filterable, exportable.',
    icon: Activity,
    gradient: 'from-yellow-700 via-amber-700 to-slate-900',
    span: 'md:col-span-1',
    mini: <AuditMini />,
  },
];

const Card: React.FC<{ feature: FeatureCard; index: number }> = ({ feature, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const Icon = feature.icon;

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className={`group relative ${feature.span} overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-6 md:p-8 min-h-[280px] md:min-h-[300px] flex flex-col hover:-translate-y-1 transition-transform duration-300`}
    >
      {/* Mouse-follow glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.18), transparent 40%)`,
        }}
      />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      {/* Animated blob */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-display tracking-tight">{feature.title}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-5 max-w-sm">{feature.description}</p>

        {/* Mini interactive preview */}
        <div className="flex-1 mt-auto relative min-h-[140px]">
          <div className="absolute inset-0 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 overflow-hidden">
            {feature.mini}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Features: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="features"
      ref={ref}
      className="py-32 relative overflow-hidden bg-slate-50"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-bg-light opacity-[0.5] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-slate-200 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Real product · Every feature ships today
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight font-display mb-6"
          >
            The full stack of an{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              awards platform
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Every card below is a real view inside the AwardX dashboard &mdash; not a roadmap promise.
            Hover any tile to see the live UI fragment shipped in <code className="text-sm bg-slate-200/60 px-1.5 py-0.5 rounded font-mono text-slate-700">apps/web</code>.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(280px,auto)]">
          {features.map((f, i) => (
            <Card key={f.id} feature={f} index={i} />
          ))}

          {/* Closing "more" tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all min-h-[280px]"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-purple-200/50 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Plus the rest</h3>
              <ul className="space-y-1.5 mt-3">
                {[
                  'Page builder for program microsites',
                  'Judge portal via token link',
                  'Awards configuration & winners',
                  'Categories with sub-categories',
                  'Universal command-K search',
                  'Resend, Razorpay, Didit integrations',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                    <Trophy className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
