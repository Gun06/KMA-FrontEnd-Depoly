import React from 'react'
import EventHeader from '@/components/event/Header'
import EventFooter from '@/components/event/Footer'
import SponsorsMarquee from '@/components/event/Sponsors'
import { EventsProvider, useEvents } from '@/contexts/EventsContext';
import { useSearchParams } from 'next/navigation';

interface EventLayoutProps {
  children: React.ReactNode
  eventId?: string
  mainBannerColor?: string
}

export default function EventLayout({ children, eventId, mainBannerColor }: EventLayoutProps) {
  return (
    <EventsProvider>
      <EventLayoutContent eventId={eventId} mainBannerColor={mainBannerColor}>{children}</EventLayoutContent>
    </EventsProvider>
  )
}

function EventLayoutContent({ children, eventId, mainBannerColor: propMainBannerColor }: EventLayoutProps) {
  const { mainBannerColor: contextMainBannerColor, setMainBannerColor } = useEvents();
  const searchParams = useSearchParams();
  
  // 우선순위: URL > prop > context > 기본값 (URL을 최우선으로)
  const urlColor = searchParams.get('color');
  const mainBannerColor = urlColor || propMainBannerColor || contextMainBannerColor || '#3b82f6';
  
  // URL에서 색상을 가져왔으면 context에 설정
  React.useEffect(() => {
    if (urlColor && urlColor !== contextMainBannerColor) {
      setMainBannerColor(urlColor);
    }
  }, [urlColor, contextMainBannerColor, setMainBannerColor]);
  
  const accentColor = mainBannerColor;

  return (
    <div className="min-h-screen flex flex-col">
      <EventHeader eventId={eventId} accentColor={accentColor} />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <div className="w-full border-t border-gray-200" />
      {/* 스폰서 마퀸 섹션 */}
      <SponsorsMarquee eventId={eventId} />
      <EventFooter accentColor={accentColor} />
    </div>
  )
}

// 테마 적용 레이아웃 (관리자 선택값에 따라 클래스 주입)
interface EventLayoutThemedProps extends EventLayoutProps {
  headerBgClass?: string
  footerBgClass?: string
  accentColor?: string
}

export function EventLayoutThemed({ children, eventId, headerBgClass, footerBgClass, accentColor, mainBannerColor }: EventLayoutThemedProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EventHeader eventId={eventId} headerBgClass={headerBgClass} accentColor={accentColor} />
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