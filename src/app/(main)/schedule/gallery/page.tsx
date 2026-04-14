'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';
import { GalleryGrid } from './components';
import { useGalleryList } from './hooks/useGalleryList';
import PaginationBar from '@/components/common/Pagination/PaginationBar';
import type { GalleryItem } from './types';

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageSize = 12; // 한 페이지에 12개씩 표시 (3x4 또는 4x3 그리드)

  // URL 쿼리 파라미터에서 페이지 번호 읽기
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);

  const { data, isLoading, error } = useGalleryList({
    page: currentPage,
    size: pageSize,
  });

  // URL 쿼리 파라미터와 동기화
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (pageFromUrl > 0 && pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/schedule/gallery${newUrl}`, { scroll: false });

    // 페이지 변경 시 스크롤을 상단으로 이동
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemClick = (item: GalleryItem) => {
    // Google Photo URL이 있으면 새 창에서 열기
    if (item.googlePhotoUrl) {
      window.open(item.googlePhotoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-[50vh] sm:min-h-screen flex flex-col">
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 */}
        <div className="relative w-full" style={{ marginTop: 'calc(-1 * var(--kma-main-header-offset, 80px))' }}>
          <div className="sm:hidden" style={{ paddingBottom: '28%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden lg:block" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />

          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-4 sm:px-6 lg:px-[6vw]" style={{ paddingTop: 'var(--kma-main-header-offset, 80px)' }}>
            {/* 페이지 제목 */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black mb-1 sm:mb-2 font-giants-bold">
              대회갤러리
            </h1>

            {/* 브레드크럼 */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <Link href="/" className="flex items-center hover:text-blue-600 transition-colors">
                <Image
                  src={homeIcon}
                  alt="홈"
                  width={14}
                  height={14}
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/schedule" className="hover:text-blue-600 transition-colors">
                대회일정
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">대회갤러리</span>
            </div>
          </div>
        </div>

        {/* 갤러리 콘텐츠 섹션 */}
        <div className="w-full bg-white py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 페이지 설명 */}
            <div className="mb-8 md:mb-12 text-center">
              <div className="inline-flex flex-col items-center">
                <p className="text-[11px] tracking-[0.12em] text-gray-400 mb-2">GALLERY</p>
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-50 border border-gray-200">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-700 text-sm sm:text-base font-light">
                    다양한 대회의 추억을 갤러리에서 확인하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 에러 상태 */}
            {error && (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-red-500 text-center">
                  <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
                  <p className="text-sm">갤러리를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                </div>
              </div>
            )}

            {/* 로딩 및 갤러리 그리드 */}
            {!error && (
              <>
                <GalleryGrid
                  items={data?.content || []}
                  onItemClick={handleItemClick}
                  isLoading={isLoading}
                />

                {/* 페이지네이션 */}
                {data && (
                  <div className="mt-8 md:mt-12">
                    <PaginationBar
                      page={currentPage}
                      total={data.totalElements}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                      showNumbersInBar={true}
                      showTotalText={true}
                      showPageIndicator={true}
                      totalTextFormatter={(total) => (
                        <>
                          총 <b>{total.toLocaleString()}</b>개의 갤러리 항목
                        </>
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
