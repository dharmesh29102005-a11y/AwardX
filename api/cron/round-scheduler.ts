import { runRoundSchedulerTick } from '../_lib/roundScheduler.js';
import { loadRootEnv } from '../../server/src/loadEnv.js';

loadRootEnv();

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CRON_SECRET || '';
  if (secret) {
    const auth = req.headers?.authorization || '';
    const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const querySecret = typeof req.query?.secret === 'string' ? req.query.secret : '';
    if (bearer !== secret && querySecret !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  try {
    const result = await runRoundSchedulerTick();
    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scheduler failed';
    console.error('[cron/round-scheduler]', error);
    res.status(500).json({ error: message });
  }
}
