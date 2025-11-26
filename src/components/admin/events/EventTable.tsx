// src/components/admin/events/EventTable.tsx
'use client';

import React from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';

import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';

export type EventRow = {
  id: string; // 문자열 ID 일관 유지 (UUID/숫자문자열)
  no?: number;
  date: string; // YYYY-MM-DD
  title: string;
  titleEn?: string; // 🔹 상세 전용 영문명 (목록 테이블에서는 사용하지 않음)
  place: string;
  host: string;
  applyStatus: RegStatus; // '접수중' | '비접수' | '접수완료'
  isPublic: boolean;
};

type SortKey = 'no' | 'date' | 'title' | 'place' | 'host';
type PublicFilter = '' | '공개' | '비공개';

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
  v === 'open' ? '공개' : v === 'closed' ? '비공개' : '';

type Props = {
  rows: EventRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSortChange?: (key: SortKey) => void;
  onFilterStatusChange?: (status: RegStatus | '') => void;
  onFilterPublicChange?: (v: PublicFilter) => void;

  onClickRegister?: () => void;
  onTitleClick?: (row: EventRow) => void;
  onResetFilters?: () => void;
};

export default function EventTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onSortChange,
  onFilterStatusChange,
  onFilterPublicChange,
  onClickRegister,
  onTitleClick,
  onResetFilters,
}: Props) {
  const columns: Column<EventRow>[] = [
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
    { key: 'place', header: '개최지', width: 200, align: 'center' },
    { key: 'host', header: '주최', width: 140, align: 'center' },
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
      render: r =>
        r.isPublic ? (
          <span className="text-[#1E5EFF]">공개</span>
        ) : (
          <span className="text-[#D12D2D]">비공개</span>
        ),
    },
  ];

  const preset = PRESETS['관리자 / 대회관리']?.props;

  // 버튼 순서: 검색 → 대회등록 → 초기화(쇼Reset)
  const RightControls = preset ? (
    <FilterBar
      {...preset}
      className="ml-auto !gap-3" // 오른쪽 정렬
      buttons={[
        { label: '검색', tone: 'dark' }, // 1) 검색
        { label: '대회등록', tone: 'primary', iconRight: true }, // 2) 대회등록
      ]}
      showReset={true} // 3) 초기화
      onFieldChange={(label, value) => {
        if (label === '정렬 기준') onSortChange?.(value as SortKey);
        else if (label === '신청여부') onFilterStatusChange?.(mapStatus(value));
        else if (label === '공개여부') onFilterPublicChange?.(mapPublic(value));
      }}
      onSearch={q => onSearch?.(q)} // SearchBox 엔터 또는 '검색' 버튼(수정한 FilterBar)에서 호출
      onActionClick={label => {
        if (label === '대회등록') onClickRegister?.();
      }}
      onReset={() => onResetFilters?.()}
    />
  ) : null;

  return (
    <AdminTable<EventRow>
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
  );
}
