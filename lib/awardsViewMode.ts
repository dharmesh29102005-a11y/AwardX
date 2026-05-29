export type AwardsViewMode = 'list' | 'workflow' | 'tiles';

const STORAGE_PREFIX = 'awardx:awards-view:';

export function readAwardsViewMode(programId: string): AwardsViewMode {
  if (typeof window === 'undefined') return 'workflow';
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${programId}`);
  if (raw === 'list' || raw === 'workflow' || raw === 'tiles') return raw;
  return 'workflow';
}

export function writeAwardsViewMode(programId: string, mode: AwardsViewMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${programId}`, mode);
}

export function toggleAwardsCanvasMode(mode: AwardsViewMode): AwardsViewMode {
  return mode === 'tiles' ? 'workflow' : 'tiles';
}

export function holdHintForAwardsMode(mode: AwardsViewMode): string {
  return mode === 'tiles' ? 'Hold to view flow' : 'Hold to view tiles';
}
