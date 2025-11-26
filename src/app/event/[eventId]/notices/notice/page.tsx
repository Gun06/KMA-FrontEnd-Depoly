"use client";

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { NoticeBoard } from '@/components/common/Notice';
import { useNoticeData } from './hooks/useNoticeData';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function EventNoticePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // API에서 모든 데이터를 가져오기 위해 큰 size 사용 (클라이언트 페이지네이션)
  const { noticeData, isLoading, error, displayNotices } = useNoticeData(eventId, 1, 1000);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: string | number) => {
    let originalId = id;
    
    if (typeof id === 'string') {
      // 다양한 접두사 패턴 제거
      if (id.startsWith('pinned_')) {
        // pinned_0_uuid 형식에서 uuid 추출
        originalId = id.replace(/^pinned_\d+_/, '');
      } else if (id.startsWith('regular_')) {
        // regular_uuid 형식에서 uuid 추출
        originalId = id.replace('regular_', '');
      } else if (id.startsWith('other_')) {
        // other_uuid 형식에서 uuid 추출
        originalId = id.replace('other_', '');
      }
    }
    
    router.push(`/event/${eventId}/notices/notice/${originalId}`);
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
  if (error && !noticeData) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "공지사항"
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
        subMenu: "공지사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <NoticeBoard
          data={displayNotices}
          onRowClick={handleRowClick}
          pageSize={pageSize}
          pinLimit={10}
          numberDesc={true}
          showPinnedBadgeInNo={true}
          pinnedClickable={true}
          showSearch={false}
          useApi={false}
          currentPage={currentPage}
          totalElements={displayNotices.length}
          onPageChange={handlePageChange}
        />
      </div>
    </SubmenuLayout>
  );
}
