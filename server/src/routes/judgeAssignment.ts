import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  autoRandomAssign,
  autoSegmentedAssign,
  manualAssign,
  getAssignmentsByRound,
  removeAssignment,
  clearRoundAssignments,
} from '../services/judgeAssignment.js';
import { deleteCache, cacheKeys } from '../cache/redisCache.js';

const router = Router();

router.post('/rounds/:roundId/assign-judges', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { roundId } = req.params;
  const { strategy, program_id, config } = req.body || {};

  if (!strategy || !program_id) {
    return res.status(400).json({ error: 'strategy and program_id are required' });
  }

  try {
    let result;
    switch (strategy) {
      case 'random':
        result = await autoRandomAssign(
          roundId,
          program_id,
          config?.judges_per_submission || 3,
          req.userId
        );
        break;
      case 'segmented':
        result = await autoSegmentedAssign(
          roundId,
          program_id,
          config?.segment_field || 'category_id',
          config?.judges_per_submission || 3,
          req.userId
        );
        break;
      case 'manual':
        result = await manualAssign(
          roundId,
          config?.assignments || [],
          req.userId
        );
        break;
      default:
        return res.status(400).json({ error: `Unknown strategy: ${strategy}` });
    }

    await deleteCache(cacheKeys.roundSubmissions(roundId));

    if (!result.ok) {
      return res.status(400).json({ error: result.error, assigned: result.assigned });
    }

    return res.json({ ok: true, assigned: result.assigned });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.get('/rounds/:roundId/assignments', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  try {
    const data = await getAssignmentsByRound(roundId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/rounds/:roundId/assignments/:assignmentId', requireAuth, async (req, res) => {
  const { roundId, assignmentId } = req.params;
  try {
    await removeAssignment(assignmentId);
    await deleteCache(cacheKeys.roundSubmissions(roundId));
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/rounds/:roundId/assignments', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  try {
    await clearRoundAssignments(roundId);
    await deleteCache(cacheKeys.roundSubmissions(roundId));
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

export default router;
