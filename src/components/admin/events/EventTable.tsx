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
  isPublic: 'OPEN' | 'TEST' | 'CLOSE' | boolean; // boolean은 레거시 지원
};

type PublicFilter = '' | '공개' | '테스트' | '비공개';

// 프리셋 값 → 도메인 값 매핑 (프리셋 value와 한글 라벨 모두 지원)
const mapStatus = (v: string): RegStatus | '' => {
  if (v === '접수중' || v === 'ing') return '접수중';
  if (v === '접수마감' || v === 'done') return '접수마감';
  if (v === '비접수' || v === 'none') return '비접수';
  if (v === '최종마감' || v === 'final_closed') return '최종마감';
  return '';
};

// 프리셋 value(open/closed/test) 및 한글 라벨 모두 지원 (VisibleStatus: OPEN, CLOSE, TEST)
const mapPublic = (v: string): PublicFilter => {
  if (v === '공개' || v === 'open') return '공개';
  if (v === '테스트' || v === 'test') return '테스트';
  if (v === '비공개' || v === 'closed') return '비공개';
  return '';
};

type Props = {
  rows: EventRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onYearChange?: (year: string) => void;
  onFilterStatusChange?: (status: RegStatus | '') => void;
  onFilterPublicChange?: (v: PublicFilter) => void;

  onClickRegister?: () => void;
  onTitleClick?: (row: EventRow) => void;
  onResetFilters?: () => void;

  /** 모든 대회 데이터 (년도 필터용) */
  allEvents?: EventRow[];
};

export default function EventTable({
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
      render: r => {
        // boolean 레거시 처리
        if (typeof r.isPublic === 'boolean') {
          return r.isPublic ? (
          <span className="text-[#1E5EFF]">공개</span>
        ) : (
          <span className="text-[#D12D2D]">비공개</span>
          );
        }
        // enum 처리
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

  const presetBase = PRESETS['관리자 / 대회관리']?.props;

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

  // BoardEventList와 동일하게 norm 함수 사용
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  // 버튼 순서: 검색 → 대회등록 → 초기화(쇼Reset)
  const RightControls = preset ? (
    <FilterBar
      {...preset}
      className="!gap-3" // 왼쪽 정렬
      buttons={[
        { label: '검색', tone: 'dark' }, // 1) 검색
        { label: '대회등록', tone: 'primary', iconRight: true }, // 2) 대회등록
      ]}
      showReset={true} // 3) 초기화
      onFieldChange={(label, value) => {
        const L = norm(String(label));
        if (L === '년도') onYearChange?.(value);
        else if (L === '신청여부') onFilterStatusChange?.(mapStatus(value));
        else if (L === '공개여부') onFilterPublicChange?.(mapPublic(value));
      }}
      onSearch={q => onSearch?.(q)} // SearchBox 엔터 또는 '검색' 버튼(수정한 FilterBar)에서 호출
      onActionClick={label => {
        if (label === '대회등록') onClickRegister?.();
      }}
      onReset={() => onResetFilters?.()}
    />
  ) : null;

  // 빈 상태 처리
  if (rows.length === 0 && total === 0) {
    return (
      <div className="w-full">
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="shrink-0">{RightControls}</div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">등록된 대회가 없습니다</div>
          <div className="text-sm text-gray-400 mb-6">첫 번째 대회를 등록해보세요</div>
          {onClickRegister && (
            <button
              onClick={onClickRegister}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              대회 등록하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AdminTable<EventRow>
      title="대회 관리"
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
