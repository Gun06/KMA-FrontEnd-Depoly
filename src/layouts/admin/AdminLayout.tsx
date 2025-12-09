'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, X, AlertCircle } from 'lucide-react';
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
      
      // 역할 체크는 일단 관리자 계열이면 통과 (allowed 목록)
      if (!isAdminRole && isAuthed) {
        await navigationGuard.safeNavigate(() => {
          router.replace('/admin/login');
        });
      }
    };

    handleNavigation();
  }, [hasHydrated, isAuthed, isLoginRoute, isAdminRole, router]);

  if (isLoginRoute) return <>{children}</>;

  // 로그아웃 상태 확인 - 토큰이 없으면 로그아웃 상태로 간주
  const showBlurOverlay = !isAuthed;

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <AdminHeader />
      <div className="pt-16 flex-1 flex flex-col relative">
        <AdminNavigation />
        <main className={`flex-1 bg-white pt-6 transition-all duration-300 ${showBlurOverlay ? 'blur-sm pointer-events-none' : ''}`}>
          {children}
        </main>
        
        {/* 블러 오버레이 및 로그인 버튼 */}
        {showBlurOverlay && (
          <>
            {/* 권한 오류 메시지 배너 - 헤더 아래 */}
            <div className="fixed top-16 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-3 shadow-lg">
              <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">이 작업을 수행할 권한이 없습니다.</span>
                </div>
                <button
                  onClick={() => router.push('/admin/login')}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* 검은색 반투명 오버레이 및 로그인 버튼 */}
            <div className="fixed inset-0 top-16 flex items-center justify-center bg-black/50 z-[150] pt-12">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  로그인이 필요합니다
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  관리자 페이지에 접근하려면 로그인해주세요.
                </p>
                <button
                  onClick={() => router.push('/admin/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  로그인하러 가기
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Footer 상단 구분선 및 Admin Footer 렌더 */}
      <div className="w-full border-t border-gray-200" />
      <AdminFooter />
    </div>
  );
}
