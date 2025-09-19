/**
 * JWT 토큰 관리 유틸리티
 */

const TOKEN_KEY = 'kmaAccessToken';
const REFRESH_TOKEN_KEY = 'kmaRefreshToken';
const REMEMBER_LOGIN_KEY = 'kmaRememberLogin';
const ADMIN_TOKEN_KEY = 'kmaAdminAccessToken';
const ADMIN_REFRESH_TOKEN_KEY = 'kmaAdminRefreshToken';

/**
 * 로컬 스토리지에서 액세스 토큰을 가져옵니다
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // 세션 우선, 없으면 로컬 조회
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장합니다
 */
export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

/** remember 여부에 따라 저장소 분기 저장 (true: localStorage, false: sessionStorage) */
export const setAccessTokenByMode = (
  token: string,
  remember: boolean
): void => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * 로컬 스토리지에서 리프레시 토큰을 가져옵니다
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // 세션 우선, 없으면 로컬 조회
  return (
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ??
    localStorage.getItem(REFRESH_TOKEN_KEY)
  );
};

/**
 * 로컬 스토리지에 리프레시 토큰을 저장합니다
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/** remember 여부에 따라 저장소 분기 저장 (true: localStorage, false: sessionStorage) */
export const setRefreshTokenByMode = (
  token: string,
  remember: boolean
): void => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * 모든 토큰을 제거합니다
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  // 두 저장소 모두 정리
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

/** 로그인 상태 유지 플래그 저장/조회 */
export const setRememberLogin = (remember: boolean): void => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem(REMEMBER_LOGIN_KEY, 'true');
    sessionStorage.removeItem(REMEMBER_LOGIN_KEY);
  } else {
    sessionStorage.setItem(REMEMBER_LOGIN_KEY, 'false');
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
  }
};

export const getRememberLogin = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  const inSession = sessionStorage.getItem(REMEMBER_LOGIN_KEY);
  if (inSession != null) return inSession === 'true';
  const inLocal = localStorage.getItem(REMEMBER_LOGIN_KEY);
  if (inLocal != null) return inLocal === 'true';
  return null;
};

/**
 * 관리자 토큰 전용 헬퍼
 */
export const getAdminAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const getAdminRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const clearAdminTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

/**
 * JWT 토큰이 유효한지 확인합니다 (만료 시간 체크)
 */
const decodeBase64UrlToJson = (segment: string): any => {
  // Base64URL -> Base64
  let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);

  // Base64 -> bytes
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  // bytes(UTF-8) -> string -> JSON
  const jsonText = new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(jsonText);
};

export const isTokenValid = (token: string): boolean => {
  try {
    const segment = token.split('.')[1];
    if (!segment) return false;
    const payload = decodeBase64UrlToJson(segment);
    const currentTime = Date.now() / 1000;
    return typeof payload.exp === 'number' && payload.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * JWT 토큰에서 페이로드를 추출합니다
 */
export const decodeToken = (token: string) => {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    return decodeBase64UrlToJson(segment);
  } catch {
    return null;
  }
};

/**
 * 토큰 만료 시간까지 남은 시간을 밀리초 단위로 반환합니다
 */
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const payload = decodeBase64UrlToJson(segment);
    const currentTime = Date.now() / 1000;
    return typeof payload.exp === 'number'
      ? Math.max(0, (payload.exp - currentTime) * 1000)
      : null;
  } catch {
    return null;
  }
};
