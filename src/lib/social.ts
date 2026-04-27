export const TIKTOK_HANDLE = '@lucasbennett1996'
export const TIKTOK_USERNAME = 'lucasbennett1996'
export const TIKTOK_URL = 'https://www.tiktok.com/@lucasbennett1996'

export function normalizeTikTokStat<T extends { followers?: number; handle?: string; url?: string }>(stat?: T) {
  return {
    followers: stat?.followers ?? 41,
    handle: TIKTOK_HANDLE,
    url: TIKTOK_URL
  }
}
