import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Globe,
  Users,
  ArrowRight,
  KeyRound,
  CreditCard,
  Mail,
  ShieldCheck,
  Vote,
  CheckCircle2,
  Workflow,
} from 'lucide-react';

/* Animated UI fragments — each mirrors a real route in apps/web. */

const SubmissionTableMini: React.FC = () => {
  // Real component: components/dashboard/SubmissionTable.tsx
  const rows = [
    { id: 'SUB-1042', title: 'Helios Pavilion', status: 'Submitted', tone: 'emerald' },
    { id: 'SUB-1041', title: 'Quanta Engine', status: 'In Review', tone: 'amber' },
    { id: 'SUB-1040', title: 'Northwind Atlas', status: 'Advanced', tone: 'indigo' },
    { id: 'SUB-1039', title: 'Echo Display', status: 'Submitted', tone: 'emerald' },
  ];
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
    amber: 'bg-amber-400/15 text-amber-300 border-amber-300/30',
    indigo: 'bg-indigo-400/15 text-indigo-300 border-indigo-300/30',
  };
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="px-4 py-2.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Submissions · 1,284 total</span>
        <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> realtime
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-white/10 flex items-center justify-center text-[9px] font-mono text-white/70">
              {r.id.split('-')[1]}
            </div>
            <div className="flex-1 text-[12px] text-white/90 font-medium truncate">{r.title}</div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tones[r.tone]}`}>
              {r.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const JudgePortalMini: React.FC = () => {
  // Real route: /judge/:token (components/pages/JudgePortalPage.tsx)
  const [scored, setScored] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setScored((s) => (s >= 24 ? 0 : s + 1)), 120);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-indigo-300" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Judge Portal · /judge/&lt;token&gt;</span>
        </div>
      </div>
      <div className="text-[11px] text-white/70 mb-2">Scored this round</div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-white font-mono tabular-nums">{scored}</span>
        <span className="text-white/40 text-sm">/ 24</span>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-sm transition-colors ${i < scored ? 'bg-emerald-400' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <div className="mt-4 text-[10px] font-mono text-white/40">No login required &mdash; signed token link.</div>
    </div>
  );
};

const PublicProgramMini: React.FC = () => {
  // Real route: /program/:slug (components/pages/PublicProgramPage.tsx)
  return (
    <div className="rounded-2xl overflow-hidden bg-white/95 shadow-2xl border border-white/40 backdrop-blur-xl">
      <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-200" />
        <div className="w-2 h-2 rounded-full bg-slate-200" />
        <div className="w-2 h-2 rounded-full bg-slate-200" />
        <div className="ml-3 text-[9px] text-slate-400 font-mono">awardx.app/program/your-slug</div>
      </div>
      <div className="p-4">
        <div className="h-2 w-1/3 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-slate-900 rounded mb-3" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="aspect-square rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-7 rounded-md bg-indigo-600" />
          <div className="w-7 h-7 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

const IntegrationsMini: React.FC = () => {
  // Real integrations: Resend, Razorpay, Didit (components/dashboard/IntegrationsPanel.tsx)
  const apps = [
    { name: 'Resend', purpose: 'Outbound email', icon: Mail, status: 'connected', color: 'from-slate-200 to-slate-100 text-slate-900' },
    { name: 'Razorpay', purpose: 'Entry payments', icon: CreditCard, status: 'connected', color: 'from-blue-100 to-cyan-100 text-blue-900' },
    { name: 'Didit', purpose: 'Identity / KYC', icon: ShieldCheck, status: 'not connected', color: 'from-emerald-100 to-teal-100 text-emerald-900' },
  ];
  return (
    <div className="space-y-2">
      {apps.map((a, i) => (
        <motion.div
          key={a.name}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-lg"
        >
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shadow-sm`}>
            <a.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-900">{a.name}</div>
            <div className="text-[10px] text-slate-500">{a.purpose}</div>
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-1 rounded-full ${
              a.status === 'connected'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {a.status === 'connected' ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Connected
              </span>
            ) : (
              'Connect'
            )}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export const ProductShowcase: React.FC = () => {
  return (
    <section className="py-28 relative overflow-hidden bg-white">
      <div className="absolute inset-0 grid-bg-light opacity-[0.4] pointer-events-none" />
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-100/60 to-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-slate-200 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            <Workflow className="w-3.5 h-3.5" /> Real routes from the open-source repo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display max-w-2xl tracking-tight">
            From <span className="text-indigo-600">submission</span> to{' '}
            <span className="text-purple-600">winner page</span> &mdash; one platform
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Every screen below corresponds to a path you can navigate to in your own deployment.
            No mockups, no roadmap items.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(360px,auto)]">
          {/* Hero card: submissions table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 group min-h-[420px]"
          >
            <div className="absolute inset-0 grid-bg-light opacity-[0.06]" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 text-[10px] font-bold tracking-widest uppercase mb-5">
                    <FileText className="w-3 h-3" /> /dashboard · Submissions
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 font-display tracking-tight leading-tight">
                    Track every entry the moment it arrives
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Filter by round, category, status, or judge assignment.
                    Bulk-advance, bulk-disqualify, or export to CSV without leaving the page.
                  </p>
                </div>
                <a href="#" className="inline-flex items-center gap-2 text-white font-semibold text-sm group/link">
                  Open the submissions view{' '}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="md:absolute md:inset-0 md:-mr-8"
                >
                  <SubmissionTableMini />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Judge portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white p-7 group min-h-[360px] flex flex-col border border-white/40"
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-300/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="mb-5 flex-shrink-0">
                <JudgePortalMini />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Judges work from a link</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Token-signed invite URLs. No account, no password reset emails, no friction.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Public program / voting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-white p-7 group min-h-[360px] flex flex-col border border-white/40"
          >
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-emerald-300/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="mb-5 transform group-hover:-translate-y-1 transition-transform duration-500">
                <PublicProgramMini />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Public program microsite
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every program ships with a hosted page at <code className="font-mono text-xs text-emerald-700">/program/&lt;slug&gt;</code>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 group min-h-[320px] border border-white/40"
          >
            <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center h-full">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 text-indigo-600 text-[10px] font-bold tracking-widest uppercase mb-4">
                  <Users className="w-3 h-3" /> Integrations panel
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">Three integrations, not thirty</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  The platform integrates with{' '}
                  <span className="font-semibold text-slate-900">Resend</span> for email,{' '}
                  <span className="font-semibold text-slate-900">Razorpay</span> for paid entries, and{' '}
                  <span className="font-semibold text-slate-900">Didit</span> for KYC.
                  Each one is OAuth + a single API key &mdash; managed in <code className="text-xs bg-slate-200/60 px-1.5 py-0.5 rounded font-mono">Settings &rarr; Integrations</code>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['oauth', 'per-program override', 'inherit from org'].map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-900 text-white">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <IntegrationsMini />
            </div>
          </motion.div>
        </div>

        {/* Footnote strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500"
        >
          {[
            { icon: FileText, label: '/dashboard/submissions' },
            { icon: Vote, label: '/vote/:slug' },
            { icon: Globe, label: '/program/:slug' },
            { icon: KeyRound, label: '/judge/:token' },
            { icon: Mail, label: 'Reach &rarr; Mass Email' },
          ].map((r) => (
            <span key={r.label} className="flex items-center gap-1.5 font-mono">
              <r.icon className="w-3.5 h-3.5 text-indigo-500" />
              <span dangerouslySetInnerHTML={{ __html: r.label }} />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
