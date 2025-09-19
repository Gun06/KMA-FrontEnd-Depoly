"use client";

import { useParams } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { getEventFaqData } from '@/data/eventFaq';
import { useFaqData } from './hooks/useFaqData';
import { useFaqAccordion } from './hooks/useFaqAccordion';
import { FaqList } from './components/FaqList';
import { StatusNotification } from './components/StatusNotification';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function EventFaqPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  // 커스텀 훅 사용
  const { faqData, isLoading, error, displayFaqItems } = useFaqData(eventId);
  const { isOpen, toggle } = useFaqAccordion();

  // 정적 데이터 사용 여부 확인
  const showFallback = !faqData && getEventFaqData(eventId).length > 0;

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "자주 묻는 질문"
        }}
      >
        <LoadingState eventId={eventId} />
      </SubmenuLayout>
    );
  }

  // 오류 상태 (정적 데이터도 없는 경우에만 표시)
  if (error && !faqData && getEventFaqData(eventId).length === 0) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "자주 묻는 질문"
        }}
      >
        <ErrorState eventId={eventId} error={error} />
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "자주 묻는 질문"
      }}
    >
      <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* API 상태 알림 */}
        <StatusNotification showFallback={showFallback} />
        
        {/* FAQ 리스트 */}
        <FaqList 
          faqItems={displayFaqItems}
          isOpen={isOpen}
          onToggle={toggle}
        />
      </div>
    </SubmenuLayout>
  );
}
