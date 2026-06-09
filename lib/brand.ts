export const LOGO_PATH = '/logo.png';

export const GITHUB_REPO = 'https://github.com/Cognivo-Future-Technologies-CFT/AwardX';

export function getPublicLogoUrl(siteUrl?: string): string {
  const base = (siteUrl || process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.awardx.one').replace(/\/$/, '');
  return `${base}${LOGO_PATH}`;
}

export function emailLogoHeader(siteUrl?: string, height = 44): string {
  const url = getPublicLogoUrl(siteUrl);
  return `<img src="${url}" alt="" height="${height}" style="height:${height}px;width:auto;display:block;margin:0 auto 8px;" />`;
}
