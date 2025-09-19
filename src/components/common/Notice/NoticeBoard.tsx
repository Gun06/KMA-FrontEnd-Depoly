'use client';

import { useState, useMemo } from 'react';
import NoticeTable from '@/components/common/Table/NoticeTable';
import Pagination from '@/components/common/Pagination/Pagination';
import PaginationBar from '@/components/common/Pagination/PaginationBar';
import FilterBar from '@/components/common/filters/FilterBar';
import { ChevronDown } from 'lucide-react';
import { useNotices, useEventNotices } from '@/hooks/useNotices';
import type { NoticeItem } from '@/components/common/Table/types';

const CATEGORY_OPTIONS = [
  { value: '', label: '전체' },
  { value: '공지', label: '공지' },
  { value: '이벤트', label: '이벤트' },
  { value: '대회', label: '대회' },
  { value: '문의', label: '문의' },
  { value: '답변', label: '답변' },
];

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
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    apiFilters,
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
  const finalData = useMemo(() => {
    if (useApi) {
      return {
        rows: apiData?.notices || [],
        total: apiData?.total || 0,
      };
    } else {
      const total = filteredStaticData.length;
      const start = (currentPage - 1) * pageSize;
      const rows = filteredStaticData.slice(start, start + pageSize);
      return { rows, total };
    }
  }, [useApi, apiData, filteredStaticData, currentPage, pageSize]);

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
      {/* 검색 및 필터 */}
      {showSearch && (
        <div className="px-1 py-2 bg-white sm:px-6 sm:py-4">
        {/* 모바일용 커스텀 필터 */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* 커스텀 드롭다운 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-32 h-8 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
            >
              <span className="text-[15px] leading-[26px] text-[#1E2124]">
                {CATEGORY_OPTIONS.find(opt => opt.value === selectedCategory)?.label || '전체'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#33363D] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                {/* 백드롭 */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                {/* 드롭다운 메뉴 */}
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#CDD1D5] rounded-md shadow-lg z-20 py-1">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleFieldChange('카테고리', option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedCategory === option.value ? 'bg-[#EEF2F7]' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-[5px] border border-[#898989] px-3 py-2 flex items-center">
              <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="text-sm font-semibold tracking-[-0.08px] outline-none w-full"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-3 h-8 bg-[#256EF4] text-white text-sm font-medium rounded-[5px] hover:bg-[#1E56C7] focus:outline-none whitespace-nowrap"
            >
              검색
            </button>
          </div>
        </div>

        {/* 데스크톱용 FilterBar */}
        <div className="hidden sm:block">
          <FilterBar
            fields={[
              {
                label: '카테고리',
                options: CATEGORY_OPTIONS,
              }
            ]}
            searchPlaceholder="검색어를 입력해주세요"
            buttons={[
              {
                label: '검색',
                tone: 'primary',
              }
            ]}
            onFieldChange={handleFieldChange}
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-hidden sm:px-6">
                  <NoticeTable
            data={finalData.rows}
            onRowClick={onRowClick}
            pinLimit={pinLimit}
            numberDesc={numberDesc}
            showPinnedBadgeInNo={showPinnedBadgeInNo}
            pinnedClickable={pinnedClickable}
          />
        </div>

        {/* 페이지네이션 바 */}
        <PaginationBar
          page={currentPage}
          total={finalData.total}
          pageSize={pageSize}
          onChange={handlePageChange}
          showTotalText={true}
          showPageIndicator={true}
          className="bg-white px-1 sm:px-6"
        />

        {/* 페이지네이션 */}
        <div className="flex justify-center py-2 bg-white px-1 sm:py-6 sm:px-6">
          <Pagination
            page={currentPage}
            total={finalData.total}
            pageSize={pageSize}
            onChange={handlePageChange}
            groupSize={10}
            responsive={true}
            showEdge={true}
          />
        </div>
    </div>
  );
}
