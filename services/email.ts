const envBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
const isLocalBackend = envBackendUrl.includes('localhost') || envBackendUrl.includes('127.0.0.1');
const backendUrl = envBackendUrl && !isLocalBackend ? envBackendUrl : '';

type TeamInvitePayload = {
  email: string;
  roleName?: string;
  programTitle: string;
  inviteUrl?: string;
};

type JudgeInvitePayload = {
  email: string;
  name: string;
  programTitle: string;
  inviteUrl?: string;
};

async function postJson(path: string, payload: Record<string, any>) {
  try {
    const url = backendUrl ? `${backendUrl}${path}` : path;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Email delivery failures should not block UI flows.
  }
}

export async function sendTeamInviteEmail(payload: TeamInvitePayload) {
  if (!payload.email) return;
  await postJson('/api/invites/team', payload);
}

export async function sendJudgeInviteEmail(payload: JudgeInvitePayload) {
  if (!payload.email) return;
  await postJson('/api/invites/judge', payload);
}
