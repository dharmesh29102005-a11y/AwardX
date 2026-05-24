import { getSupabaseAdmin } from '../../server/src/supabase.js';
import { activateRound, completeRound } from '../../server/src/services/roundEngine.js';
import { executeAdvancement } from '../../server/src/services/advancementEngine.js';
import { deleteCache } from '../../server/src/cache/redisCache.js';

/**
 * One scheduler tick: auto-activate, auto-complete, and auto-advance rounds.
 * Invoked by Vercel Cron (`/api/cron/round-scheduler`) — not a background process.
 */
export async function runRoundSchedulerTick(): Promise<{ ok: true; activated: number; completed: number; advanced: number }> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  let activated = 0;
  let completed = 0;
  let advanced = 0;

  const { data: toActivate } = await supabase
    .from('rounds')
    .select('id, program_id, title')
    .in('status', ['scheduled', 'upcoming'])
    .lte('start_date', now);

  for (const round of toActivate || []) {
    const result = await activateRound(round.id, 'scheduler_auto');
    if (result.ok) {
      activated += 1;
      await deleteCache(`program:${round.program_id}:rounds`);
      await deleteCache(`program:${round.program_id}:pipeline-status`);
    }
  }

  const { data: toComplete } = await supabase
    .from('rounds')
    .select('id, program_id, title')
    .eq('status', 'active')
    .lte('end_date', now);

  for (const round of toComplete || []) {
    const result = await completeRound(round.id, 'scheduler_auto');
    if (result.ok) {
      completed += 1;
      await deleteCache(`program:${round.program_id}:rounds`);
      await deleteCache(`program:${round.program_id}:pipeline-status`);
    }
  }

  const { data: toAdvance } = await supabase
    .from('rounds')
    .select('id, program_id, title')
    .eq('status', 'completed')
    .eq('is_finalized', false)
    .eq('advancement_trigger', 'automatic');

  for (const round of toAdvance || []) {
    const result = await executeAdvancement(round.id, undefined, 'scheduler_auto');
    if (result.ok) {
      advanced += 1;
      await deleteCache(`program:${round.program_id}:rounds`);
      await deleteCache(`program:${round.program_id}:pipeline-status`);
      await deleteCache(`program:${round.program_id}:advancement-history`);
    }
  }

  return { ok: true, activated, completed, advanced };
}
