'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { NoticeBoard } from '@/components/common/Notice';
import { useNoticeData } from './hooks/useNoticeData';

export default function NoticePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // API에서 공지사항 데이터 로드
  const { noticeData, loading, error, totalPages, totalElements } = useNoticeData(currentPage, pageSize);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: number) => {
    router.push(`/notice/notice/${id}`);
  };

  // 로딩 상태
  if (loading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "공지사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-4 text-gray-600">공지사항을 불러오는 중...</span>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "공지사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "공지사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <NoticeBoard
          data={noticeData}
          onRowClick={handleRowClick}
          pageSize={pageSize}
          pinLimit={15}
          numberDesc={true}
          showPinnedBadgeInNo={true}
          pinnedClickable={true}
          showSearch={true}
          currentPage={currentPage}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </SubmenuLayout>
  );
}
