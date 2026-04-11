'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AppInstallBanner from '@/components/main/AppInstallBanner';
import logoImage from '@/assets/images/main/logo.jpg';
import searchIcon from '@/assets/icons/main/search.svg';
import userIcon from '@/assets/icons/main/user.svg';
import xIcon from '@/assets/icons/main/x.svg';
import menuIcon from '@/assets/icons/main/menu.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoints } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores';
import { tokenService } from '@/utils/tokenService';
import { authService } from '@/services/auth';
import { navigationGuard } from '@/utils/navigationGuard';
import { NotificationDropdown } from '@/app/(main)/mypage/notifications/components/NotificationDropdown';

interface SubMenuItem {
  icon?: React.ReactNode;
  label: string;
  href: string;
}

interface SubMenu {
  items: SubMenuItem[];
}

// Header 상태를 하나의 인터페이스로 정의
interface HeaderState {
  mobileOpen: boolean;
  hoveredMenu: string | null;
  expandedMobileMenu: string | null;
  subMenuOpen: string | null;
  isMobileMenu: boolean;
  // 검색 모달 상태 (UI는 노출하지 않지만 타입 오류 방지를 위해 유지)
  searchOpen: boolean;
  searchQuery: string;
}

// 대메뉴 → 세부메뉴 매핑
const subMenus: Record<string, SubMenu> = {
  전마협: {
    items: [
      { label: '협회소개', href: '/association' },
      { label: '조직도', href: '/association/organizational-chart' },
      { label: '인사말', href: '/association/greeting' },
      { label: '설립취지', href: '/association/foundation' },
    ],
  },
  대회일정: {
    items: [
      { label: '대회리스트', href: '/schedule' },
      { label: '대회갤러리', href: '/schedule/gallery' },
      { label: '지역대회', href: '/schedule/local' },
    ],
  },
  접수안내: {
    items: [{ label: '신청 가이드', href: '/registration/guide' }],
  },
  게시판: {
    items: [
      { label: '공지사항', href: '/notice/notice' },
      { label: '문의사항', href: '/notice/inquiry' },
      { label: 'FAQ', href: '/notice/faq' },
    ],
  },
  쇼핑몰: {
    items: [{ label: '쇼핑몰', href: '/shop/merchandise' }],
  },
  마이페이지: {
    items: [
      { label: '신청내역', href: '/mypage/applications' },
      { label: '기록증 발급', href: '/mypage/certificates' },
      { label: '알림', href: '/mypage/notifications' },
    ],
  },
};

const navItems = [
  { label: '전마협', href: '/association', key: '전마협' },
  { label: '대회일정', href: '/schedule', key: '대회일정' },
  { label: '접수안내', href: '/registration', key: '접수안내' },
  { label: '게시판', href: '/notice/notice', key: '게시판' },
  { label: '쇼핑몰', href: '/shop', key: '쇼핑몰' },
  { label: '마이페이지', href: '/mypage', key: '마이페이지' },
];

const navItemsLeft = navItems.slice(0, 5);
const navItemMypage = navItems[5];

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

/** 메가 패널: transform 레이어가 부모 backdrop 합성을 깨지 않도록 opacity만 */
/** 세 pill 공통 — 밝은/어두운 배경 모두에서 잘 보이는 다크 프로스트 글라스 */
const GLASS_PILL_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,15,15,0.68)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};






export default function Header() {
  // useBreakpoints 훅을 사용하여 세밀한 반응형 감지
  const { isCustom } = useBreakpoints();
  const { isLoggedIn, user, accessToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  // Hydration mismatch 방지: 클라이언트 마운트 후에만 토큰/스토어 기반 판별
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 전역 스토어 + 토큰 기반으로 로그인 상태 판별 (user가 있을 때만 로그인 UI 노출)
  const actualIsLoggedIn =
    mounted &&
    ((typeof window !== 'undefined' &&
      !!localStorage.getItem('kmaAccessToken')) ||
      !!accessToken ||
      isLoggedIn) &&
    !!user;


  // 모든 상태를 하나의 객체로 통합
  const [state, setState] = useState<HeaderState>({
    mobileOpen: false,
    hoveredMenu: null,
    expandedMobileMenu: null,
    subMenuOpen: null,
    isMobileMenu: false,
    searchOpen: false,
    searchQuery: '',
  });

  // 상태 업데이트 함수들을 useCallback으로 최적화
  const updateState = useCallback((updates: Partial<HeaderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);


  const toggleMobileSubMenu = useCallback(
    (key: string) => {
      updateState({
        expandedMobileMenu: state.expandedMobileMenu === key ? null : key,
      });
    },
    [state.expandedMobileMenu, updateState]
  );

  const toggleMobileMenu = useCallback(() => {
    updateState({
      mobileOpen: !state.mobileOpen,
    });
  }, [state.mobileOpen, updateState]);

  const toggleSubMenu = useCallback(
    (key: string | null) => {
      // 다른 메뉴를 클릭하면 기존 메뉴를 닫고 새 메뉴를 열거나 닫기
      if (state.subMenuOpen === key) {
        updateState({ subMenuOpen: null });
      } else {
        updateState({
          subMenuOpen: key,
        });
      }
    },
    [state.subMenuOpen, updateState]
  );

  // const closeAllMenus = useCallback(() => {
  //   updateState({
  //     mobileOpen: false,
  //     searchOpen: false,
  //     subMenuOpen: null,
  //     expandedMobileMenu: null,
  //   });
  // }, [updateState]);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      if (query.trim()) {
        updateState({
          searchOpen: false,
          searchQuery: '',
        });
        // 검색 페이지로 이동 (실제로는 router.push 사용)
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
    },
    [updateState]
  );

  const handleSearchInputChange = useCallback(
    (value: string) => {
      updateState({ searchQuery: value });
    },
    [updateState]
  );

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && state.searchQuery.trim()) {
        handleSearchSubmit(state.searchQuery);
      }
    },
    [state.searchQuery, handleSearchSubmit]
  );

  // 반응형 상태가 변경될 때마다 자동으로 상태 업데이트
  useEffect(() => {
    if (isCustom) {
      updateState({
        isMobileMenu: true,
        subMenuOpen: null,
      });
    } else {
      updateState({
        isMobileMenu: false,
      });
    }
  }, [isCustom, updateState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMainOffset = () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      const offset = isBannerVisible ? (isDesktop ? '144px' : '136px') : '80px';
      document.documentElement.style.setProperty('--kma-main-header-offset', offset);
      /* 배너만의 높이 — 사이드바 top 오프셋 계산용 */
      const bannerH = isBannerVisible ? (isDesktop ? '64px' : '56px') : '0px';
      document.documentElement.style.setProperty('--kma-banner-height', bannerH);
    };

    updateMainOffset();
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateMainOffset, 100);
    };
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [isBannerVisible]);

  const hasTopBanner = isBannerVisible;
  const panelTopClass = hasTopBanner ? 'top-[136px] md:top-[144px]' : 'top-20';
  const mobileToggleTopClass = hasTopBanner ? 'top-[4.25rem] md:top-[4.75rem]' : 'top-3';


  return (
    <header className="fixed top-0 left-0 z-[150] w-full overflow-visible">
      <AppInstallBanner onVisibilityChange={setIsBannerVisible} />

      {/* 모바일 상단 바 */}
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 custom:hidden">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 hover:opacity-90"
        >
          <div className="relative h-9 w-9 shrink-0">
            <Image
              src={logoImage}
              alt="전국마라톤협회 로고"
              width={36}
              height={36}
              className="rounded-full ring-[3px] ring-green-700"
            />
          </div>
          <span className="font-giants truncate text-base break-keep whitespace-nowrap text-white drop-shadow-sm">
            전국마라톤협회
          </span>
        </Link>
        <div className={`fixed right-4 z-[160] flex items-center space-x-2 ${mobileToggleTopClass}`}>
            {/* 햄버거/닫기 버튼 */}
            <button
              className="rounded bg-white/15 p-2 shadow-none hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleMobileMenu}
              aria-label={state.mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={state.mobileOpen}
            >
              <div className="relative w-6 h-6">
                <AnimatePresence mode="wait">
                  {state.mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={xIcon}
                        alt="닫기"
                        width={24}
                        height={24}
                        className="w-6 h-6 brightness-0 invert"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: -90 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={menuIcon}
                        alt="메뉴"
                        width={24}
                        height={24}
                        className="w-6 h-6 brightness-0 invert"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
        </div>
      </div>

      {/* 데스크탑: 로고(좌) — 필 네비(중앙) — 액션(우) */}
      <div className="relative mx-auto hidden max-w-[1920px] overflow-visible px-[6vw] custom:block">
        <div className="relative z-[110] flex h-20 items-center gap-6">

          {/* 좌: 로고 + 브랜드명 — 글라스 필 */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-full px-6 py-2.5 ring-1 ring-white/15 transition-all hover:brightness-125"
            style={GLASS_PILL_STYLE}
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-green-600">
              <Image
                src={logoImage}
                alt="전국마라톤협회 로고"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="font-giants whitespace-nowrap text-base font-bold tracking-tight text-white">
              전국마라톤협회
            </span>
          </Link>

          {/* 중앙: 필 스타일 네비게이션 — 글라스 */}
          <div className="flex flex-1 justify-center">
            <nav
              className="flex items-center gap-2 rounded-full px-3 py-2.5 ring-1 ring-white/15"
              style={GLASS_PILL_STYLE}
              role="navigation"
              aria-label="메인 메뉴"
            >
              {navItemsLeft.map(({ label, key }) => (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => key && updateState({ subMenuOpen: key })}
                  onMouseLeave={() => updateState({ subMenuOpen: null })}
                >
                  <button
                    type="button"
                    className={`rounded-full px-10 py-2 text-[15px] font-semibold whitespace-nowrap transition-all duration-200 ${
                      state.subMenuOpen === key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                    aria-haspopup="true"
                    aria-expanded={state.subMenuOpen === key}
                  >
                    {label}
                  </button>

                  {/* 드롭다운 — 세부메뉴 각각 독립 카드 */}
                  {state.subMenuOpen === key && subMenus[key] && (
                    <div className="absolute left-0 top-full z-[75] w-full pt-[18px]">
                      <ul className="flex w-full flex-col gap-1.5">
                        {subMenus[key].items.map(item => (
                          <li key={item.href} className="w-full">
                            <Link
                              href={item.href}
                              onClick={() => updateState({ subMenuOpen: null })}
                              className={`flex w-full items-center justify-center rounded-full px-10 py-2 text-[15px] font-semibold whitespace-nowrap ring-1 transition-all duration-150 ${
                                pathname === item.href
                                  ? 'bg-white text-gray-900 shadow-md ring-white/30'
                                  : 'ring-white/15 text-white/90 hover:brightness-125'
                              }`}
                              style={pathname === item.href ? undefined : GLASS_PILL_STYLE}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* 우: 액션 — 글라스 필 */}
          <div
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-2 ring-1 ring-white/15"
            style={GLASS_PILL_STYLE}
          >
            {navItemMypage && (
              <Link
                href={navItemMypage.href}
                className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  pathname.startsWith('/mypage')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/90 hover:bg-white/15 hover:text-white'
                }`}
              >
                {navItemMypage.label}
              </Link>
            )}
            <a
              href="http://www.run1080.com/new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/15 hover:text-white"
            >
              (구)전마협
              <svg className="h-3 w-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {actualIsLoggedIn ? (
              <div className="flex items-center gap-1">
                <span className="hidden max-w-[90px] truncate px-2 text-sm font-medium text-white/90 lg:inline">
                  {user?.account || '회원'}
                </span>
                <NotificationDropdown
                  isLoggedIn={actualIsLoggedIn}
                  userAccount={user?.account}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const canNavigate = navigationGuard.startNavigation();
                    if (!canNavigate) return;
                    try {
                      await authService.logout();
                      tokenService.broadcastLogout();
                      await navigationGuard.safeNavigate(() => {
                        router.push('/');
                      }, 100);
                    } catch {
                      navigationGuard.endNavigation();
                    }
                  }}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/15 hover:text-white"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/15 hover:text-white"
                onClick={e => {
                  const returnUrl =
                    typeof window !== 'undefined' ? window.location.pathname : '/';
                  router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                  e.preventDefault();
                }}
              >
                <Image
                  src={userIcon}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 brightness-0 invert"
                />
                로그인
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* 검색 모달 */}
      <AnimatePresence>
        {state.searchOpen && (
          <div className="fixed inset-0 z-[90]">
            {/* 블러 배경 - 헤더 아래쪽에만 적용 */}
            <div
              className={`absolute left-0 right-0 bottom-0 bg-white bg-opacity-20 ${panelTopClass}`}
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => updateState({ searchOpen: false })}
            />

            <motion.div
              className={`absolute left-0 w-full bg-white z-[95] shadow-lg ${panelTopClass}`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="w-full max-w-[1920px] mx-auto px-4">
                <div className="flex items-center justify-center py-6 custom:py-12">
                  <div className="w-full max-w-7xl">
                    <div className="relative">
                      <input
                        type="text"
                        id="search-input"
                        name="search-query"
                        placeholder="검색어를 입력해주세요."
                        value={state.searchQuery}
                        onChange={e => handleSearchInputChange(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="w-full px-12 py-3 custom:py-4 text-base custom:text-lg font-pretendard rounded-lg focus:outline-none transition-colors text-left placeholder:text-left placeholder:text-gray-400"
                        autoFocus
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Image
                          src={searchIcon}
                          alt="검색"
                          width={20}
                          height={20}
                          className="w-4 h-4 custom:w-5 custom:h-5 text-gray-400"
                        />
                      </div>
                      <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => updateState({ searchOpen: false })}
                      >
                        <svg
                          className="w-4 h-4 custom:w-5 custom:h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {state.mobileOpen && (
          <>
            {/* 블러 배경 - 헤더 아래쪽에만 적용 */}
            <div className="custom:hidden fixed inset-0 z-[110]">
              {/* 헤더 아래쪽만 블러 처리 */}
              <div
                className={`absolute left-0 right-0 bottom-0 bg-white bg-opacity-20 ${panelTopClass}`}
                style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onClick={() => updateState({ mobileOpen: false })}
              />
            </div>

            <motion.nav
              className="custom:hidden bg-white shadow-md relative z-[115] overflow-hidden"
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
              role="navigation"
              aria-label="모바일 메뉴"
            >
              <ul className="flex flex-col divide-y divide-gray-200">
                {navItems.map(({ label, href, key }) => (
                  <li key={label}>
                    {key && subMenus[key] ? (
                      <>
                        <button
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50 font-pretendard"
                          onClick={() => toggleMobileSubMenu(key)}
                          aria-expanded={state.expandedMobileMenu === key}
                        >
                          <span>{label}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              state.expandedMobileMenu === key
                                ? 'rotate-90'
                                : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 9l6 6 6-6"
                            />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {state.expandedMobileMenu === key && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0, y: -5 }}
                              animate={{ height: 'auto', opacity: 1, y: 0 }}
                              exit={{ height: 0, opacity: 0, y: -5 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              className="bg-gray-50"
                            >
                              {subMenus[key].items.map(item => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="block px-8 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-pretendard"
                                    onClick={() =>
                                      updateState({ mobileOpen: false })
                                    }
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={href}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors font-pretendard"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
                <li className="px-4 py-3 flex justify-end items-center gap-3 border-t border-gray-200">
                  {actualIsLoggedIn ? (
                    <>
                      <span className="text-sm text-gray-800 whitespace-nowrap">
                        {user?.account || '회원'} 님
                      </span>
                      <button
                        className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={async () => {
                          await authService.logout();
                          tokenService.broadcastLogout();
                          updateState({ mobileOpen: false });
                        }}
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center space-x-1 p-2 rounded-full transition-colors focus:outline-none hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                      onClick={(e) => {
                        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
                        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                        updateState({ mobileOpen: false });
                        e.preventDefault();
                      }}
                    >
                      <Image
                        src={userIcon}
                        alt="사용자"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="font-pretendard text-sm whitespace-nowrap break-keep truncate">
                        로그인
                      </span>
                    </Link>
                  )}
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
