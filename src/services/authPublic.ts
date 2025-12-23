'use client';

import { useAuthStore } from '@/stores';
import { tokenService } from '@/utils/tokenService';

/**
 * 팀 공용 인증 파사드 (안정 API)
 * - 이 파일의 export API 시그니처는 고정합니다.
 * - 내부 구현은 자유롭게 교체/개선 가능.
 */

/** 사용자 프로필 표준 형태 */
export interface PublicUserProfile {
  id: string;
  account: string;
  name?: string;
  roles?: string[];
}

/** 로그인 상태 확인 */
export function isLoggedIn(): boolean {
  const { isLoggedIn, accessToken } = useAuthStore.getState();
  const ls =
    typeof window !== 'undefined'
      ? localStorage.getItem('kmaAccessToken')
      : null;
  return !!ls || !!accessToken || !!isLoggedIn;
}

/** 액세스 토큰(AT) 가져오기 */
export function getAccessToken(): string | null {
  // 메인은 로컬스토리지 우선
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kmaAccessToken') || null;
}

/** 리프레시 토큰(RT) 가져오기 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kmaRefreshToken') || null;
}

/** 사용자 정보 조회 (없으면 null) */
export function getUser(): PublicUserProfile | null {
  const { user } = useAuthStore.getState();
  if (!user) return null;
  return {
    id: user.id,
    account: user.account,
    name: (user as any).name,
    roles: user.roles,
  };
}

/** 사용자명(표시용) */
export function getDisplayName(): string | null {
  const u = getUser();
  if (!u) return null;
  return u.name || u.account || u.id || null;
}

/**
 * 로그인 상태 변경 구독
 * - 컴포넌트 외부에서도 사용할 수 있는 경량 구독자 제공
 * - 반환값: 해제 함수
 */
export function subscribeAuth(
  callback: (state: {
    isLoggedIn: boolean;
    accessToken: string | null;
    user: PublicUserProfile | null;
  }) => void
): () => void {
  return useAuthStore.subscribe(s => {
    callback({
      isLoggedIn: s.isLoggedIn || !!s.accessToken,
      accessToken: s.accessToken,
      user: s.user
        ? {
            id: s.user.id,
            account: s.user.account,
            name: (s.user as any).name,
            roles: s.user.roles,
          }
        : null,
    });
  });
}

/** 강제 로그아웃 유틸 (공용) */
export function forceLogout(): void {
  try {
    tokenService.clearAllTokens();
  } finally {
    useAuthStore.getState().logout();
    tokenService.broadcastLogout();
  }
}
