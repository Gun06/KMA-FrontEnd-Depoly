'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, X, AlertCircle, PanelLeft } from 'lucide-react';
import AdminSidebar, { ADMIN_SIDEBAR_WIDTH } from '@/components/admin/Sidebar';
import UtilityIcons from '@/components/admin/Header/UtilityIcons';
import AdminNavigation from '@/components/admin/Navigation';
import AdminFooter from '@/components/admin/Footer';
import { useAdminAuthStore } from '@/stores';
import { tokenService } from '@/utils/tokenService';
import { navigationGuard } from '@/utils/navigationGuard';

const CARD_LIST_ROUTES = [
  /^\/admin$/,
  /^\/admin\/applications\/management(\/[^/]+)?$/,
  /^\/admin\/applications\/cash-receipt$/,
  /^\/admin\/events\/management$/,
  /^\/admin\/events\/(?!management$|register$|statistics$)[^/]+$/,
  /^\/admin\/local-events\/(?!register$)[^/]+$/,
  /^\/admin\/events\/statistics$/,
  /^\/admin\/boards\/(notice|faq|inquiry)$/,
  /^\/admin\/boards\/notice\/(main|events\/[^/]+)$/,
  /^\/admin\/boards\/inquiry\/(all|main|events\/[^/]+)$/,
  /^\/admin\/boards\/faq\/(main|events\/[^/]+)$/,
  /^\/admin\/users\/individual(\/[^/]+(\/detail)?)?$/,
  /^\/admin\/users\/organization(\/[^/]+)?$/,
  /^\/admin\/banners\/(popups|main|closing-marathon|sponsors)$/,
  /^\/admin\/banners\/popups\/(main|events\/[^/]+)$/,
  /^\/admin\/galleries$/,
  /^\/admin\/settings\/phone-auth-policy$/,
  /^\/admin\/notifications(\/all|\/events\/[^/]+)?(\/register)?$/,
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { accessToken, user, hasHydrated } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === '/admin/login';
  // 카드형 목록으로 바꾼 라우트만 회색 바탕
  const isCardListRoute = CARD_LIST_ROUTES.some((re) => re.test(pathname ?? ''));
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

  // 클라이언트 마운트 상태 추적 (모든 hooks는 조건부 반환 전에 선언)
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const [isDesktop, setIsDesktop] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setIsDesktop(mq.matches);
      setSidebarOpen(mq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const sidebarOffset = isDesktop && sidebarOpen ? ADMIN_SIDEBAR_WIDTH : 0;

  // 인증 상태 확인: accessToken 변경을 즉시 반영
  // 로그아웃 시 즉시 반영되도록 accessToken을 우선 확인
  const isAuthed = React.useMemo(() => {
    // 서버 사이드에서는 항상 false 반환 (SSR 안전)
    if (typeof window === 'undefined') return false;
    // hasHydrated가 false면 아직 확인 불가 (초기 로드 시)
    if (!hasHydrated) return false;
    // accessToken이 null이면 즉시 false 반환 (로그아웃 시 즉시 반영)
    if (!accessToken) return false;
    // accessToken이 있으면 true, 없으면 localStorage에서도 확인
    return !!(accessToken || tokenService.getAdminAccessToken());
  }, [hasHydrated, accessToken]);

  // 로그아웃 시 즉시 반영: accessToken이 null이거나 없으면 즉시 오버레이 표시
  // 새로고침 시에도 즉시 확인하도록 클라이언트에서 직접 localStorage 확인
  const showBlurOverlay = React.useMemo(() => {
    // 서버에서는 항상 false (SSR 안전)
    if (typeof window === 'undefined') return false;
    // 클라이언트 마운트 전에는 false
    if (!isClient) return false;
    
    // 1. Zustand store의 accessToken 확인 (로그아웃 시 즉시 반영)
    if (!accessToken) {
      // 2. localStorage에서도 직접 확인 (새로고침 시)
      const tokenFromStorage = tokenService.getAdminAccessToken();
      if (!tokenFromStorage) {
        return true; // 둘 다 없으면 오버레이 표시
      }
    }
    
    return false;
  }, [isClient, accessToken]);

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

  return (
    <div
      className="min-h-screen bg-white relative"
      style={{ '--admin-sidebar-w': `${sidebarOffset}px` } as React.CSSProperties}
    >
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="min-h-screen flex flex-col relative transition-[padding] duration-200"
        style={{ paddingLeft: sidebarOffset }}
      >
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
            aria-label={sidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={sidebarOpen}
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
          <div className="min-w-0 flex-1">
            <AdminNavigation />
          </div>
          <Link
            href="/"
            className="hidden sm:flex h-8 shrink-0 items-center rounded-md border border-gray-300 px-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
          >
            전마협 바로가기
          </Link>
          <UtilityIcons tone="light" />
        </header>
        <main className={`flex-1 transition-all duration-300 ${isCardListRoute ? 'bg-[#F4F5F7]' : 'bg-white pt-6'} ${showBlurOverlay ? 'blur-sm pointer-events-none' : ''}`}>
          {children}
        </main>
        
        {/* 블러 오버레이 및 로그인 버튼 */}
        {showBlurOverlay && (
          <>
            {/* 권한 오류 메시지 배너 - 헤더 아래 */}
            <div
              className="fixed top-12 right-0 z-[200] bg-red-600 text-white px-4 py-3 shadow-lg"
              style={{ left: sidebarOffset }}
            >
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
            <div
              className="fixed bottom-0 right-0 top-12 flex items-center justify-center bg-black/50 z-[150] pt-12"
              style={{ left: sidebarOffset }}
            >
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
        <AdminFooter muted={isCardListRoute} />
      </div>
    </div>
  );
}
