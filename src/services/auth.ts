'use client';

import { LoginFormData, LoginResponse } from '@/types/auth';
import { api, useApiMutation } from '@/hooks/useFetch';
import { useAuthStore } from '@/store/authStore';
import { decodeToken } from '@/utils/jwt';
import {
  setAccessToken as setMainAccessToken,
  setRefreshToken as setMainRefreshToken,
  getAccessToken as getMainAccessToken,
  getRefreshToken as getMainRefreshToken,
  clearTokens as clearMainTokens,
  setAccessTokenByMode,
  setRefreshTokenByMode,
  setRememberLogin,
} from '@/utils/jwt';
import { useState, useCallback, useEffect } from 'react';

/* ===========================
   공통 유틸 (any 금지 버전)
=========================== */

const isBrowser = (): boolean => typeof window !== 'undefined';

const saveTokens = (accessToken?: string, refreshToken?: string) => {
  if (!isBrowser()) return;
  if (accessToken) {
    setMainAccessToken(accessToken);
  }
  if (refreshToken) {
    setMainRefreshToken(refreshToken);
  }
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

/** JSON 안전 파서 (204/빈 본문/비 JSON 대응) */
const safeParseJson = async (res: Response): Promise<unknown | null> => {
  const ct = res.headers.get('content-type') || '';
  if (res.status === 204 || !ct.toLowerCase().includes('application/json'))
    return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

interface PickedTokens {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
}

/** 본문에서 토큰/유저 추출 (구조 유연) */
const pickTokensFromBody = (body: unknown): PickedTokens => {
  if (!isRecord(body)) return {};

  // 루트 레벨
  const accessTokenRoot =
    getString(body['accessToken']) ?? getString(body['token']);
  const refreshTokenRoot = getString(body['refreshToken']);
  const userRoot = body['user'];

  // data 레벨
  const data = isRecord(body['data'])
    ? (body['data'] as Record<string, unknown>)
    : undefined;
  const accessTokenData = data
    ? (getString(data['accessToken']) ?? getString(data['token']))
    : undefined;
  const refreshTokenData = data ? getString(data['refreshToken']) : undefined;
  const userData = data ? data['user'] : undefined;

  return {
    accessToken: accessTokenRoot ?? accessTokenData ?? undefined,
    refreshToken: refreshTokenRoot ?? refreshTokenData ?? undefined,
    user: userRoot ?? userData ?? undefined,
  };
};

/* ===========================
   타입
=========================== */

interface SignupApiRequest {
  account: {
    accountId: string;
    accountPassword: string;
  };
  profile: {
    birth: string;
    name: string;
    phNum: string;
    email: string;
    gender: 'M' | 'F';
  };
  consents: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    marketingAndAdvertisingSMS: boolean;
    marketingAndAdvertisingEmail: boolean;
    personalInfoCollectionAndUse: boolean;
  };
  address: {
    siDo: string;
    siGunGu: string;
    roadAddress: string;
    zipCode: string;
    addressDetail: string;
  };
}

interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
  errors?: unknown;
}

/* ===========================
   중복 아이디 체크 훅
=========================== */

export const useCheckAccountDuplicate = (
  accountId: string,
  enabled: boolean = false
) => {
  const [data, setData] = useState<{
    isDuplicate: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkDuplicate = useCallback(async (): Promise<void> => {
    if (!enabled || !accountId) return;
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `/api/v1/public/duplicate-check/account-id?id=${encodeURIComponent(accountId)}`;
      await api.get<{ isDuplicate: boolean; message: string }>(
        'user',
        endpoint
      );
      setData({ isDuplicate: false, message: '사용 가능한 아이디입니다.' });
    } catch (err: unknown) {
      if (isRecord(err) && 'status' in err) {
        const status =
          typeof (err as { status?: unknown }).status === 'number'
            ? (err as { status: number }).status
            : undefined;
        if (status === 400) {
          setData({
            isDuplicate: true,
            message: '이미 사용 중인 아이디입니다.',
          });
          setIsLoading(false);
          return;
        }
      }
      const msg =
        err instanceof Error
          ? err.message
          : '중복 검사 중 오류가 발생했습니다.';
      setError(new Error(msg));
    } finally {
      setIsLoading(false);
    }
  }, [accountId, enabled]);

  useEffect(() => {
    if (enabled) void checkDuplicate();
  }, [checkDuplicate, enabled]);

  return { data, isLoading, error, refetch: checkDuplicate };
};

/* ===========================
   회원가입 훅 (React Query)
=========================== */

export const useSignup = () => {
  return useApiMutation<SignupResponse, SignupApiRequest>(
    '/api/v1/public/register',
    'user',
    'POST',
    false,
    {
      onSuccess: data => {
        if (data?.token) {
          saveTokens(data.token, undefined);
        }
      },
      onError: error => {
        // eslint-disable-next-line no-console
        console.error('Signup error:', error);
      },
    }
  );
};

/* ===========================
   로그인 데이터 변환
=========================== */

export const transformLoginData = (credentials: LoginFormData) => ({
  accountId: credentials.id,
  accountPw: credentials.password,
});

/* ===========================
   로그인 핵심 함수
=========================== */

export const loginWithHeaders = async (
  credentials: LoginFormData
): Promise<LoginResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const url = `${API_BASE_URL}/api/v1/public/login`;

  const requestData = {
    accountId: credentials.id,
    accountPw: credentials.password,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('Login failed:', response.status, errorText);
    throw new Error(`로그인 실패: ${response.status}`);
  }

  // 헤더 우선 추출 (서버가 Expose 설정 제공)
  let accessToken =
    response.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    undefined;
  let refreshToken =
    response.headers.get('refreshtoken')?.replace(/^Bearer\s+/i, '') ||
    undefined;

  // 저장은 remember 모드에 따라 수행
  const remember = !!credentials.rememberId;
  if (accessToken) setAccessTokenByMode(accessToken, remember);
  if (refreshToken) setRefreshTokenByMode(refreshToken, remember);

  // 본문 파싱 (현재 서버는 "LOGIN_SUCCESS" 문자열이지만, 타 환경 대비)
  const body = await safeParseJson(response);
  if ((!accessToken || !refreshToken) && body) {
    const picked = pickTokensFromBody(body);
    accessToken = accessToken ?? picked.accessToken;
    refreshToken = refreshToken ?? picked.refreshToken;
    if (accessToken) setAccessTokenByMode(accessToken, remember);
    if (refreshToken) setRefreshTokenByMode(refreshToken, remember);
  }

  // remember flag 및 ID 처리
  if (isBrowser()) {
    // 로그인 유지 플래그 저장 (스토리지 모드 동기화용)
    setRememberLogin(remember);
    // 기존 UI 호환: 체크 시 입력한 계정 보관
    if (credentials.rememberId) {
      localStorage.setItem('rememberedId', credentials.id);
    } else {
      localStorage.removeItem('rememberedId');
    }
  }

  return {
    success: true,
    message: '로그인 성공',
    accessToken,
    refreshToken,
    token: accessToken, // 호환
    user:
      body && isRecord(body) && isRecord(body.user)
        ? {
            id: getString(body.user.id) || '',
            name: getString(body.user.name) || '',
            email: getString(body.user.email) || '',
          }
        : undefined,
  };
};

/* ===========================
   로그인 훅
=========================== */

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (credentials: LoginFormData): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginWithHeaders(credentials);
      return result;
    } catch (err: unknown) {
      const e =
        err instanceof Error
          ? err
          : new Error('로그인 중 오류가 발생했습니다.');
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: login,
    mutateAsync: login,
    isLoading,
    error,
    reset: () => setError(null),
  };
};

/* ===========================
   인증 서비스
=========================== */

export const authService = {
  async checkAccountDuplicate(
    accountId: string
  ): Promise<{ isDuplicate: boolean; message: string }> {
    const endpoint = `/api/v1/public/duplicate-check/account-id?id=${encodeURIComponent(accountId)}`;
    try {
      await api.get<{ isDuplicate: boolean; message: string }>(
        'user',
        endpoint
      );
      return { isDuplicate: false, message: '사용 가능한 아이디입니다.' };
    } catch (error: unknown) {
      if (isRecord(error) && 'status' in error) {
        const status =
          typeof (error as { status?: unknown }).status === 'number'
            ? (error as { status: number }).status
            : undefined;
        if (status === 400) {
          return { isDuplicate: true, message: '이미 사용 중인 아이디입니다.' };
        }
      }
      const msg =
        error instanceof Error
          ? error.message
          : '중복 검사 중 알 수 없는 오류가 발생했습니다.';
      throw new Error(`중복 검사 중 오류가 발생했습니다: ${msg}`);
    }
  },

  async signup(signupData: SignupApiRequest): Promise<SignupResponse> {
    try {
      const response = await api.post<SignupResponse>(
        'user',
        '/api/v1/public/register',
        signupData
      );
      if (response?.token) {
        saveTokens(response.token, undefined);
      }
      return (
        response ?? { success: true, message: '회원가입이 완료되었습니다.' }
      );
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(credentials: LoginFormData): Promise<LoginResponse> {
    // 중복 제거: fetch 기반 함수만 사용
    const result = await loginWithHeaders(credentials);

    try {
      const token = result.accessToken || result.token;
      if (typeof window !== 'undefined' && token) {
        // JWT에서 사용자 정보 및 역할 추출
        const decoded = decodeToken(token) as {
          sub?: string;
          name?: string;
          role?: Array<{ authority?: string } | string>;
          roles?: Array<string>;
        } | null;

        const normalizeRoleName = (role?: unknown): string | null => {
          if (typeof role !== 'string') return null;
          const upper = role.toUpperCase();
          return upper.startsWith('ROLE_')
            ? upper.replace(/^ROLE_/i, '')
            : upper;
        };

        const extractedRoles: string[] = [];
        if (Array.isArray(decoded?.role)) {
          for (const r of decoded!.role) {
            const n =
              typeof r === 'string'
                ? normalizeRoleName(r)
                : normalizeRoleName(r?.authority);
            if (n) extractedRoles.push(n);
          }
        }
        if (Array.isArray(decoded?.roles)) {
          for (const r of decoded!.roles) {
            const n = normalizeRoleName(r);
            if (n) extractedRoles.push(n);
          }
        }
        const roles = Array.from(new Set(extractedRoles));

        // 전역 auth store 업데이트
        useAuthStore.getState().login(
          {
            accessToken: token,
            refreshToken: result.refreshToken,
          },
          {
            id: decoded?.sub || 'user',
            account: decoded?.name || credentials.id,
            role: roles[0] || 'USER',
            roles,
          }
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로그인 후처리 실패:', error);
    }

    return result;
  },

  async logout(): Promise<void> {
    try {
      await api.authPost('user', '/auth/logout');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', error);
    } finally {
      if (isBrowser()) {
        clearMainTokens();
        localStorage.removeItem('user');
      }
      // 전역 auth store 정리
      try {
        useAuthStore.getState().logout();
      } catch {
        // ignore
      }
    }
  },

  getToken(): string | null {
    if (!isBrowser()) return null;
    return getMainAccessToken();
  },

  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return getMainAccessToken();
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return getMainRefreshToken();
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getRememberedId(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem('rememberedId');
  },

  async findId(data: { name: string; email?: string; phone?: string }): Promise<{ id: string }> {
    try {
      const endpoint = '/api/v1/public/find-id'
      const response = await api.post<{ id: string }>('user', endpoint, data)
      return response ?? { id: '' }
    } catch (error: unknown) {
      console.error('Find ID error:', error)
      throw error
    }
  },

  async findPassword(data: { accountId: string; name: string; email: string }): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = '/api/v1/public/find-password'
      const response = await api.post<{ success: boolean; message: string }>('user', endpoint, data)
      return response ?? { success: false, message: '비밀번호 찾기에 실패했습니다.' }
    } catch (error: unknown) {
      console.error('Find Password error:', error)
      throw error
    }
  },

  async resetPassword(data: { accountId: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = '/api/v1/public/reset-password'
      const response = await api.post<{ success: boolean; message: string }>('user', endpoint, data)
      return response ?? { success: false, message: '비밀번호 재설정에 실패했습니다.' }
    } catch (error: unknown) {
      console.error('Reset Password error:', error)
      throw error
    }
  },
}
