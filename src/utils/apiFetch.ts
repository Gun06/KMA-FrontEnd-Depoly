// src/utils/apiFetch.ts
type AuthMode = 'none' | 'cookie' | 'bearer';
import { tokenService } from '@/utils/tokenService';

// 지금은 'none' → 쿠키 안 붙음(431 방지). API 붙이면 'cookie'나 'bearer'로만 바꿔.
export const AUTH_MODE: AuthMode =
  (process.env.NEXT_PUBLIC_AUTH_MODE as AuthMode) || 'cookie';

export const USE_API = AUTH_MODE !== 'none';  // ← 별도 스위치 불필요

function getAccessToken(): string | null {
  // 실제 로그인 토큰 사용 (메모리/로컬스토리지)
  return tokenService.getAccessToken();
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  if (AUTH_MODE === 'bearer') {
    let token = getAccessToken();
    if (!token && typeof window !== 'undefined') {
      // 토큰이 없고, 리프레시 가능하면 갱신 시도
      await tokenService.refreshAccessToken();
      token = getAccessToken();
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const credentials: RequestCredentials = AUTH_MODE === 'cookie' ? 'include' : 'omit';
  const res = await fetch(input, { ...init, headers, credentials });
  return res;
}

export async function apiJson<T=any>(input: RequestInfo | URL, init?: RequestInit) {
  const res = await apiFetch(input, init);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
