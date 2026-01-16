'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  bootstrapAuth,
  bootstrapAdminAuth,
  tokenService,
} from '@/utils/tokenService';
import { decodeToken } from '@/utils/jwt';
import { useAuthStore, useAdminAuthStore } from '@/stores';
import { navigationGuard } from '@/utils/navigationGuard';

/**
 * 앱 시작 시 인증 상태 초기화 및 자동 로그인 처리
 */
export default function AuthInitializer() {
  const router = useRouter();
  const { hasHydrated } = useAuthStore();
  const { hasHydrated: adminHasHydrated } = useAdminAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // 스토어가 완전히 로드된 후에만 실행
      if (!hasHydrated || !adminHasHydrated) return;

      try {
        // 1) 스토어에 저장된 액세스 토큰을 메모리 토큰 서비스로 동기화
        // 메인은 로컬스토리지 토큰을 우선으로 사용하므로 동기화 불필요

        // 현재 경로 확인
        const currentPath = window.location.pathname;
        const isAdminPath = currentPath.startsWith('/admin');
        const isLoginPath =
          currentPath === '/login' || currentPath === '/admin/login';

        if (isAdminPath && !isLoginPath) {
          // 관리자 페이지: 앱 시작 시 자동 리프레시 없이, 토큰 존재만 확인
          const adminToken =
            typeof window !== 'undefined'
              ? localStorage.getItem('kmaAdminAccessToken')
              : tokenService.getAdminAccessToken();
          if (!adminToken) {
            await navigationGuard.safeNavigate(() => {
              router.replace('/admin/login');
            });
          }
        } else if (!isLoginPath && !isAdminPath) {
          // 일반 페이지인 경우 사용자 인증 확인
          const isUserAuthed = await bootstrapAuth();
          if (!isUserAuthed) {
            // 로그인이 필요한 페이지인지 확인 (예: 마이페이지)
            if (currentPath.startsWith('/mypage')) {
              await navigationGuard.safeNavigate(() => {
                router.replace(
                  `/login?returnUrl=${encodeURIComponent(currentPath)}`
                );
              });
            }
          } else {
            // 토큰은 있는데 스토어 user가 비어 있을 수 있으므로 보정
            const state = useAuthStore.getState();
            if (!state.user) {
              const at =
                typeof window !== 'undefined'
                  ? localStorage.getItem('kmaAccessToken')
                  : null;
              if (at) {
                try {
                  const decoded = decodeToken(at) as {
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
                          : normalizeRoleName(
                              (r as { authority?: string })?.authority
                            );
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

                  useAuthStore.setState({
                    user: {
                      id: decoded?.sub || 'user',
                      account: decoded?.name || 'user',
                      role: roles[0] || 'USER',
                      roles,
                    },
                  });
                } catch {
                  // ignore decode errors
                }
              }
            }
          }
        }
      } catch (error) {}
    };

    initializeAuth();
  }, [hasHydrated, adminHasHydrated, router]);

  // 로그아웃 브로드캐스트 리스너 설정
  useEffect(() => {
    const cleanup = tokenService.setupLogoutListener(async () => {
      // 다른 탭에서 로그아웃 시 현재 탭도 로그아웃 처리
      useAuthStore.getState().logout();
      useAdminAuthStore.getState().logout();

      // 현재 경로에 따라 적절한 페이지로 리다이렉트 (현재 탭이 아닌 경우에만)
      const currentPath = window.location.pathname;
      const isLoginPath =
        currentPath === '/login' || currentPath === '/admin/login';

      // 이미 로그인 페이지에 있지 않은 경우에만 리다이렉트
      if (!isLoginPath) {
        if (currentPath.startsWith('/admin')) {
          await navigationGuard.safeNavigate(() => {
            router.replace('/admin/login');
          }, 50); // 브로드캐스트는 약간의 지연 추가
        } else if (currentPath.startsWith('/mypage')) {
          await navigationGuard.safeNavigate(() => {
            router.replace(
              `/login?returnUrl=${encodeURIComponent(currentPath)}`
            );
          }, 50);
        }
      }
    });

    return cleanup;
  }, [router]);

  return null; // UI 렌더링 없음
}

