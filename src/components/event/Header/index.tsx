'use client';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { useMainBanner } from '@/components/providers/MainBannerContext';

interface EventHeaderProps {
  eventName?: string;
  year?: string;
  eventId?: string;
  accentColor?: string;
  headerBgClass?: string;
}

interface EventInfo {
  id: string;
  nameEng: string;
  nameKr: string;
  startDate: string;
  region: string;
  mainBannerColor?: string;
}

export default function EventHeader({
  eventName,
  year,
  eventId,
  accentColor,
  headerBgClass,
}: EventHeaderProps) {
  const { mainBannerColor: contextBannerColor } = useMainBanner();
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [desktopOpenKey, setDesktopOpenKey] = React.useState<string | null>(
    null
  );
  const [mobileExpandedKey, setMobileExpandedKey] = React.useState<
    string | null
  >(null);
  const { isLoggedIn, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // API에서 이벤트 정보 가져오기 (캐시 사용)
  useEffect(() => {
    if (!eventId) return;

    const fetchEventInfo = async () => {
      try {
        // 로컬 스토리지에서 캐시된 데이터 확인
        const cacheKey = `event_info_${eventId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          // 캐시된 데이터가 1시간 이내인지 확인
          const cacheTime = parsedData.timestamp;
          const now = Date.now();
          const oneHour = 60 * 60 * 1000;
          
          if (now - cacheTime < oneHour) {
            setEventInfo(parsedData.data);
            return;
          }
        }

        setIsLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;

        const response = await fetch(API_ENDPOINT);
        if (response.ok) {
          const data = await response.json();
          setEventInfo(data);
          
          // 로컬 스토리지에 캐시 저장
          localStorage.setItem(cacheKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        // 이벤트 정보를 가져오는데 실패했습니다
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [eventId]);
  
  // 색상 우선순위: prop(accentColor) > 컨텍스트 > API 데이터 > 기본값
  const finalAccentColor =
    accentColor || contextBannerColor || eventInfo?.mainBannerColor || undefined;

  // 이벤트명 결정 (API 데이터 우선, fallback은 props)
  const displayEventName = eventInfo?.nameEng || eventName || 'EVENT';
  const displayYear = eventInfo?.startDate ? new Date(eventInfo.startDate).getFullYear().toString() : year || '2025';

  const menuItems = useMemo(() => [
    { key: 'guide', label: '대회안내' },
    { key: 'apply', label: '참가신청' },
    { key: 'records', label: '기록조회' },
    { key: 'goods', label: '기념품' },
    { key: 'board', label: '게시판' },
  ] as const, []);

  const subMenus = useMemo(() => ({
    guide: [
      { label: '대회요강', href: `/event/${eventId}/guide/overview` },
      { label: '대회유의사항', href: `/event/${eventId}/guide/caution` },
      { label: '대회 코스', href: `/event/${eventId}/guide/course` },
      { label: '집결 출발', href: `/event/${eventId}/guide/gathering` },
    ],
    apply: [
      // 참가자 동의사항 서브메뉴 제거 (이슈: 참가자 유의사항 & 약관 멘트 수정 및 유의사항 서브메뉴 없앰)
      // {
      //   label: '참가자 동의사항',
      //   href: `/event/${eventId}/registration/agreement`,
      // },
      { label: '신청하기', href: `/event/${eventId}/registration/apply` },
      { label: '신청 확인', href: `/event/${eventId}/registration/confirm` },
      // 서비스 준비중: 버스예약 임시 비활성화 → 준비중 페이지로 연결
      { label: '마라톤 버스예약', href: `/event/${eventId}/registration/bus/coming-soon` },
    ],
    records: [
      { label: '개인 기록', href: `/event/${eventId}/records` },
      { label: '단체 기록', href: `/event/${eventId}/records/group` },
    ],
    goods: [{ label: '기념품 안내', href: `/event/${eventId}/merchandise` }],
    board: [
      { label: '공지사항', href: `/event/${eventId}/notices/notice` },
      { label: '문의사항', href: `/event/${eventId}/notices/inquiry` },
      { label: 'FAQ', href: `/event/${eventId}/notices/faq` },
    ],
  }), [eventId]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    // Lock scroll when menu open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }, [isOpen]);

  // Viewport가 데스크탑(>=1000px)으로 바뀌면 모바일 메뉴/오버레이 자동 닫기
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1000px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsOpen(false);
        setMobileExpandedKey(null);
      }
    };
    // 초기 상태에서도 데스크탑이면 닫아둠
    if (mq.matches) {
      setIsOpen(false);
      setMobileExpandedKey(null);
    }
    if (mq.addEventListener) mq.addEventListener('change', handleChange);
    else mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener)
        mq.removeEventListener('change', handleChange);
      else mq.removeListener(handleChange);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 text-white/90 shadow-sm ${headerBgClass ?? ''}`}
      style={headerBgClass ? undefined : {
        backgroundColor: finalAccentColor || '#1f2937',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-6">
          {/* Logo / Title */}
          <Link href={`/event/${eventId}`} className="shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center text-[10px] leading-tight font-extrabold">
                <span className="text-center">
                  {displayEventName.split(' ')[0]}
                  <br />
                  {displayEventName.split(' ')[1] || ''}
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="text-xs leading-4 text-white/80">
                <div className="font-semibold">{displayEventName}</div>
                <div className="text-white/60">{displayYear}</div>
              </div>
            </div>
          </Link>

          {/* Navigation (desktop) with bordered areas per menu */}
          <div className="ml-2 hidden min-[1000px]:flex flex-1 relative z-50">
            <nav className="flex-1">
              <ul className="flex items-center gap-1 text-sm min-[1000px]:text-base">
                {menuItems.map(m => (
                  <li
                    key={m.key}
                    className="relative"
                    onMouseEnter={() => setDesktopOpenKey(m.key)}
                    onMouseLeave={() => setDesktopOpenKey(null)}
                  >
                    <button
                      type="button"
                      className={`inline-flex h-12 items-center justify-center px-10 font-semibold whitespace-nowrap transition-colors ${
                        desktopOpenKey === m.key
                          ? 'text-white'
                          : 'text-white/90 hover:text-white'
                      }`}
                      id={`menu-btn-${m.key}`}
                      onClick={() =>
                        setDesktopOpenKey(k => (k === m.key ? null : m.key))
                      }
                      aria-expanded={desktopOpenKey === m.key}
                      aria-controls={`submenu-${m.key}`}
                    >
                      {m.label}
                    </button>

                    {desktopOpenKey === m.key && (
                      <div
                        id={`submenu-${m.key}`}
                        className="absolute left-0 top-full pt-2 w-full z-50"
                      >
                        <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/5 py-2">
                          <ul className="px-2 space-y-1">
                            {subMenus[m.key]?.map(s => {
                              const isActive = pathname === s.href;
                              const themeColor = finalAccentColor || '#000000'; // 기본값은 검정색
                              return (
                                <li key={s.href}>
                                  <Link
                                    href={s.href}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className={`block w-full text-center rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-150 select-none ${
                                      isActive
                                        ? 'text-white'
                                        : 'text-gray-800 hover:text-white'
                                    }`}
                                    style={{
                                      backgroundColor: isActive ? themeColor : 'transparent',
                                      '--hover-bg': themeColor
                                    } as React.CSSProperties & { '--hover-bg': string }}
                                    onMouseEnter={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor = themeColor;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    {s.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* External link */}
          <div className="hidden min-[1000px]:flex items-center gap-4">
            <a
              href="http://www.run1080.com/new/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white flex items-center gap-1 whitespace-nowrap"
            >
              (구)전마협
              <span aria-hidden>↗</span>
            </a>
            <div className="text-sm text-white/50 whitespace-nowrap">
              전국마라톤협회
            </div>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white whitespace-nowrap">
                  {user?.account || '회원'} 님
                </span>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  title="로그아웃"
                  aria-label="로그아웃"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9a.75.75 0 0 0 1.5 0V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0-1.06-1.06l-1.72 1.72H15a.75.75 0 0 0 0-1.5H9.06l1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              // 로그인 버튼 비활성화
              <div className="text-sm text-white/50 whitespace-nowrap">
                로그인
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(v => !v)}
            className="min-[1000px]:hidden ml-auto inline-flex items-center justify-center rounded-sm p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {isOpen ? (
              // X icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M3.75 5.75A.75.75 0 014.5 5h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zM3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15A.75.75 0 013.75 12zm0 6.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay and menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-30 bg-black/40 min-[1000px]:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="min-[1000px]:hidden fixed top-16 inset-x-0 z-40 bg-neutral-900 border-t border-white/10">
            <nav
              id="mobile-menu"
              aria-label="모바일 내비게이션"
              className="px-4 py-3"
            >
              <ul className="flex flex-col divide-y divide-white/10">
                {menuItems.map(m => (
                  <li key={m.key}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between py-3 text-base text-white/90 hover:text-white"
                      onClick={() =>
                        setMobileExpandedKey(k => (k === m.key ? null : m.key))
                      }
                      aria-expanded={mobileExpandedKey === m.key}
                      aria-controls={`mobile-submenu-${m.key}`}
                    >
                      <span>{m.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`h-5 w-5 transition-transform ${mobileExpandedKey === m.key ? 'rotate-180' : ''}`}
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {mobileExpandedKey === m.key && (
                      <ul
                        id={`mobile-submenu-${m.key}`}
                        className="pb-3 pl-3 space-y-1"
                      >
                        {subMenus[m.key]?.map(s => (
                          <li key={s.href} className="group">
                            <Link
                              href={s.href}
                              onClick={() => setIsOpen(false)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="block py-2 px-3 text-sm text-white/80 hover:text-white rounded-md transition-colors duration-150 hover:bg-white/10 border-l-2 border-transparent group-hover:border-[var(--accent-color)] select-none"
                            >
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 mt-2 pt-3 flex justify-end items-center">
                <div className="flex items-center gap-4">
                  <a
                    href="http://www.run1080.com/new/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    (구)전마협 ↗
                  </a>
                  <div className="text-sm text-white/50">
                    전국마라톤협회
                  </div>
                  {isLoggedIn ? (
                    <>
                      <span className="text-sm text-white whitespace-nowrap">
                        {user?.account || '회원'} 님
                      </span>
                      <button
                        className="text-sm text-white px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    // 모바일 로그인 버튼 비활성화
                    <div className="text-sm text-white/50">
                      로그인
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}