import { createSupabaseAdmin } from '../_utils/supabaseAdmin';

export async function getOverviewPayload(programId: string) {
  const supabase = createSupabaseAdmin();

  const [programResult, configResult, sectionsResult] = await Promise.all([
    supabase
      .from('programs')
      .select(
        'id, title, slug, description, cover_image_url, status, visibility, deadline, timezone, industry_category',
      )
      .eq('id', programId)
      .maybeSingle(),
    supabase.from('program_page_configs').select('*').eq('program_id', programId).maybeSingle(),
    supabase.from('program_page_sections').select('*').eq('program_id', programId).order('sort_order'),
  ]);

  if (programResult.error) {
    throw new Error(programResult.error.message || 'Failed to fetch program');
  }
  if (configResult.error) {
    throw new Error(configResult.error.message || 'Failed to fetch page config');
  }
  if (sectionsResult.error) {
    throw new Error(sectionsResult.error.message || 'Failed to fetch page sections');
  }

  const [sponsorsResult, faqsResult, timelineResult, roundsResult, categoriesResult] = await Promise.allSettled([
    supabase.from('program_sponsors').select('*').eq('program_id', programId).order('sort_order'),
    supabase.from('program_faqs').select('*').eq('program_id', programId).order('sort_order'),
    supabase.from('program_timeline_milestones').select('*').eq('program_id', programId).order('sort_order'),
    supabase
      .from('rounds')
      .select('id, title, description, type, status, start_date, end_date, sort_order')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('id, title, description, parent_id, sort_order')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true }),
  ]);

  const safeData = (result: PromiseSettledResult<{ data?: unknown[] | null }>) =>
    result.status === 'fulfilled' ? result.value?.data || [] : [];

  const sponsors = safeData(sponsorsResult);
  const faqs = safeData(faqsResult);
  const timeline = safeData(timelineResult);
  const rounds = safeData(roundsResult);
  const awards = safeData(categoriesResult);

  return {
    program: programResult.data || null,
    config: configResult.data || null,
    sections: sectionsResult.data || [],
    sponsors,
    faqs,
    timeline,
    rounds,
    awards,
    schedule: {
      deadline: programResult.data?.deadline || null,
      timezone: programResult.data?.timezone || null,
      rounds,
      milestones: timeline,
    },
  };
}

export async function getPublishedPublicOverviewBySlug(slug: string) {
  const supabase = createSupabaseAdmin();
  const { data: program, error } = await supabase
    .from('programs')
    .select('id, visibility')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch program by slug');
  }
  if (!program?.id) {
    return null;
  }

  const data = await getOverviewPayload(program.id);
  if (!data.config?.is_published || data.program?.visibility === 'private') {
    return null;
  }

  return data;
}

export async function getPublishedPublicOverviewByProgramId(programId: string) {
  const data = await getOverviewPayload(programId);
  if (!data.program || !data.config?.is_published || data.program.visibility === 'private') {
    return null;
  }
  return data;
}
