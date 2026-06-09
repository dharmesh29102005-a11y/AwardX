import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pause, Play, X, Sparkles } from 'lucide-react';
import { useDemoContext } from '../../contexts/DemoContext';

export const DemoOverlay: React.FC = () => {
  const {
    isPlaying,
    isComplete,
    currentStep,
    currentStepIndex,
    totalSteps,
    spotlightRect,
    exitDemo,
    pauseDemo,
    resumeDemo,
  } = useDemoContext();

  const progress = ((currentStepIndex + (isComplete ? 1 : 0)) / totalSteps) * 100;

  return (
    <>
      <AnimatePresence>
        {isPlaying && spotlightRect && !isComplete && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[9996]"
            style={{
              background: `radial-gradient(ellipse ${Math.max(spotlightRect.width + 80, 200)}px ${Math.max(spotlightRect.height + 80, 160)}px at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent 0%, rgba(15, 23, 42, 0.4) 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={exitDemo}
        className="fixed top-4 right-4 z-[10000] flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-500 shadow-md backdrop-blur-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        aria-label="Exit live demo"
        title="Exit demo"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Live Demo
            </span>
            {currentStep && !isComplete && (
              <span className="truncate text-sm font-bold text-slate-900">
                {currentStep.title}
              </span>
            )}
            <button
              type="button"
              onClick={isPlaying ? pauseDemo : resumeDemo}
              className="ml-auto inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label={isPlaying ? 'Pause demo' : 'Resume demo'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden mb-2.5">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {currentStep && !isComplete && (
              <p className="text-[15px] font-semibold leading-relaxed text-slate-800">
                {currentStep.caption}
              </p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[9997] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center"
            >
              <button
                type="button"
                onClick={exitDemo}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Exit live demo"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Sparkles className="h-7 w-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Demo complete</h2>
              <p className="text-slate-600 mb-6">
                Self-host and run your awards on your own infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Self Host
                </Link>
                <button
                  type="button"
                  onClick={exitDemo}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
