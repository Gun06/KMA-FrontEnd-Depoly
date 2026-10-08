export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.teambrain.kma.mobile'

export const APP_STORE_URL = 'https://apps.apple.com/kr/app/id6777857501'

export function getAppStoreUrl(userAgent?: string, platform?: string): string {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  const plt =
    platform ?? (typeof navigator !== 'undefined' ? navigator.platform : '')

  if (/Android/i.test(ua)) {
    return PLAY_STORE_URL
  }

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return APP_STORE_URL
  }

  if (plt === 'MacIntel') {
    return APP_STORE_URL
  }

  return PLAY_STORE_URL
}
