/**
 * 보안 강화된 토큰 관리 서비스
 * GPT 솔루션 기반: 액세스 토큰은 메모리, 리프레시 토큰만 localStorage
 * 3단계: 리프레시 토큰 암호화 추가
 */

import { decodeToken, isTokenValid, getRememberLogin } from './jwt';

// 메모리 기반 액세스 토큰 저장 (메인은 사용 중단; 관리자만 유지)
let accessToken: string | null = null;
let adminAccessToken: string | null = null;

// 리프레시 토큰 갱신 중 플래그 (동시 요청 방지)
let isRefreshing = false;
let isAdminRefreshing = false;

// 갱신 대기 중인 요청들
let refreshQueue: Array<() => void> = [];
let adminRefreshQueue: Array<() => void> = [];

// (관리자도 평문 저장 정책으로 변경됨에 따라 암복호화 로직 제거)

export const tokenService = {
  // === 메인 사용자 토큰 관리 ===

  /**
   * 액세스 토큰 설정 (메모리만)
   */
  setAccessToken: (token: string | null) => {
    // 메인 정책 변경: 로컬스토리지 사용. 이 메서드는 하위호환 위해 유지하되 no-op로 둡니다.
    accessToken = token;
  },

  /**
   * 액세스 토큰 조회 (메모리에서)
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return accessToken;
    // 메인은 로컬스토리지에서 읽기 (신규 키 우선, 구 키 폴백)
    return localStorage.getItem('kmaAccessToken') || accessToken;
  },

  /**
   * 리프레시 토큰 저장 (localStorage + 암호화)
   */
  saveRefreshToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    // 메인 정책 변경: 평문 키로 저장
    if (!token) {
      localStorage.removeItem('kmaRefreshToken');
      return;
    }
    localStorage.setItem('kmaRefreshToken', token);
  },

  /**
   * 리프레시 토큰 조회 (복호화)
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    // 메인 정책 변경: 평문 키에서 읽기 (신규 키 우선, 구 키 폴백)
    const token = localStorage.getItem('kmaRefreshToken');
    return token ?? null;
  },

  // rememberMe API 제거 → getRememberLogin 사용

  /**
   * 토큰 유효성 검사 (만료 시간 포함)
   */
  isTokenValid: (): boolean => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('kmaAccessToken')
        : accessToken;
    if (!token) return false;
    return isTokenValid(token);
  },

  /**
   * 토큰 만료까지 남은 시간 (밀리초)
   */
  getTokenExpiryTime: (): number | null => {
    if (!accessToken) return null;

    try {
      const payload = decodeToken(accessToken);
      if (!payload || typeof payload.exp !== 'number') return null;

      const currentTime = Date.now() / 1000;
      return Math.max(0, (payload.exp - currentTime) * 1000);
    } catch {
      return null;
    }
  },

  /**
   * 토큰이 곧 만료되는지 확인 (30초 이내)
   */
  isTokenExpiringSoon: (): boolean => {
    const expiryTime = tokenService.getTokenExpiryTime();
    return expiryTime !== null && expiryTime < 30000; // 30초
  },

  // === 관리자 토큰 관리 ===

  setAdminAccessToken: (token: string | null) => {
    adminAccessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('kmaAdminAccessToken', token);
      } else {
        localStorage.removeItem('kmaAdminAccessToken');
      }
    }
  },

  getAdminAccessToken: (): string | null => {
    if (typeof window === 'undefined') return adminAccessToken;
    return localStorage.getItem('kmaAdminAccessToken') || adminAccessToken;
  },

  saveAdminRefreshToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (!token) {
      localStorage.removeItem('kmaAdminRefreshToken');
      return;
    }
    // 관리자도 사용자와 동일 정책: 평문 저장
    localStorage.setItem('kmaAdminRefreshToken', token);
  },

  getAdminRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('kmaAdminRefreshToken');
    return token ?? null;
  },

  isAdminTokenValid: (): boolean => {
    if (!adminAccessToken) return false;
    return isTokenValid(adminAccessToken);
  },

  // === 토큰 갱신 관리 ===

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   */
  refreshAccessToken: async (): Promise<boolean> => {
    if (isRefreshing) {
      // 이미 갱신 중이면 대기
      return new Promise(resolve => {
        refreshQueue.push(() => resolve(true));
      });
    }

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    isRefreshing = true;

    try {
      // 메인(유저) 리프레시: 헤더 기반 /api/v1/public/refresh
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_USER || '';
      const url = /^https?:/i.test('/api/v1/public/refresh')
        ? '/api/v1/public/refresh'
        : `${baseUrl.replace(/\/+$/, '')}/api/v1/public/refresh`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          // 서버 요구사항: 헤더로 전달
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          try {
            tokenService.clearAllTokens();
            tokenService.broadcastLogout();
          } catch {}
        }
        throw new Error('토큰 갱신 실패');
      }

      // 우선 헤더에서 추출
      let newAccessToken =
        response.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
        undefined;
      let newRefreshToken =
        response.headers.get('refreshtoken')?.replace(/^Bearer\s+/i, '') ||
        undefined;

      // 본문 폴백
      if (!newAccessToken || !newRefreshToken) {
        try {
          const data = await response.clone().json();
          newAccessToken =
            newAccessToken ?? (data?.accessToken as string | undefined);
          newRefreshToken =
            newRefreshToken ?? (data?.refreshToken as string | undefined);
        } catch {
          // ignore json fallback
        }
      }

      if (!newAccessToken) return false;

      tokenService.setAccessToken(newAccessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kmaAccessToken', newAccessToken);
      }
      if (newRefreshToken) {
        tokenService.saveRefreshToken(newRefreshToken);
      }
      return true;
    } catch (_error) {
      return false;
    } finally {
      isRefreshing = false;

      // 대기 중인 요청들 처리
      refreshQueue.forEach(callback => callback());
      refreshQueue = [];
    }
  },

  /**
   * 관리자 토큰 갱신
   */
  refreshAdminToken: async (): Promise<boolean> => {
    if (isAdminRefreshing) {
      return new Promise(resolve => {
        adminRefreshQueue.push(() => resolve(true));
      });
    }

    const adminAccessToken = tokenService.getAdminAccessToken();

    const adminRefreshToken = tokenService.getAdminRefreshToken();
    if (!adminRefreshToken) {
      return false;
    }

    isAdminRefreshing = true;

    try { 
      // 관리자 리프레시: 헤더 기반 /api/v1/admin/refresh
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || '';
      const endpoint = '/api/v1/admin/refresh';
      const url = /^https?:/i.test(endpoint)
        ? endpoint
        : `${baseUrl.replace(/\/+$/, '')}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
          RefreshToken: `Bearer ${adminRefreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          try {
            tokenService.clearAllTokens();
            tokenService.broadcastLogout();
          } catch {}
        }
        throw new Error('관리자 토큰 갱신 실패');
      }

      // 헤더 우선 추출
      let newAccessToken =
        response.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
        undefined;
      let newRefreshToken =
        response.headers.get('refreshtoken')?.replace(/^Bearer\s+/i, '') ||
        undefined;

      // 본문 폴백
      if (!newAccessToken || !newRefreshToken) {
        try {
          const data = await response.clone().json();
          newAccessToken =
            newAccessToken ?? (data?.accessToken as string | undefined);
          newRefreshToken =
            newRefreshToken ?? (data?.refreshToken as string | undefined);
        } catch {
          // ignore json fallback
        }
      }

      if (!newAccessToken) return false;

      tokenService.setAdminAccessToken(newAccessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kmaAdminAccessToken', newAccessToken);
      }
      if (newRefreshToken) {
        tokenService.saveAdminRefreshToken(newRefreshToken);
      }
      return true;
    } catch (_error) {
      return false;
    } finally {
      isAdminRefreshing = false;

      adminRefreshQueue.forEach(callback => callback());
      adminRefreshQueue = [];
    }
  },

  // === 로그아웃 및 정리 ===

  /**
   * 모든 토큰 정리
   */
  clearAllTokens: () => {
    accessToken = null;
    adminAccessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmaAccessToken');
      localStorage.removeItem('kmaRefreshToken');
      localStorage.removeItem('kmaAdminRefreshToken');
    }
  },

  /**
   * 로그아웃 브로드캐스트 (다른 탭에 알림)
   */
  broadcastLogout: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmaLogoutBroadcast', String(Date.now()));
    }
  },

  /**
   * 로그아웃 브로드캐스트 리스너 설정
   */
  setupLogoutListener: (onLogout: () => void) => {
    if (typeof window === 'undefined') return () => {};

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kmaLogoutBroadcast') {
        onLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 정리 함수 반환
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  },
};

// 앱 시작 시 자동 로그인 시도
export const bootstrapAuth = async (): Promise<boolean> => {
  // 이미 유효한 토큰이 있으면 성공
  if (tokenService.isTokenValid()) {
    return true;
  }

  // 로그인 유지 설정(kmaRememberLogin)이고 리프레시 토큰이 있으면 갱신 시도
  if (getRememberLogin() === true && tokenService.getRefreshToken()) {
    return await tokenService.refreshAccessToken();
  }

  return false;
};

// 관리자 자동 로그인
export const bootstrapAdminAuth = async (): Promise<boolean> => {
  if (tokenService.isAdminTokenValid()) {
    return true;
  }

  if (tokenService.getAdminRefreshToken()) {
    return await tokenService.refreshAdminToken();
  }

  return false;
};
