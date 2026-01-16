// app/admin/local-events/management/components/LocalEventTable.tsx
'use client';

import React from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';

import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import type { LocalEventRow } from '../api/types';

type PublicFilter = '' | '공개' | '테스트' | '비공개';

// 프리셋 값 → 도메인 값 매핑
const mapStatus = (v: string): RegStatus | '' =>
  v === 'ing'
    ? '접수중'
    : v === 'done'
      ? '접수마감'
      : v === 'none'
        ? '비접수'
        : '';

const mapPublic = (v: string): PublicFilter =>
  v === 'open' ? '공개' : v === 'test' ? '테스트' : v === 'closed' ? '비공개' : '';

type Props = {
  rows: LocalEventRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onYearChange?: (year: string) => void;
  onFilterStatusChange?: (status: RegStatus | '') => void;
  onFilterPublicChange?: (v: PublicFilter) => void;

  onClickRegister?: () => void;
  onTitleClick?: (row: LocalEventRow) => void;
  onResetFilters?: () => void;

  /** 모든 지역대회 데이터 (년도 필터용) */
  allEvents?: LocalEventRow[];

  /** 필터 초기값 (FilterBar에 전달) */
  filterInitialValues?: string[];
  /** 검색어 초기값 */
  searchInitialValue?: string;
  /** 필터가 적용되었는지 여부 (검색 결과 없음 vs 데이터 없음 구분) */
  hasActiveFilters?: boolean;
  /** 로딩 상태 */
  isLoading?: boolean;
};

export default function LocalEventTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onYearChange,
  onFilterStatusChange,
  onFilterPublicChange,
  onClickRegister,
  onTitleClick,
  onResetFilters,
  allEvents,
  filterInitialValues,
  searchInitialValue = '',
  hasActiveFilters = false,
  isLoading = false,
}: Props) {
  const columns: Column<LocalEventRow>[] = [
    { key: 'no', header: '번호', width: 80, align: 'center' },
    {
      key: 'date',
      header: '개최일',
      width: 120,
      align: 'center',
      className: 'text-[#6B7280] whitespace-nowrap',
    },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: r => (
        <span
          className="truncate hover:underline cursor-pointer"
          title={r.title}
          onClick={() => onTitleClick?.(r)}
        >
          {r.title}
        </span>
      ),
    },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 110,
      align: 'center',
      render: r => (
        <RegistrationStatusBadge status={r.applyStatus} size="smd" />
      ),
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 100,
      align: 'center',
      render: r => {
        if (r.isPublic === 'OPEN') {
          return <span className="text-[#1E5EFF]">공개</span>;
        } else if (r.isPublic === 'TEST') {
          return <span className="text-[#FFA500]">테스트</span>;
        } else {
          return <span className="text-[#D12D2D]">비공개</span>;
        }
      },
    },
  ];

  // 참가신청과 동일하게, 실제 존재하는 년도만 필터에 노출
  const availableYears = React.useMemo(() => {
    const source = allEvents || rows;
    const years = new Set<number>();

    source.forEach(row => {
      if (row.date) {
        const year = new Date(row.date).getFullYear();
        years.add(year);
      }
    });

    const currentYear = new Date().getFullYear();
    const yearList = Array.from(years)
      .filter(y => y <= currentYear + 1) // 올해 +1까지
      .sort((a, b) => b - a); // 내림차순

    return [
      { label: '전체', value: '' },
      ...yearList.map(y => ({ label: String(y), value: String(y) })),
    ];
  }, [allEvents, rows]);

  const presetBase = PRESETS['관리자 / 지역대회관리']?.props;

  // 프리셋의 '년도' 필드만 동적으로 교체
  const preset = React.useMemo(() => {
    if (!presetBase) return undefined;
    return {
      ...presetBase,
      fields: presetBase.fields?.map(field =>
        field.label === '년도'
          ? { ...field, options: availableYears }
          : field
      ),
    };
  }, [presetBase, availableYears]);

  // 버튼 순서: 검색 → 지역대회등록 → 초기화(쇼Reset)
  const RightControls = preset ? (
    <FilterBar
      {...preset}
      className="!gap-3" // 왼쪽 정렬
      initialValues={filterInitialValues}
      initialSearchValue={searchInitialValue}
      buttons={[
        { label: '검색', tone: 'dark' }, // 1) 검색
        { label: '지역대회등록', tone: 'primary', iconRight: true }, // 2) 지역대회등록
      ]}
      showReset={true} // 3) 초기화
      onFieldChange={(label, value) => {
        if (label === '년도') onYearChange?.(value);
        else if (label === '신청여부') onFilterStatusChange?.(mapStatus(value));
        else if (label === '공개여부') onFilterPublicChange?.(mapPublic(value));
      }}
      onSearch={q => onSearch?.(q)} // SearchBox 엔터 또는 '검색' 버튼(수정한 FilterBar)에서 호출
      onActionClick={label => {
        if (label === '지역대회등록') onClickRegister?.();
      }}
      onReset={() => onResetFilters?.()}
    />
  ) : null;

  // 빈 상태 처리
  if (rows.length === 0 && total === 0) {
    return (
      <section className="w-full flex flex-col">
        <h2 className="mb-3 text-xl font-semibold">지역대회 관리</h2>
        {RightControls && (
          <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex-1 min-w-[220px]">{null}</div>
            <div className="flex-1 min-w-[240px]">{null}</div>
            <div className="shrink-0">{RightControls}</div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          {hasActiveFilters ? (
            <>
              <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
              <div className="text-sm text-gray-400 mb-6">다른 검색 조건으로 다시 검색해주세요</div>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-lg mb-2">등록된 지역대회가 없습니다</div>
              <div className="text-sm text-gray-400 mb-6">첫 번째 지역대회를 등록해보세요</div>
              {onClickRegister && (
                <button
                  onClick={onClickRegister}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  지역대회 등록하기
                </button>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">로딩 중...</span>
          </div>
        </div>
      )}
      <AdminTable<LocalEventRow>
        title="지역대회 관리"
        columns={columns}
        rows={rows}
        rowKey={r => r.id}
        renderFilters={null}
        renderSearch={null}
        renderActions={RightControls} // 오른쪽 툴바 슬롯
        pagination={{
          page,
          pageSize,
          total,
          onChange: onPageChange,
          align: 'center',
        }}
        minWidth={1100}
      />
    </div>
  );
}

