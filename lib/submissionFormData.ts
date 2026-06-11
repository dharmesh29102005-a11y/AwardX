/** Keys stored in submission_data that are not applicant-facing form answers. */
export const SUBMISSION_DATA_META_KEYS = new Set([
  'form_id',
  'form_title',
  'submitted_at',
  'responses',
  'votes',
  '__v',
  'source',
  'index',
  'seeded',
  'status',
  'shortlisted',
  'cold_start',
]);

export function extractSubmissionResponses(
  data: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const payload = data || {};

  const nested =
    payload.responses && typeof payload.responses === 'object' && !Array.isArray(payload.responses)
      ? (payload.responses as Record<string, unknown>)
      : null;

  const source = nested ?? payload;

  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !SUBMISSION_DATA_META_KEYS.has(key.toLowerCase())),
  );
}

export function getSubmissionFormId(data: Record<string, unknown> | null | undefined): string | null {
  const formId = data?.form_id;
  return typeof formId === 'string' && formId.length > 0 ? formId : null;
}
