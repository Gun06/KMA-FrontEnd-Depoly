'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logoImage from '@/assets/images/main/logo.jpg';
import searchIcon from '@/assets/icons/main/search.svg';
import cartIcon from '@/assets/icons/main/cart.svg';
import userIcon from '@/assets/icons/main/user.svg';
import xIcon from '@/assets/icons/main/x.svg';
import menuIcon from '@/assets/icons/main/menu.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoints } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/authStore';
import { tokenService } from '@/utils/tokenService';
import { authService } from '@/services/auth';
import { navigationGuard } from '@/utils/navigationGuard';

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
  searchOpen: boolean;
  subMenuOpen: string | null;
  searchQuery: string;
  isMobileMenu: boolean;
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
    ],
  },
  접수안내: {
    items: [{ label: '참가신청 가이드', href: '/registration/guide' }],
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
      { label: '포인트 현황', href: '/mypage/points' },
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

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export default function Header() {
  // useBreakpoints 훅을 사용하여 세밀한 반응형 감지
  const { isCustom } = useBreakpoints();
  const { isLoggedIn, user, logout, accessToken, hasHydrated } = useAuthStore();
  const router = useRouter();

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
    searchOpen: false,
    subMenuOpen: null,
    searchQuery: '',
    isMobileMenu: false,
  });

  // 상태 업데이트 함수들을 useCallback으로 최적화
  const updateState = useCallback((updates: Partial<HeaderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSearch = useCallback(() => {
    // 검색창을 토글하면서 서브메뉴와 햄버거 메뉴가 열려있다면 닫기
    updateState({
      searchOpen: !state.searchOpen,
      subMenuOpen: null, // 서브메뉴가 열려있다면 닫기
      mobileOpen: false, // 햄버거 메뉴가 열려있다면 닫기
    });
  }, [state.searchOpen, updateState]);

  const toggleMobileSubMenu = useCallback(
    (key: string) => {
      updateState({
        expandedMobileMenu: state.expandedMobileMenu === key ? null : key,
      });
    },
    [state.expandedMobileMenu, updateState]
  );

  const toggleMobileMenu = useCallback(() => {
    // 햄버거 메뉴를 토글하면서 검색창이 열려있다면 닫기
    updateState({
      mobileOpen: !state.mobileOpen,
      searchOpen: false, // 검색창이 열려있다면 닫기
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
          searchOpen: false, // 검색창이 열려있다면 닫기
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
        searchOpen: false,
      });
    } else {
      updateState({
        isMobileMenu: false,
      });
    }
  }, [isCustom, updateState]);

  return (
    <header className="bg-white fixed top-0 left-0 w-full z-[150] shadow-sm">
      <div className="w-full max-w-[1920px] mx-auto px-4">
        <div
          className="grid items-center h-16"
          style={{
            gridTemplateColumns: 'minmax(300px, 1fr) auto minmax(300px, 1fr)',
          }}
        >
          {/* 로고 */}
          <div className="flex items-center justify-start custom:justify-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 relative">
                <Image
                  src={logoImage}
                  alt="전국마라톤협회 로고"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <span className="font-giants text-lg text-gray-900 whitespace-nowrap break-keep truncate">
                전국마라톤협회
              </span>
            </Link>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav
            className="hidden custom:grid items-center relative z-[110]"
            style={{ gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))' }}
            role="navigation"
            aria-label="메인 네비게이션"
          >
            {navItems.map(({ label, key }) => (
              <div
                key={label}
                className="flex items-center justify-center h-16"
              >
                <button
                  className={`w-full h-full flex items-center justify-center text-center font-pretendard transition-colors whitespace-nowrap break-keep truncate relative ${
                    state.subMenuOpen === key
                      ? 'text-blue-600'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    if (key) {
                      toggleSubMenu(key);
                    }
                  }}
                  aria-haspopup="true"
                  aria-expanded={state.subMenuOpen === key}
                >
                  {label}
                  {state.subMenuOpen === key && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>
                  )}
                </button>
              </div>
            ))}
          </nav>

          {/* 우측 아이콘 */}
          <div className="hidden custom:flex items-center justify-center space-x-8 relative z-[110]">
            <button
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleSearch}
            >
              <Image
                src={searchIcon}
                alt="검색"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
            <a
              href="http://www.run1080.com/new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="font-pretendard text-sm whitespace-nowrap break-keep truncate">
                (구)전마협
              </span>
              <span aria-hidden className="text-lg">
                ↗
              </span>
            </a>
            {actualIsLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Image
                  src={userIcon}
                  alt="사용자"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="font-pretendard text-sm whitespace-nowrap break-keep truncate">
                  {user?.account || '회원'} 님
                </span>
                <button
                  onClick={async () => {
                    const canNavigate = navigationGuard.startNavigation();
                    if (!canNavigate) return;

                    try {
                      // 통합 로그아웃 처리
                      await authService.logout();

                      // 브로드캐스트로 다른 탭에 로그아웃 알림
                      tokenService.broadcastLogout();

                      // 홈으로 리다이렉트
                      await navigationGuard.safeNavigate(() => {
                        router.push('/');
                      }, 100);
                    } catch (error) {
                      navigationGuard.endNavigation();
                    }
                  }}
                  className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  if (state.subMenuOpen || state.searchOpen) {
                    updateState({ subMenuOpen: null, searchOpen: false });
                  }
                  // 클라이언트에서만 returnUrl 설정
                  const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
                  window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
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
              </a>
            )}
          </div>

          {/* 모바일 햄버거/닫기 버튼 */}
          <div className="custom:hidden fixed top-3 right-4 flex items-center space-x-2 z-[160]">
            {/* 모바일 검색 버튼 */}
            <button
              className="p-2 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              onClick={toggleSearch}
              aria-label="검색"
            >
              <Image
                src={searchIcon}
                alt="검색"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>

            {/* 햄버거/닫기 버튼 */}
            <button
              className="p-2 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                        className="w-6 h-6"
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
                        className="w-6 h-6"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 데스크탑용 메가 드롭다운 */}
      <AnimatePresence>
        {state.subMenuOpen && (
          <div className="fixed inset-0 z-[90]">
            {/* 블러 배경 - 헤더 아래쪽에만 적용 */}
            <div
              className="absolute top-16 left-0 right-0 bottom-0 bg-white bg-opacity-20"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => updateState({ subMenuOpen: null })}
            />

            <motion.div
              className="absolute left-0 top-16 w-full bg-white z-[95] shadow-lg"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="w-full max-w-[1920px] mx-auto px-4">
                <div
                  className="grid items-center py-6"
                  style={{
                    gridTemplateColumns:
                      'minmax(300px, 1fr) auto minmax(300px, 1fr)',
                  }}
                >
                  {/* 왼쪽 빈 영역 */}
                  <div></div>

                  {/* 중앙 서브메뉴 영역 */}
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))',
                    }}
                  >
                    {Object.entries(subMenus).map(([key, menu]) => (
                      <div
                        key={key}
                        className="flex flex-col items-center overflow-hidden"
                      >
                        <ul className="space-y-2 py-2 w-full">
                          {menu.items.map(item => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="text-sm font-pretendard text-gray-600 hover:text-blue-600 transition-colors block py-1 text-center whitespace-nowrap break-keep truncate max-w-full"
                                onClick={() =>
                                  updateState({ subMenuOpen: null })
                                }
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* 오른쪽 빈 영역 */}
                  <div></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 검색 모달 */}
      <AnimatePresence>
        {state.searchOpen && (
          <div className="fixed inset-0 z-[90]">
            {/* 블러 배경 - 헤더 아래쪽에만 적용 */}
            <div
              className="absolute top-16 left-0 right-0 bottom-0 bg-white bg-opacity-20"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => updateState({ searchOpen: false })}
            />

            <motion.div
              className="absolute left-0 top-16 w-full bg-white z-[95] shadow-lg"
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
                className="absolute top-16 left-0 right-0 bottom-0 bg-white bg-opacity-20"
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
                      className="flex items-center space-x-1 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => {
                        if (state.expandedMobileMenu) {
                          updateState({ expandedMobileMenu: null });
                        }
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
