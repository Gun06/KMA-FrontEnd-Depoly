"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { NoticeBoard } from '@/components/common/Notice';
import { useNoticeData } from './hooks/useNoticeData';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SearchSection } from './components/SearchSection';

export default function EventNoticePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState('all');
  
  const { noticeData, categories, isLoading, error, displayNotices } = useNoticeData(eventId, currentPage, pageSize);

  // 드롭다운 토글 함수
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 검색 타입 변경 함수
  const handleSearchTypeChange = (type: string) => {
    setSelectedSearchType(type);
    setIsDropdownOpen(false);
  };

  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: number) => {
    router.push(`/event/${eventId}/notices/notice/${id}`);
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
          pageSize={10}
          pinLimit={3}
          numberDesc={true}
          showPinnedBadgeInNo={true}
          pinnedClickable={true}
          showSearch={false}
          useApi={false}
        />
        
        <SearchSection
          categories={categories}
          isDropdownOpen={isDropdownOpen}
          selectedSearchType={selectedSearchType}
          onDropdownToggle={handleDropdownToggle}
          onSearchTypeChange={handleSearchTypeChange}
        />
      </div>
    </SubmenuLayout>
  );
}
