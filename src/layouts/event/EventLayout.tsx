import React from 'react'
import EventHeader from '@/components/event/Header'
import EventFooter from '@/components/event/Footer'
import SponsorsMarquee from '@/components/event/Sponsors/index'
import { EventsProvider, useEvents } from '@/contexts/EventsContext';
import { useSearchParams } from 'next/navigation';

interface EventLayoutProps {
  children: React.ReactNode
  eventId?: string
  mainBannerColor?: string
}

interface EventLayoutContentProps extends EventLayoutProps {
  urlColor: string | null;
}

interface HeroEventData {
  eventInfo?: {
    mainBannerColor?: string;
  };
}

export default function EventLayout({ children, eventId, mainBannerColor }: EventLayoutProps) {
  return (
    <EventLayoutWithProvider eventId={eventId} mainBannerColor={mainBannerColor}>
      {children}
    </EventLayoutWithProvider>
  )
}

function EventLayoutWithProvider({ children, eventId, mainBannerColor }: EventLayoutProps) {
  const searchParams = useSearchParams();
  const urlColor = searchParams.get('color');
  const initialColor = urlColor || mainBannerColor || null;

  return (
    <EventsProvider initialMainBannerColor={initialColor}>
      <EventLayoutContent
        eventId={eventId}
        mainBannerColor={mainBannerColor}
        urlColor={urlColor}
      >
        {children}
      </EventLayoutContent>
    </EventsProvider>
  );
}

function EventLayoutContent({
  children,
  eventId,
  mainBannerColor: propMainBannerColor,
  urlColor,
}: EventLayoutContentProps) {
  const { mainBannerColor: contextMainBannerColor, setMainBannerColor } = useEvents();
  const [cachedColor, setCachedColor] = React.useState<string | null>(null);
  const [heroEventData, setHeroEventData] = React.useState<HeroEventData | null>(null);

  // 글로벌 스크롤 위치 저장 및 복원
  React.useEffect(() => {
    if (!eventId || typeof window === 'undefined') return;

    const scrollKey = `scroll_position_${eventId}`;
    let scrollRestored = false;

    // 저장된 스크롤 위치 복원 (페이지 로드 시 즉시)
    const restoreScroll = () => {
      if (scrollRestored) return;
      try {
        const savedScrollPosition = sessionStorage.getItem(scrollKey);
        if (savedScrollPosition) {
          const scrollY = parseInt(savedScrollPosition, 10);
          if (!isNaN(scrollY) && scrollY > 0) {
            // requestAnimationFrame을 사용하여 DOM이 준비된 후 복원
            requestAnimationFrame(() => {
              window.scrollTo(0, scrollY);
              scrollRestored = true;
            });
          }
        }
      } catch (e) {
        // sessionStorage 접근 실패 시 무시
      }
    };

    // 즉시 복원 시도
    restoreScroll();

    // DOMContentLoaded 후에도 복원 시도 (안전장치)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restoreScroll);
    } else {
      restoreScroll();
    }

    // 스크롤 이벤트 리스너: 스크롤 위치를 sessionStorage에 저장
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          try {
            sessionStorage.setItem(scrollKey, window.scrollY.toString());
          } catch (e) {
            // sessionStorage 저장 실패 시 무시
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 페이지 언마운트 시 정리
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('DOMContentLoaded', restoreScroll);
    };
  }, [eventId]);

  // 클라이언트에서만 캐시된 색상 복구
  React.useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    const readCache = () => {
      if (typeof window === 'undefined') return null;
      try {
        const infoRaw = localStorage.getItem(`event_info_${eventId}`);
        if (infoRaw) {
          const parsed = JSON.parse(infoRaw);
          const color = parsed?.data?.mainBannerColor;
          if (typeof color === 'string' && color.length > 0) {
            return color;
          }
        }
        const heroRaw = localStorage.getItem(`hero_main_${eventId}`);
        if (heroRaw) {
          const parsed = JSON.parse(heroRaw);
          const color = parsed?.data?.mainBannerColor;
          if (typeof color === 'string' && color.length > 0) {
            return color;
          }
        }
        const heroEventRaw = localStorage.getItem(`hero_event_${eventId}`);
        if (heroEventRaw) {
          const parsed = JSON.parse(heroEventRaw);
          const color =
            parsed?.data?.eventInfo?.mainBannerColor ?? parsed?.data?.mainBannerColor;
          if (typeof color === 'string' && color.length > 0) {
            return color;
          }
        }
      } catch {
        /* noop */
      }
      return null;
    };
    const color = readCache();
    if (!cancelled) {
      setCachedColor(prev => (prev === color ? prev : color));
    }
    return () => {
      cancelled = true;
    };
  }, [eventId]);
 
  // Hero 이벤트 데이터 페치 (Submenu와 동일한 엔드포인트 활용)
  React.useEffect(() => {
    if (!eventId) return;
    const cached = () => {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem(`hero_event_${eventId}`);
        if (!raw) return null;
        return JSON.parse(raw)?.data ?? null;
      } catch {
        return null;
      }
    };
    const existing = cached();
    if (existing) {
      setHeroEventData(prev => prev ?? existing);
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
    if (!API_BASE_URL) return;

    let cancelled = false;

    fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data || cancelled) return;
        setHeroEventData(data);
        try {
          localStorage.setItem(
            `hero_event_${eventId}`,
            JSON.stringify({ data, ts: Date.now() }),
          );
        } catch {
          /* noop */
        }
      })
      .catch(() => {})
      .finally(() => {
        /* noop */
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // 우선순위: URL > prop > context > 기본값 (URL을 최우선으로)
  const mainBannerColor =
    urlColor ||
    propMainBannerColor ||
    contextMainBannerColor ||
    cachedColor ||
    heroEventData?.eventInfo?.mainBannerColor ||
    '';
  
  // URL에서 색상을 가져왔으면 context에 설정
  React.useEffect(() => {
    if (urlColor && urlColor !== contextMainBannerColor) {
      setMainBannerColor(urlColor);
    }
  }, [urlColor, contextMainBannerColor, setMainBannerColor]);

  // props로 전달된 색상이 있으면 컨텍스트와 동기화 (URL이 없는 경우)
  React.useEffect(() => {
    if (!urlColor && propMainBannerColor && propMainBannerColor !== contextMainBannerColor) {
      setMainBannerColor(propMainBannerColor);
    }
  }, [urlColor, propMainBannerColor, contextMainBannerColor, setMainBannerColor]);

  // 캐시에 저장된 색상 즉시 적용 (URL/props가 없을 때)
  React.useEffect(() => {
    if (!urlColor && !propMainBannerColor && cachedColor && cachedColor !== contextMainBannerColor) {
      setMainBannerColor(cachedColor);
    }
  }, [urlColor, propMainBannerColor, cachedColor, contextMainBannerColor, setMainBannerColor]);

  React.useEffect(() => {
    const heroColor = heroEventData?.eventInfo?.mainBannerColor;
    if (!urlColor && !propMainBannerColor && heroColor && heroColor !== contextMainBannerColor) {
      setMainBannerColor(heroColor);
    }
  }, [
    heroEventData?.eventInfo?.mainBannerColor,
    urlColor,
    propMainBannerColor,
    contextMainBannerColor,
    setMainBannerColor,
  ]);

  // 헤더 색상 일관성: 다른 메뉴 새로고침 시 캐시에서 색상 복구
  React.useEffect(() => {
    if (urlColor || contextMainBannerColor) return; // 이미 설정됨
    try {
      if (!eventId) return;
      // 1) event_info 캐시
      const cached = localStorage.getItem(`event_info_${eventId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const color = parsed?.data?.mainBannerColor;
        if (color) {
          setMainBannerColor(color);
          return;
        }
      }
      // 2) hero_main 캐시
      const hero = localStorage.getItem(`hero_main_${eventId}`);
      if (hero) {
        const parsed = JSON.parse(hero);
        const color = parsed?.data?.mainBannerColor;
        if (color) {
          setMainBannerColor(color);
        }
      }
    } catch {}
  }, [eventId, urlColor, contextMainBannerColor, setMainBannerColor]);

  
  // 그라데이션 키가 넘어온 경우 끝색으로 포인트색 결정
  const gradEndMap: Record<string, string> = {
    'grad-indigo': '#4f46e5',
    'grad-blue': '#2563eb',
    'grad-emerald': '#059669',
    'grad-red': '#dc2626',
    'grad-purple': '#7c3aed',
    'grad-orange': '#ea580c',
    'grad-rose': '#e11d48',
    'grad-cyan': '#0891b2',
    'grad-yellow': '#fbbf24',
  };
  const flatColorMap: Record<string, string> = {
    indigo: '#4f46e5',
    blue: '#2563eb',
    green: '#059669',
    emerald: '#059669',
    red: '#dc2626',
    purple: '#7c3aed',
    orange: '#ea580c',
    rose: '#e11d48',
    cyan: '#0891b2',
    yellow: '#fbbf24',
    dark: '#111827',
    slate: '#1f2937',
    black: '#000000',
    light: '#ffffff',
  };
  const resolveAccent = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (value.startsWith('grad-')) {
      return gradEndMap[value] || undefined;
    }
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      return value;
    }
    if (flatColorMap[value]) {
      return flatColorMap[value];
    }
    return value;
  };

  const accentColor = resolveAccent(mainBannerColor);

  // 헤더/푸터용 그라데이션 클래스 맵
  const gradClassMap: Record<string, string> = {
    'grad-indigo': 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600',
    'grad-blue': 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600',
    'grad-emerald': 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600',
    'grad-red': 'bg-gradient-to-r from-red-900 via-red-800 to-red-600',
    'grad-purple': 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600',
    'grad-orange': 'bg-gradient-to-r from-orange-900 via-orange-800 to-orange-600',
    'grad-rose': 'bg-gradient-to-r from-rose-900 via-rose-800 to-rose-600',
    'grad-cyan': 'bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-600',
    'grad-yellow': 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200',
  };
  const headerBgClass = mainBannerColor?.startsWith('grad-')
    ? gradClassMap[mainBannerColor]
    : undefined;
  const footerBgClass = headerBgClass;

  return (
    <div className="min-h-screen flex flex-col relative">
      <EventHeader eventId={eventId} accentColor={accentColor} headerBgClass={headerBgClass} />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <div className="w-full border-t border-gray-200" />
      {/* 스폰서 마퀸 섹션 */}
      <SponsorsMarquee eventId={eventId} />
      <EventFooter footerBgClass={footerBgClass} accentColor={accentColor} />
    </div>
  )
}

// 테마 적용 레이아웃 (관리자 선택값에 따라 클래스 주입)
interface EventLayoutThemedProps extends EventLayoutProps {
  headerBgClass?: string
  footerBgClass?: string
  accentColor?: string
  _mainBannerColor?: string
}

export function EventLayoutThemed({ children, eventId, headerBgClass, footerBgClass, accentColor, _mainBannerColor }: EventLayoutThemedProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EventHeader eventId={eventId} accentColor={accentColor} />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <div className="w-full border-t border-gray-200" />
      {/* 스폰서 마퀸 섹션 */}
      <SponsorsMarquee eventId={eventId} />
      <EventFooter footerBgClass={footerBgClass} accentColor={accentColor} />
    </div>
  )
}