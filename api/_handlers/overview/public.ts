import {
  getPublishedPublicOverviewByProgramId,
  getPublishedPublicOverviewBySlug,
} from '../../_lib/overviewPayload';

export async function overviewPublicBySlug(_req: any, res: any, slug: string) {
  if (!slug) {
    res.status(400).json({ error: 'slug is required' });
    return;
  }

  try {
    const payload = await getPublishedPublicOverviewBySlug(slug);
    if (!payload) {
      res.status(404).json({ error: 'Published public program page not found' });
      return;
    }
    res.status(200).json({ data: payload });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}

export async function overviewPublicByProgramId(_req: any, res: any, programId: string) {
  if (!programId) {
    res.status(400).json({ error: 'programId is required' });
    return;
  }

  try {
    const payload = await getPublishedPublicOverviewByProgramId(programId);
    if (!payload) {
      res.status(404).json({ error: 'Published public program page not found' });
      return;
    }
    res.status(200).json({ data: payload });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}
