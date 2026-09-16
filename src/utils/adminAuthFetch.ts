import { extractCanRefresh } from '@/utils/authErrorResponse';
import { getTokenExpiryTime, isTokenValid } from '@/utils/jwt';
import { tokenService } from '@/utils/tokenService';

const EXPIRY_SKEW_MS = 30_000;
const LOGIN_REQUIRED = '인증 토큰이 없습니다. 다시 로그인해주세요.';
const SESSION_EXPIRED = '인증이 만료되었습니다. 다시 로그인해주세요.';

const needsRefresh = (token: string): boolean => {
  if (!isTokenValid(token)) return true;
  const remaining = getTokenExpiryTime(token);
  return remaining !== null && remaining < EXPIRY_SKEW_MS;
};

export async function getValidAdminAccessToken(): Promise<string> {
  let token = tokenService.getAdminAccessToken();
  if (!token) {
    throw new Error(LOGIN_REQUIRED);
  }

  if (needsRefresh(token)) {
    const refreshed = await tokenService.refreshAdminToken();
    token = tokenService.getAdminAccessToken();
    if (!refreshed || !token || !isTokenValid(token)) {
      throw new Error(SESSION_EXPIRED);
    }
  }

  return token;
}

const withAuthorization = (init: RequestInit | undefined, token: string): RequestInit => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
};

const shouldRetryWithRefresh = async (res: Response): Promise<boolean> => {
  if (res.status === 401) return true;
  if (res.status !== 403) return false;
  try {
    const data: unknown = await res.clone().json();
    return extractCanRefresh(data) === true;
  } catch {
    return false;
  }
};

/** 관리자 엑셀 다운로드·이미지 업로드 등 useFetch를 타지 않는 요청용 */
export async function adminAuthFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getValidAdminAccessToken();
  const first = await fetch(input, withAuthorization(init, token));

  if (!(await shouldRetryWithRefresh(first))) {
    return first;
  }

  const refreshed = await tokenService.refreshAdminToken();
  const retryToken = tokenService.getAdminAccessToken();
  if (!refreshed || !retryToken) {
    throw new Error(SESSION_EXPIRED);
  }

  return fetch(input, withAuthorization(init, retryToken));
}
