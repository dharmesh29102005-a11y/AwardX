import React, { useRef } from 'react';
import { LayoutTemplate, FileText, Gavel, Trophy, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* Steps mirror the actual flow inside the app:
   1. Form Builder         (components/dashboard/FormBuilderView.tsx)
   2. Submissions          (components/dashboard/SubmissionTable.tsx)
   3. Judging              (components/dashboard/JudgingView.tsx)
   4. Awards               (components/dashboard/AwardsNavItem.tsx + winners) */

const steps = [
  {
    id: 1,
    title: 'Build the entry form',
    description:
      'Open Form Builder, drag fields, drop them into groups. The same JSON Schema renders the public submission page.',
    icon: LayoutTemplate,
    route: '/dashboard · Form Builder',
    gradient: 'from-indigo-500 to-purple-500',
    detail: ['Text · File · Select · Group', 'Conditional logic', 'Auto-publishes to /form/:formId'],
  },
  {
    id: 2,
    title: 'Collect submissions',
    description:
      'Entries land in the Submissions table with filters by category, status, and round. Bulk advance or export to CSV.',
    icon: FileText,
    route: '/dashboard · Submissions',
    gradient: 'from-emerald-500 to-teal-500',
    detail: ['Public program page at /program/:slug', 'My Submissions portal for entrants', 'Payments via Razorpay (optional)'],
  },
  {
    id: 3,
    title: 'Run the rounds',
    description:
      'Schedule rounds, configure advancement criteria, invite judges. Scores aggregate per round with weighted criteria.',
    icon: Gavel,
    route: '/dashboard · Schedule & Rounds',
    gradient: 'from-orange-500 to-rose-500',
    detail: ['Judges access via /judge/:token', 'Public Voting at /vote/:slug', 'Leaderboard refreshes in realtime'],
  },
  {
    id: 4,
    title: 'Announce winners',
    description:
      'Lock the round, configure Awards, send the Winner Announcement template, and ship the public showcase.',
    icon: Trophy,
    route: '/dashboard · Awards',
    gradient: 'from-amber-500 to-yellow-500',
    detail: ['Built-in Reach campaign templates', 'Winners page on the program microsite', 'Audit log records every change'],
  },
];

export const Timeline: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 30%'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how-it-works" ref={ref} className="py-32 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background */}
      <div className="absolute inset-0 grid-bg-light opacity-[0.04] pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <ArrowRight className="w-3.5 h-3.5" /> How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 font-display tracking-tight"
          >
            Four screens, one ceremony
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Each step below maps to a real route in the dashboard.
            No external tools to glue together.
          </motion.p>
        </div>

        <div className="relative">
          {/* Animated vertical path (desktop) */}
          <svg
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 h-full w-12 pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 48 1000"
          >
            <defs>
              <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <line x1="24" y1="0" x2="24" y2="1000" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <motion.line
              x1="24"
              y1="0"
              x2="24"
              y2="1000"
              stroke="url(#timelineGrad)"
              strokeWidth="3"
              style={{ pathLength }}
            />
          </svg>

          <div className="space-y-12 lg:space-y-20 relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:items-center`}
                >
                  {/* Left/Right slot */}
                  <div className={`${isLeft ? '' : 'lg:col-start-3'}`}>
                    <div className="group relative rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-6 md:p-8 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      {/* Animated gradient sweep on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity bg-gradient-to-br ${step.gradient}" style={{ backgroundImage: `linear-gradient(135deg, ${step.gradient.replace('from-', '').replace('to-', '')})` }} />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[10px] font-mono text-white/40 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                            {step.route}
                          </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-display tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-5">{step.description}</p>
                        <ul className="space-y-1.5">
                          {step.detail.map((d, di) => (
                            <motion.li
                              key={d}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + di * 0.08 }}
                              className="flex items-start gap-2 text-sm text-slate-400"
                            >
                              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" />
                              <span>{d}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Center number badge */}
                  <div className="hidden lg:flex lg:col-start-2 lg:row-start-1 flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                      className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl ring-4 ring-slate-900`}
                    >
                      <span className="text-2xl font-black text-white font-display">{step.id}</span>
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} animate-ping opacity-20`} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
