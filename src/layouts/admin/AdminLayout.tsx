'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/Header';
import AdminNavigation from '@/components/admin/Navigation';
import AdminFooter from '@/components/admin/Footer';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { tokenService } from '@/utils/tokenService';
import { navigationGuard } from '@/utils/navigationGuard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { accessToken, user, hasHydrated } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === '/admin/login';
  const isAuthed = !!tokenService.getAdminAccessToken();
  const roles = user?.roles || [];
  const primaryRole = user?.role || '';
  const allRoles = Array.from(
    new Set([primaryRole, ...roles].filter(Boolean))
  ).map(r => r.toUpperCase().replace(/^ROLE_/i, ''));
  const allowed = [
    'SUPER_ADMIN',
    'DEPOSIT_ADMIN',
    'EVENT_ADMIN',
    'BOARD_ADMIN',
  ];
  const isAdminRole = allRoles.some(r => allowed.includes(r));

  useEffect(() => {
    // hasHydrated가 false여도 accessToken이 이미 있으면 동작 가능하도록 완화
    if (!hasHydrated || !isAuthed) return;
    
    const handleNavigation = async () => {
      // 로그인 페이지 접근 시: 이미 인증됐다면 /admin으로 보냄
      if (isLoginRoute) {
        if (isAuthed) {
          await navigationGuard.safeNavigate(() => {
            router.replace('/admin');
          });
        }
        return;
      }
      
      // 그 외 페이지: 인증과 관리자 역할 확인 (현재는 관리자면 모두 허용)
      if (!isAuthed) {
        // 로그아웃 상태에서만 리다이렉트 (깜빡거림 방지)
        if (hasHydrated) {
          await navigationGuard.safeNavigate(() => {
            router.replace('/admin/login');
          });
        }
        return;
      }
      
      // 역할 체크는 일단 관리자 계열이면 통과 (allowed 목록)
      if (!isAdminRole) {
        await navigationGuard.safeNavigate(() => {
          router.replace('/admin/login');
        });
      }
    };

    handleNavigation();
  }, [hasHydrated, isAuthed, isLoginRoute, isAdminRole, router]);

  if (isLoginRoute) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AdminHeader />
      <div className="pt-16 flex-1 flex flex-col">
        <AdminNavigation />
        <main className="flex-1 bg-white pt-6">{children}</main>
      </div>
      {/* Footer 상단 구분선 및 Admin Footer 렌더 */}
      <div className="w-full border-t border-gray-200" />
      <AdminFooter />
    </div>
  );
}
