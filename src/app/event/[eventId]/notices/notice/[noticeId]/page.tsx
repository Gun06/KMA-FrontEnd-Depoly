"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout/SubmenuLayout";
import { useNoticeDetail } from './hooks/useNoticeDetail';
import { NoticeHeader } from './components/NoticeHeader';
import { AttachmentList } from './components/AttachmentList';
import { BackButton } from './components/BackButton';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { NotFoundState } from './components/NotFoundState';

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const noticeId = params.noticeId as string;
  
  const { noticeDetail, isLoading, error } = useNoticeDetail(eventId, noticeId);

  // 뒤로가기 함수
  const handleBack = () => {
    router.push(`/event/${eventId}/notices/notice`);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "공지사항"
        }}
      >
        <LoadingState eventId={eventId} />
      </SubmenuLayout>
    );
  }

  // 오류 상태
  if (error && !noticeDetail) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "공지사항"
        }}
      >
        <ErrorState eventId={eventId} error={error} onBack={handleBack} />
      </SubmenuLayout>
    );
  }

  if (!noticeDetail) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "공지사항"
        }}
      >
        <NotFoundState eventId={eventId} onBack={handleBack} />
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "공지사항"
      }}
    >
      <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* 뒤로가기 버튼 */}
        <BackButton onBack={handleBack} className="mb-6" />

        {/* 공지사항 상세 내용 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <NoticeHeader noticeDetail={noticeDetail} />

          {/* 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
            <div 
              className="prose max-w-none text-sm sm:text-base leading-relaxed break-words font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
              style={{ fontWeight: 100, color: '#4b5563' }}
              dangerouslySetInnerHTML={{ __html: noticeDetail.content }}
            />
          </div>

          <AttachmentList attachmentUrls={noticeDetail.attachmentUrls} />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <BackButton 
            onBack={handleBack}
            className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          />
        </div>
      </div>
    </SubmenuLayout>
  );
}
