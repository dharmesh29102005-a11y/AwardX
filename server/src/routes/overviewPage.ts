import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../supabase.js';
import { cacheKeys, cacheTtls, deleteCache, wrapWithCache } from '../cache/redisCache.js';

const router = Router();

async function invalidateOverview(programId: string) {
  await deleteCache(cacheKeys.programOverview(programId));
}

router.get('/:programId', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  try {
    const payload = await wrapWithCache(cacheKeys.programOverview(programId), cacheTtls.medium, async () => {
      const supabase = getSupabaseAdmin();
      const [configResult, sectionsResult, sponsorsResult, faqsResult, timelineResult] = await Promise.all([
        supabase.from('program_page_configs').select('*').eq('program_id', programId).maybeSingle(),
        supabase.from('program_page_sections').select('*').eq('program_id', programId).order('sort_order'),
        supabase.from('program_sponsors').select('*').eq('program_id', programId).order('sort_order'),
        supabase.from('program_faqs').select('*').eq('program_id', programId).order('sort_order'),
        supabase.from('program_timeline_milestones').select('*').eq('program_id', programId).order('sort_order'),
      ]);

      const errors = [
        configResult.error,
        sectionsResult.error,
        sponsorsResult.error,
        faqsResult.error,
        timelineResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(errors[0]?.message || 'Failed to fetch overview data');
      }

      return {
        config: configResult.data || null,
        sections: sectionsResult.data || [],
        sponsors: sponsorsResult.data || [],
        faqs: faqsResult.data || [],
        timeline: timelineResult.data || [],
      };
    });

    return res.json({ data: payload });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.put('/:programId/config', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('program_page_configs')
      .upsert(
        {
          program_id: programId,
          theme_settings: req.body?.theme_settings,
          is_published: req.body?.is_published,
          seo_title: req.body?.seo_title,
          seo_description: req.body?.seo_description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'program_id' },
      )
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || 'Failed to save config' });
    }

    await invalidateOverview(programId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.post('/:programId/sections', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  const payload = req.body || {};
  const id = typeof payload.id === 'string' && payload.id.startsWith('temp-') ? undefined : payload.id;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('program_page_sections')
      .upsert({
        id,
        program_id: programId,
        section_type: payload.section_type,
        title: payload.title,
        subtitle: payload.subtitle,
        content: payload.content,
        settings: payload.settings,
        sort_order: payload.sort_order,
        is_visible: payload.is_visible,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || 'Failed to save section' });
    }

    await invalidateOverview(programId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/:programId/sections/:id', requireAuth, async (req, res) => {
  const { programId, id } = req.params;
  if (!programId || !id) {
    return res.status(400).json({ error: 'programId and section id are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('program_page_sections').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to delete section' });
    }

    await invalidateOverview(programId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.post('/:programId/sponsors', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  const payload = req.body || {};
  const id = typeof payload.id === 'string' && payload.id.startsWith('temp-') ? undefined : payload.id;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('program_sponsors')
      .upsert({
        id,
        program_id: programId,
        name: payload.name,
        logo_url: payload.logo_url,
        website_url: payload.website_url,
        tier: payload.tier,
        tier_label: payload.tier_label,
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || 'Failed to save sponsor' });
    }

    await invalidateOverview(programId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/:programId/sponsors/:id', requireAuth, async (req, res) => {
  const { programId, id } = req.params;
  if (!programId || !id) {
    return res.status(400).json({ error: 'programId and sponsor id are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('program_sponsors').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to delete sponsor' });
    }

    await invalidateOverview(programId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.post('/:programId/faqs', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  const payload = req.body || {};
  const id = typeof payload.id === 'string' && payload.id.startsWith('temp-') ? undefined : payload.id;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('program_faqs')
      .upsert({
        id,
        program_id: programId,
        question: payload.question,
        answer: payload.answer,
        category: payload.category,
        sort_order: payload.sort_order,
        is_visible: payload.is_visible,
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || 'Failed to save FAQ' });
    }

    await invalidateOverview(programId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/:programId/faqs/:id', requireAuth, async (req, res) => {
  const { programId, id } = req.params;
  if (!programId || !id) {
    return res.status(400).json({ error: 'programId and FAQ id are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('program_faqs').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to delete FAQ' });
    }

    await invalidateOverview(programId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.post('/:programId/timeline', requireAuth, async (req, res) => {
  const { programId } = req.params;
  if (!programId) {
    return res.status(400).json({ error: 'programId is required' });
  }

  const payload = req.body || {};
  const id = typeof payload.id === 'string' && payload.id.startsWith('temp-') ? undefined : payload.id;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('program_timeline_milestones')
      .upsert({
        id,
        program_id: programId,
        title: payload.title,
        date: payload.date,
        description: payload.description,
        icon: payload.icon,
        sort_order: payload.sort_order,
        is_visible: payload.is_visible,
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || 'Failed to save timeline milestone' });
    }

    await invalidateOverview(programId);
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

router.delete('/:programId/timeline/:id', requireAuth, async (req, res) => {
  const { programId, id } = req.params;
  if (!programId || !id) {
    return res.status(400).json({ error: 'programId and timeline id are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('program_timeline_milestones').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to delete timeline milestone' });
    }

    await invalidateOverview(programId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

export default router;
