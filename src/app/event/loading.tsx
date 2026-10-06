'use client';

import { usePathname } from 'next/navigation';
import EventMarathonLoader from '@/components/event/EventMainPageLoader/EventMarathonLoader';

/** 대회 메인(/event/{id}) 진입 시에만 마라톤 로더. 하위 경로는 빈 fallback */
export default function EventRouteLoading() {
  const pathname = usePathname();
  const isEventHome = Boolean(pathname && /^\/event\/[^/]+$/.test(pathname));

  if (!isEventHome) {
    return null;
  }

  return <EventMarathonLoader visible accentColor="#16A34A" />;
}
