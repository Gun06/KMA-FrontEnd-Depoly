'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EventHeader from '@/components/event/Header';
import HeroSection from '@/components/event/HeroSection';
import _NoticeSection from '@/components/event/NoticeSection';
import Breadcrumb from '@/components/event/Breadcrumb';
import { useMainBanner } from '@/components/providers/MainBannerContext';

const MAP_BG: Record<string, string> = {
  dark: 'bg-neutral-900',
  light: 'bg-white',
  black: 'bg-black',
  blue: 'bg-blue-700',
  red: 'bg-red-700',
  green: 'bg-emerald-700',
  indigo: 'bg-indigo-700',
  slate: 'bg-slate-900',
  yellow: 'bg-yellow-300',
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

interface SubmenuLayoutProps {
  children: React.ReactNode
  eventId: string
  _noticeIndex?: number
  breadcrumb?: {
    mainMenu: string;
    subMenu: string;
  }
}

interface HeroEventData {
  eventInfo: {
    nameKr: string;
    nameEng: string;
    startDate: string;
    region: string;
    mainBannerPcImageUrl: string;
    mainBannerMobileImageUrl: string;
    mainBannerColor: string;
  };
}

export default function SubmenuLayout({
  children,
  eventId,
  _noticeIndex = 0,
  breadcrumb
}: SubmenuLayoutProps) {
  const params = useSearchParams();
  const { mainBannerColor: contextMainBannerColor } = useMainBanner();
  
  // URL 파라미터로 테마 설정 읽기
  const theme = params.get('theme') || '';
  const hb = params.get('hb') || '';
  const color = params.get('color') || '';
  
  const normalizedTheme = theme === 'white' ? '' : theme;
  const normalizedHb = hb === 'white' ? '' : hb;
  
  // color 파라미터가 있으면 우선 사용, 없으면 theme/hb 사용
  const gradEndMap: Record<string, string> = {
    'grad-indigo': '#4f46e5',
    'grad-blue': '#2563eb',
    'grad-emerald': '#059669',
    'grad-red': '#dc2626',
    'grad-purple': '#7c3aed',
    'grad-orange': '#ea580c',
    'grad-rose': '#e11d48',
    'grad-cyan': '#0891b2',
  };

  const getCachedHero = (): HeroEventData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`hero_event_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data || null;
    } catch {
      return null;
    }
  };

  const [heroEventData, setHeroEventData] = useState<HeroEventData | null>(getCachedHero());
  const [isLoading, setIsLoading] = useState(!getCachedHero());
  const [error, setError] = useState<string | null>(null);

  const pickFinalColorKey = (): string => {
    if (color) return color;
    if (normalizedHb) return normalizedHb;
    if (normalizedTheme) return normalizedTheme;
    if (contextMainBannerColor && MAP_BG[contextMainBannerColor]) {
      return contextMainBannerColor;
    }
    if (
      contextMainBannerColor &&
      contextMainBannerColor.startsWith('grad-') &&
      MAP_BG[contextMainBannerColor.trim()]
    ) {
      return contextMainBannerColor.trim();
    }
    if (
      heroEventData?.eventInfo?.mainBannerColor &&
      MAP_BG[heroEventData.eventInfo.mainBannerColor]
    ) {
      return heroEventData.eventInfo.mainBannerColor;
    }
    if (
      heroEventData?.eventInfo?.mainBannerColor &&
      heroEventData.eventInfo.mainBannerColor.startsWith('grad-') &&
      MAP_BG[heroEventData.eventInfo.mainBannerColor.trim()]
    ) {
      return heroEventData.eventInfo.mainBannerColor.trim();
    }
    return '';
  };

  const finalColorKey = pickFinalColorKey();
  const fallbackBannerColor =
    heroEventData?.eventInfo?.mainBannerColor ||
    contextMainBannerColor ||
    '';

  const headerBgClass =
    MAP_BG[finalColorKey] ||
    (fallbackBannerColor && MAP_BG[fallbackBannerColor]) ||
    undefined;
  
  // 그라데이션 키에서 끝색 추출하여 포인트색 결정
  
  const resolveAccent = (key?: string): string | undefined => {
    if (!key) return undefined;
    if (key === 'black' || key === 'dark' || key === 'slate') return '#ef4444';
    if (key.startsWith('grad-')) {
      return gradEndMap[key] || undefined;
    }
    const flatMap: Record<string, string> = {
      indigo: '#4f46e5',
      blue: '#2563eb',
      green: '#059669',
      red: '#dc2626',
      purple: '#7c3aed',
      orange: '#ea580c',
      rose: '#e11d48',
      cyan: '#0891b2',
      yellow: '#fbbf24',
    };
    return flatMap[key] || undefined;
  };
  
  const accentColor = useMemo(() => {
    if (color) {
      return resolveAccent(color);
    }
    if (normalizedHb || normalizedTheme) {
      const fromTheme = resolveAccent(normalizedHb || normalizedTheme);
      if (fromTheme) return fromTheme;
    }

    if (contextMainBannerColor) {
      if (contextMainBannerColor.startsWith('grad-')) {
        return gradEndMap[contextMainBannerColor] || undefined;
      }
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(contextMainBannerColor)) {
        return contextMainBannerColor;
      }
      return resolveAccent(contextMainBannerColor);
    }

    if (heroEventData?.eventInfo?.mainBannerColor) {
      const heroColor = heroEventData.eventInfo.mainBannerColor;
      if (heroColor.startsWith('grad-')) {
        return gradEndMap[heroColor] || undefined;
      }
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(heroColor)) {
        return heroColor;
      }
      return resolveAccent(heroColor);
    }

    return undefined;
  }, [color, normalizedHb, normalizedTheme, contextMainBannerColor, heroEventData]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(!getCachedHero());
        setError(null);

        // API에서 Hero 데이터 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setHeroEventData(data);
          // 2) 성공 시 캐시 갱신
          try {
            localStorage.setItem(`hero_event_${eventId}`, JSON.stringify({ data, ts: Date.now() }));
          } catch {}
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (_error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [eventId]);

  // 로딩 상태를 표시하지 않고 기본 레이아웃을 즉시 렌더링

  if (error && !heroEventData) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 헤더는 항상 표시 */}
        <EventHeader eventId={eventId} headerBgClass={headerBgClass} accentColor={accentColor} />
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  // 브레드크럼 아이템 생성
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: breadcrumb?.mainMenu || "대회안내" },
    { label: breadcrumb?.subMenu || "대회요강" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <EventHeader eventId={eventId} headerBgClass={headerBgClass} accentColor={accentColor} />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 히어로 섹션 (항상 표시) */}
        <HeroSection 
          eventId={eventId}
          eventInfo={heroEventData}
        />
        
        {/* 브레드크럼과 페이지 제목 */}
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* 페이지 콘텐츠 */}
        {children}
      </main>
    </div>
  )
}

// 테마 적용 레이아웃 (관리자 선택값에 따라 클래스 주입)
interface SubmenuLayoutThemedProps extends SubmenuLayoutProps {
  headerBgClass?: string
  _accentColor?: string
}

export function SubmenuLayoutThemed({ 
  children, 
  eventId,
  _noticeIndex = 0,
  breadcrumb,
  headerBgClass, 
  _accentColor  
}: SubmenuLayoutThemedProps) {
  const [heroEventData, setHeroEventData] = useState<HeroEventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 Hero 데이터 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setHeroEventData(data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (_error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [eventId]);

  // 그라데이션 키에서 끝색 추출하여 포인트색 결정
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
  
  // headerBgClass에서 그라데이션 키 추출
  const extractGradKey = (bgClass?: string) => {
    if (!bgClass) return null;
    for (const key of Object.keys(gradEndMap)) {
      if (bgClass.includes(key)) return key;
    }
    return null;
  };
  
  const gradKey = extractGradKey(headerBgClass);
  const accentColor = gradKey ? gradEndMap[gradKey] : '#2563eb';

  // 로딩 상태를 표시하지 않고 기본 레이아웃을 즉시 렌더링

  if (error && !heroEventData) {
    return (
      <div className={`min-h-screen flex flex-col ${headerBgClass || ''}`}>
        {/* 헤더는 항상 표시 */}
        <EventHeader eventId={eventId} headerBgClass={headerBgClass} accentColor={accentColor} />
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  // 브레드크럼 아이템 생성
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: breadcrumb?.mainMenu || "대회안내" },
    { label: breadcrumb?.subMenu || "대회요강" }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${headerBgClass || ''}`}>
      {/* 헤더 */}
      <EventHeader eventId={eventId} headerBgClass={headerBgClass} accentColor={accentColor} />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 히어로 섹션 (항상 표시) */}
        <HeroSection 
          eventId={eventId}
          eventInfo={heroEventData}
        />
        
        {/* 브레드크럼과 페이지 제목 */}
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* 페이지 콘텐츠 */}
        {children}
      </main>
    </div>
  )
}
