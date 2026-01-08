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
import EventNotFoundModal from '@/components/event/EventNotFoundModal';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params;
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 404 에러 감지
  useEffect(() => {
    const checkEventExists = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          setIsChecking(false);
          return;
        }

        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        const response = await fetch(API_ENDPOINT);

        if (response.status === 404) {
          // 404 에러 응답 본문 확인
          try {
            const errorData = await response.json();
            // NOT_FOUND_EVENT 코드 확인
            if (errorData.code === 'NOT_FOUND_EVENT' || errorData.httpStatus === 'NOT FOUND') {
              setShowNotFoundModal(true);
            } else {
              setShowNotFoundModal(true);
            }
          } catch {
            // JSON 파싱 실패 시에도 404이면 모달 표시
            setShowNotFoundModal(true);
          }
        } else if (!response.ok) {
          // 다른 에러도 404로 처리 (비공개 대회 등)
          setShowNotFoundModal(true);
        }
      } catch (error) {
        // 네트워크 에러 등은 무시 (컴포넌트에서 처리)
      } finally {
        setIsChecking(false);
      }
    };

    checkEventExists();
  }, [eventId]);

  // 404 모달이 표시되면 다른 컴포넌트는 렌더링하지 않음
  if (showNotFoundModal) {
    return (
      <div className="relative">
        {/* 배경은 블러 처리되므로 기본 페이지는 그대로 렌더링 */}
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

        {/* 404 모달 */}
        <EventNotFoundModal isOpen={showNotFoundModal} />
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
