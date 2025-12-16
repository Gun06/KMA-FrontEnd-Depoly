'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logoImage from '@/assets/images/main/logo.jpg';
import userIcon from '@/assets/icons/main/user.svg';
import xIcon from '@/assets/icons/main/x.svg';
import menuIcon from '@/assets/icons/main/menu.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoints } from '@/hooks/useMediaQuery';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import UtilityIcons from './UtilityIcons';

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
}

// 대메뉴 → 세부메뉴 매핑
const subMenus: Record<string, SubMenu> = {
  참가신청: {
    items: [
      { label: '신청자 관리', href: '/admin/applications/list' },
      { label: '기록관리', href: '/admin/applications/records' },
    ],
  },
  대회관리: {
    items: [
      { label: '대회관리', href: '/admin/events/management' },
      { label: '대회등록', href: '/admin/events/register' },
      { label: '통계확인', href: '/admin/events/statistics' },
    ],
  },
  게시판관리: {
    items: [
      { label: '공지사항', href: '/admin/boards/notice' },
      { label: '문의사항', href: '/admin/boards/inquiry' },
      { label: 'FAQ', href: '/admin/boards/faq' },
    ],
  },
  회원관리: {
    items: [
      { label: '개인 회원관리', href: '/admin/users/individual' },
      { label: '단체 회원관리', href: '/admin/users/organization' },
    ],
  },

  배너관리: {
    items: [
      { label: '메인 배너등록', href: '/admin/banners/main' },
      { label: '스폰서 배너등록', href: '/admin/banners/sponsors' },
      { label: '팝업 등록', href: '/admin/banners/popups' },
    ],
  },
  갤러리관리: {
    items: [{ label: '갤러리 등록', href: '/admin/galleries' }],
  },
};

const navItems = [
  { label: '참가신청', href: '/admin/applications/list', key: '참가신청' },
  { label: '대회관리', href: '/admin/events/management', key: '대회관리' },
  { label: '게시판관리', href: '/admin/boards/notice', key: '게시판관리' },
  { label: '회원관리', href: '/admin/users/individual', key: '회원관리' },
  { label: '배너관리', href: '/admin/banners', key: '배너관리' },
  { label: '갤러리관리', href: '/admin/galleries', key: '갤러리관리' },
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export default function Header() {
  // useBreakpoints 훅을 사용하여 세밀한 반응형 감지
  const { isCustom } = useBreakpoints();
  const { isLoggedIn, user, logout } = useAdminAuthStore();

  // 모든 상태를 하나의 객체로 통합
  const [state, setState] = useState<HeaderState>({
    mobileOpen: false,
    hoveredMenu: null,
    expandedMobileMenu: null,
    subMenuOpen: null,
    isMobileMenu: false,
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

  // 검색 관련 기능 제거

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

  const handleLogout = () => {
    logout();
    // localStorage도 정리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmaAdminAccessToken');
      localStorage.removeItem('kmaAdminRefreshToken');
    }
  };

  return (
    <header className="bg-black text-white fixed top-0 left-0 w-full z-[150] shadow-sm">
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
              href="/admin"
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
              <span className="font-giants text-lg text-white whitespace-nowrap break-keep truncate">
                전마협 관리자 페이지
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
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
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
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white"></div>
                  )}
                </button>
              </div>
            ))}
          </nav>

          {/* 우측 아이콘 (로그인 상태에 따라 다르게 표시) */}
          <div className="hidden custom:flex items-center justify-center space-x-8 relative z-[110]">
            <UtilityIcons />
            <Link
              href="/"
              className="font-pretendard text-sm text-white/80 hover:text-white transition-colors whitespace-nowrap break-keep truncate"
            >
              전마협 바로가기 &gt;
            </Link>
          </div>

          {/* 모바일 햄버거/닫기 버튼 */}
          <div className="custom:hidden fixed top-3 right-4 flex items-center space-x-2 z-[160]">
            {/* 햄버거/닫기 버튼 */}
            <button
              className="p-2 hover:bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black border border-white/20 shadow-sm text-white"
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
                        className="w-6 h-6 invert"
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
                        className="w-6 h-6 invert"
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
              className="absolute top-16 left-0 right-0 bottom-0 bg-black bg-opacity-40"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => updateState({ subMenuOpen: null })}
            />

            <motion.div
              className="absolute left-0 top-16 w-full bg-black z-[95] shadow-lg"
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
                                className="text-sm font-pretendard text-white/80 hover:text-white transition-colors block py-1 text-center whitespace-nowrap break-keep truncate max-w-full"
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

      {/* 검색 기능 제거됨 */}

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {state.mobileOpen && (
          <>
            {/* 블러 배경 - 헤더 아래쪽에만 적용 */}
            <div className="custom:hidden fixed inset-0 z-[110]">
              {/* 헤더 아래쪽만 블러 처리 */}
              <div
                className="absolute top-16 left-0 right-0 bottom-0 bg-black bg-opacity-40"
                style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onClick={() => updateState({ mobileOpen: false })}
              />
            </div>

            <motion.nav
              className="custom:hidden bg-black text-white shadow-md relative z-[115] overflow-hidden"
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
              <ul className="flex flex-col divide-y divide-white/10">
                {navItems.map(({ label, href, key }) => (
                  <li key={label}>
                    {key && subMenus[key] ? (
                      <>
                        <button
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/10 focus:outline-none focus:bg-white/10 font-pretendard"
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
                              className="bg-white/5"
                            >
                              {subMenus[key].items.map(item => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="block px-8 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors font-pretendard"
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
                        className="block px-4 py-3 hover:bg-white/10 transition-colors font-pretendard"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
                <li className="px-4 py-3 flex items-center justify-end space-x-3 border-t border-white/10">
                  {isLoggedIn ? (
                    // 로그인된 상태 - 사용자명 + 로그아웃 버튼
                    <>
                      <div className="flex items-center space-x-2">
                        <Image
                          src={userIcon}
                          alt="사용자"
                          width={20}
                          height={20}
                          className="w-5 h-5 invert"
                        />
                        <span className="font-pretendard text-sm whitespace-nowrap break-keep truncate">
                          {user?.role || '관리자'}님
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          updateState({ mobileOpen: false });
                        }}
                        className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors font-pretendard"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    // 로그인되지 않은 상태
                    <Link
                      href="/admin/login"
                      className="flex items-center space-x-1 p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => {
                        // 서브메뉴가 열려있다면 닫기
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
                        className="w-5 h-5 invert"
                      />
                      <span className="font-pretendard text-sm whitespace-nowrap break-keep truncate">
                        로그인
                      </span>
                    </Link>
                  )}
                  <Link
                    href="/"
                    className="p-2 font-pretendard text-sm text-white/80 hover:text-white transition-colors whitespace-nowrap break-keep truncate rounded-full"
                  >
                    전마협 바로가기 &gt;
                  </Link>
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
