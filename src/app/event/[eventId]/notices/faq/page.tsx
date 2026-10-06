"use client";

import { useParams } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useFaqData } from './hooks/useFaqData';
import { useFaqAccordion } from './hooks/useFaqAccordion';
import { FaqList } from './components/FaqList';
import { FaqPageFrame } from './components/FaqPageFrame';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function EventFaqPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  // 커스텀 훅 사용
  const { faqData, isLoading, error, displayFaqItems } = useFaqData(eventId);
  const { isOpen, toggle } = useFaqAccordion();

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

  // 오류 상태
  if (error && !faqData) {
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
      <FaqPageFrame>
        <FaqList
          faqItems={displayFaqItems}
          isOpen={isOpen}
          onToggle={toggle}
        />
      </FaqPageFrame>
    </SubmenuLayout>
  );
}
