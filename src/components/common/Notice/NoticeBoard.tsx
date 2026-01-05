'use client';

import { useState, useMemo, useEffect } from 'react';
import NoticeTable from '@/components/common/Table/NoticeTable';
import Pagination from '@/components/common/Pagination/Pagination';
import PaginationBar from '@/components/common/Pagination/PaginationBar';
import FilterBar from '@/components/common/filters/FilterBar';
import { ChevronDown } from 'lucide-react';
import { useNotices, useEventNotices } from '@/hooks/useNotices';
import type { NoticeItem } from '@/components/common/Table/types';
import { useGetQuery } from '@/hooks/useFetch';

type Props = {
  // 정적 데이터 사용 시
  data?: NoticeItem[];
  
  // API 연결 사용 시
  useApi?: boolean;
  eventId?: string; // 대회별 공지사항용
  
  // 공통 옵션들
  onRowClick?: (id: number) => void;
  pageSize?: number;
  pinLimit?: number;
  numberDesc?: boolean;
  showPinnedBadgeInNo?: boolean;
  pinnedClickable?: boolean;
  showSearch?: boolean; // 검색 기능 표시 여부
  className?: string;
  
  // 외부 페이지네이션 제어
  currentPage?: number;
  totalElements?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  
  // 외부 검색 제어
  searchQuery?: string;
  onSearch?: (query: string) => void;
  selectedSearchType?: string;
  onSearchTypeChange?: (type: string) => void;
  onResetSearch?: () => void;
};

export default function NoticeBoard({
  data,
  useApi = false,
  eventId,
  onRowClick,
  pageSize = 10,
  pinLimit = 3,
  numberDesc = true,
  showPinnedBadgeInNo = true,
  pinnedClickable = true,
  showSearch = true,
  className,
  currentPage: externalCurrentPage,
  totalElements: externalTotalElements,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  searchQuery: externalSearchQuery,
  onSearch: externalOnSearch,
  selectedSearchType: externalSelectedSearchType,
  onSearchTypeChange: externalOnSearchTypeChange,
  onResetSearch: externalOnResetSearch,
}: Props) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 카테고리 목록 조회 (public API)
  const { data: categoriesData } = useGetQuery(
    ['notice', 'categories', 'public'],
    '/api/v1/public/notice/category',
    'user',
    {
      staleTime: 30 * 60 * 1000, // 30분
    },
    false // withAuth = false (public API)
  ) as { data: Array<{ id: string; name: string }> | undefined };

  // 카테고리 옵션 생성
  const categoryOptions = useMemo(() => {
    const options = [{ value: '', label: '전체' }];
    if (categoriesData && Array.isArray(categoriesData)) {
      options.push(...categoriesData.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })));
    }
    return options;
  }, [categoriesData]);

  // 외부에서 페이지를 제어하는 경우 외부 값을 사용, 아니면 내부 상태 사용
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const setCurrentPage = externalOnPageChange ?? setInternalCurrentPage;
  
  // 외부에서 검색을 제어하는 경우 외부 값을 사용, 아니면 내부 상태 사용
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = externalOnSearch ? (query: string) => {
    externalOnSearch(query);
  } : setInternalSearchQuery;

  // API 사용 시 데이터 fetching
  const apiFilters = useMemo(() => ({
    page: currentPage,
    pageSize,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  }), [currentPage, pageSize, selectedCategory, searchQuery]);

  // 메인 공지사항 API 호출
  const { data: mainNoticesData, isLoading: isMainLoading, error: mainError } = useNotices(
    apiFilters,
    useApi && !eventId
  );

  // 대회별 공지사항 API 호출
  const { data: eventNoticesData, isLoading: isEventLoading, error: eventError } = useEventNotices(
    eventId || '',
    apiFilters.page || 1,
    apiFilters.pageSize || 20,
    useApi && !!eventId
  );

  // 데이터 소스 결정
  const apiData = eventId ? eventNoticesData : mainNoticesData;
  const isLoading = eventId ? isEventLoading : isMainLoading;
  const error = eventId ? eventError : mainError;

  // 정적 데이터 사용 시 필터링
  const filteredStaticData = useMemo(() => {
    if (useApi || !data) return [];
    
    return data.filter((item) => {
      const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery, useApi]);

  // 최종 데이터 결정
  const finalData: {
    rows: NoticeItem[];
    total: number;
    effectivePageSize: number;
  } = useMemo(() => {
    if (useApi) {
      return {
        rows: (apiData as { content?: NoticeItem[] })?.content || [],
        total: (apiData as { totalElements?: number })?.totalElements || 0,
        effectivePageSize: pageSize,
      };
    } else {
      // 외부에서 totalElements를 제공하는 경우 사용 (페이지네이션용)
      // 외부에서 totalElements가 제공되면 백엔드에서 이미 페이지네이션된 데이터
      const isBackendPaginated = externalTotalElements !== undefined;
      
      // 고정 공지사항과 일반 공지사항 분리
      const pinnedItems = filteredStaticData.filter(item => item.pinned);
      const regularItems = filteredStaticData.filter(item => !item.pinned);
      
      // 백엔드에서 페이지네이션된 경우와 프론트에서 페이지네이션하는 경우 분리
      let paginatedRegularItems: NoticeItem[];
      let effectivePageSize: number;
      
      if (isBackendPaginated) {
        // 클라이언트 사이드 페이지네이션 처리 (externalTotalElements는 총 개수만 전달)
        const regularPageSize = pageSize;
        const totalRegularItems = regularItems.length;
        const start = (currentPage - 1) * regularPageSize;
        const end = start + regularPageSize;
        paginatedRegularItems = regularItems.slice(start, end).map((item, index) => ({
          ...item,
          // 이미 __displayNo가 설정되어 있으면 그대로 사용, 없으면 계산 (답변 항목은 제외)
          __displayNo: item.__displayNo !== undefined 
            ? item.__displayNo 
            : (item.category === '답변' ? undefined : (totalRegularItems - start - index)),
        }));
        effectivePageSize = regularPageSize;
      } else {
        // 프론트에서 페이지네이션 처리
        const regularPageSize = pageSize;
        const totalRegularItems = regularItems.length;
        const start = (currentPage - 1) * regularPageSize;
        const end = start + regularPageSize;
        paginatedRegularItems = regularItems.slice(start, end).map((item, index) => ({
          ...item,
          // 이미 __displayNo가 설정되어 있으면 그대로 사용, 없으면 계산 (답변 항목은 제외)
          __displayNo: item.__displayNo !== undefined 
            ? item.__displayNo 
            : (item.category === '답변' ? undefined : (totalRegularItems - start - index)),
        }));
        effectivePageSize = regularPageSize;
      }
      
      // 고정 공지사항 + 현재 페이지의 일반 공지사항
      const rows = [...pinnedItems, ...paginatedRegularItems];
      
      // 전체 개수는 외부에서 제공된 totalElements 사용 (백엔드 값), 없으면 일반 공지사항 개수
      const total = externalTotalElements !== undefined ? externalTotalElements : regularItems.length;
      
      return { rows, total, effectivePageSize };
    }
  }, [useApi, apiData, filteredStaticData, currentPage, pageSize, externalTotalElements]);

  // 페이지 변경 시 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 필터 변경 시 처리
  const handleFieldChange = (label: string, value: string) => {
    if (label === '카테고리') {
      setSelectedCategory(value);
      setCurrentPage(1);
    }
  };

  // 검색 처리
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // 로딩 상태 처리
  if (useApi && isLoading) {
    return (
      <div className={`bg-white h-full ${className || ''} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">공지사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (useApi && error) {
    return (
      <div className={`bg-white h-full ${className || ''} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">공지사항을 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 text-sm hover:underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white h-full ${className || ''}`}>

      {/* 테이블 */}
      <div className="overflow-hidden sm:px-6">
                  <NoticeTable
            data={finalData.rows}
            onRowClick={onRowClick as (id: string | number) => void}
            pinLimit={pinLimit}
            numberDesc={numberDesc}
            showPinnedBadgeInNo={showPinnedBadgeInNo}
            pinnedClickable={pinnedClickable}
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={finalData.total}
          />
        </div>

        {/* 페이지네이션 바 */}
        <PaginationBar
          page={currentPage}
          total={finalData.total}
          pageSize={finalData.effectivePageSize}
          onChange={handlePageChange}
          showTotalText={true}
          showPageIndicator={true}
          className="bg-white px-1 sm:px-6"
          totalPages={externalTotalPages}
        />

        {/* 페이지네이션 */}
        <div className="flex justify-center py-2 bg-white px-1 sm:py-6 sm:px-6">
          <Pagination
            page={currentPage}
            total={finalData.total}
            pageSize={finalData.effectivePageSize}
            onChange={handlePageChange}
            groupSize={10}
            responsive={true}
            showEdge={true}
          />
        </div>

    </div>
  );
}
