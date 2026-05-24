/**
 * @deprecated Round scheduling runs via Vercel Cron (`/api/cron/round-scheduler`).
 * See `api/_lib/roundScheduler.ts`.
 */
export { runRoundSchedulerTick as runSchedulerTick } from '../../../api/_lib/roundScheduler.js';

export function startRoundScheduler() {
  console.warn(
    '[scheduler] startRoundScheduler() is deprecated. Use Vercel Cron /api/cron/round-scheduler instead.',
  );
}

export function stopRoundScheduler() {
  // no-op
}
