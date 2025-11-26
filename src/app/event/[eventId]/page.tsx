"use client";

import { useEffect, useState } from 'react';
import { TopSection } from '@/components/event/TopSection';
import { MiddleSection } from '@/components/event/MiddleSection';
import { SnsSection } from '@/components/event/SnsSection';
import { BottomNoticeSection } from '@/components/event/BottomNoticeSection';
import NoticeSection from '@/components/event/NoticeSection';
import { FloatingApplyButton } from '@/components/event/FloatingButton';
import SponsorsMarquee from '@/components/event/Sponsors/index';
import topsectionBg from '@/assets/images/event/topsection.png';
import topsectionMobileBg from '@/assets/images/event/topsectionmobile.png';
import { EventPopupManager } from '@/components/event/Popup';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params;
  const [isReady, setIsReady] = useState(false);

  // 전체 페이지 로딩: 클라이언트 마운트 전까지 흰 화면 + 로더 표시
  useEffect(() => {
    // 즉시 마운트 완료 처리 (필요 시 프리페치/캐시 확인 로직 추가 가능)
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="bg-white">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-3"></div>
            <div className="text-gray-600 text-sm">잠시만 기다려주세요</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 대회 팝업 */}
      <EventPopupManager eventId={eventId} />

      {/* Notice 섹션 */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto">
          <NoticeSection 
            eventId={eventId}
            className="py-4"
            autoRotate={true}
            rotateInterval={4000}
          />
        </div>
      </div>
      
      {/* TopSection */}
      <TopSection 
        eventId={eventId} 
      />
      
      {/* Middle 섹션 */}
      <MiddleSection eventId={eventId} />
      
      {/* SNS 섹션 */}
      <SnsSection eventId={eventId} />
      
      {/* 공지사항 섹션 */}
      <BottomNoticeSection eventId={eventId} />
      
      {/* 플로팅 참가신청 버튼 */}
      <FloatingApplyButton eventId={eventId} />
    </div>
  );
}
