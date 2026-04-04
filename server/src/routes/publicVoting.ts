import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getVotingRoundPublic,
  castVote,
  getVotingResults,
  getLeaderboard,
} from '../services/votingEngine.js';
import { getSupabaseAdmin } from '../supabase.js';
import { cacheKeys, cacheTtls, deleteCache, wrapWithCache } from '../cache/redisCache.js';

const router = Router();

// ---- Public Endpoints (no auth required) ----

/**
 * GET /voting/:roundId — Get voting round info + submissions for public display.
 */
router.get('/:roundId', async (req, res) => {
  const { roundId } = req.params;
  try {
    const data = await getVotingRoundPublic(roundId);
    if (!data) return res.status(404).json({ error: 'Voting round not found or not active.' });
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

/**
 * POST /voting/:roundId/vote — Cast a vote.
 */
router.post('/:roundId/vote', async (req, res) => {
  const { roundId } = req.params;
  const { submission_id, email, name } = req.body || {};

  if (!submission_id) {
    return res.status(400).json({ error: 'submission_id is required' });
  }

  // Extract voter info
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || null;

  // Try to get authenticated user (optional)
  let userId: string | undefined;
  const authHeader = req.header('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (token) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) userId = data.user.id;
    } catch {
      // Not authenticated — proceed as anonymous
    }
  }

  try {
    const result = await castVote(roundId, submission_id, {
      userId,
      email: email || undefined,
      name: name || undefined,
      ipAddress: ipAddress || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    if (!result.ok) return res.status(400).json({ error: result.error });

    // Invalidate cached results
    await deleteCache(cacheKeys.votingResults(roundId));

    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

/**
 * GET /voting/:roundId/leaderboard — Public leaderboard (if enabled).
 */
router.get('/:roundId/leaderboard', async (req, res) => {
  const { roundId } = req.params;
  try {
    const data = await getLeaderboard(roundId);
    if (!data) return res.status(403).json({ error: 'Leaderboard is not enabled for this round.' });
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

// ---- Admin Endpoints (auth required) ----

/**
 * GET /voting/:roundId/results — Full voting results (admin only).
 */
router.get('/:roundId/results', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  try {
    const data = await wrapWithCache(cacheKeys.votingResults(roundId), cacheTtls.short, async () => {
      return getVotingResults(roundId);
    });
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

/**
 * GET /voting/:roundId/config — Get voting config (admin only).
 */
router.get('/:roundId/config', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('voting_configs')
      .select('*')
      .eq('round_id', roundId)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      return res.status(500).json({ error: error.message });
    }
    return res.json({ data: data || null });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

/**
 * PUT /voting/:roundId/config — Update voting config (admin only).
 */
router.put('/:roundId/config', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  const config = req.body || {};
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('voting_configs')
      .upsert({
        round_id: roundId,
        votes_per_user: config.votes_per_user,
        votes_per_submission: config.votes_per_submission,
        require_auth: config.require_auth,
        allow_anonymous: config.allow_anonymous,
        show_results_publicly: config.show_results_publicly,
        show_leaderboard: config.show_leaderboard,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'round_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await deleteCache(cacheKeys.votingConfig(roundId));
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

/**
 * GET /voting/:roundId/voters — Voter log (admin only).
 */
router.get('/:roundId/voters', requireAuth, async (req, res) => {
  const { roundId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 50));
  const offset = (page - 1) * pageSize;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error, count } = await supabase
      .from('public_votes')
      .select('*, submissions(id, title, applicant_name)', { count: 'exact' })
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data, total: count || 0, page, pageSize });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

export default router;
