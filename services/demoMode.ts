let demoModeActive = false;

export function enableDemoMode(): void {
  demoModeActive = true;
}

export function disableDemoMode(): void {
  demoModeActive = false;
}

export function isDemoMode(): boolean {
  return demoModeActive;
}
