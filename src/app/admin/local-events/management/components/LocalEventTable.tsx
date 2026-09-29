// app/admin/local-events/management/components/LocalEventTable.tsx
'use client';

import React from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge from '@/components/common/Badge/RegistrationStatusBadge';

import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import type { LocalEventRow } from '../api/types';

type PublicFilter = '' | '공개' | '테스트' | '비공개';

// 프리셋 값 → API eventStatus 매핑
const mapStatus = (
  v: string
): '' | 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED' | 'UPLOAD_APPLYING' =>
  v === 'ing'
    ? 'OPEN'
    : v === 'done'
      ? 'CLOSED'
      : v === 'final_closed'
        ? 'FINAL_CLOSED'
        : v === 'none'
          ? 'PENDING'
          : v === 'upload_applying'
            ? 'UPLOAD_APPLYING'
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
  onFilterStatusChange?: (
    status: '' | 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED' | 'UPLOAD_APPLYING'
  ) => void;
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
    { key: 'no', header: '번호', width: 64, align: 'center', className: 'text-gray-500' },
    {
      key: 'date',
      header: '개최일',
      width: 100,
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
          className="block max-w-[440px] truncate hover:underline cursor-pointer"
          title={r.title}
          onClick={() => onTitleClick?.(r)}
        >
          {r.title}
        </span>
      ),
    },
    {
      key: 'applicantCompany',
      header: '신청회사',
      width: 180,
      align: 'left',
      className: 'text-left text-[#374151]',
      render: r => {
        const v = r.applicantCompany?.trim();
        return (
          <span className="block max-w-[200px] truncate" title={v || undefined}>
            {v ? v : '—'}
          </span>
        );
      },
    },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 90,
      align: 'center',
      render: r => (
        <RegistrationStatusBadge status={r.applyStatus} size="dense" className="!w-[72px]" />
      ),
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 80,
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
      dense
      searchWidth={240}
      className="!items-center !gap-2 flex-wrap justify-end"
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

  const isEmpty = rows.length === 0 && total === 0;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white">
      {isLoading && !isEmpty && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">로딩 중...</span>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-[15px] font-semibold">지역대회 관리</h3>
      </div>
      <AdminTable<LocalEventRow>
        dense
        contentMinHeight={null}
        columns={columns}
        rows={rows}
        rowKey={r => r.id}
        renderFilters={
          <p className="shrink-0 text-sm text-gray-600">
            검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>개
          </p>
        }
        renderActions={RightControls}
        loadingMessage={isLoading && isEmpty ? '지역대회 목록을 불러오는 중...' : undefined}
        emptyMessage={
          hasActiveFilters
            ? '검색 결과가 없습니다.\n다른 검색 조건으로 다시 검색해주세요.'
            : '등록된 지역대회가 없습니다.\n지역대회를 등록하면 여기에 표시됩니다.'
        }
        pagination={{
          page,
          pageSize,
          total,
          onChange: onPageChange,
          bar: {
            totalTextFormatter: cnt => (
              <>
                총 <b>{cnt.toLocaleString()}</b>개 대회
              </>
            ),
          },
        }}
        minWidth={1000}
      />
    </div>
  );
}

