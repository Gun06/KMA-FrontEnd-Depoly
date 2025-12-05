'use client';

import React, { ReactNode } from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, { type RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';

export type ApplicantListRow = {
  id: string;
  date: string;   // YYYY-MM-DD
  title: string;
  applyStatus: RegStatus;
  isPublic: boolean;
  url: string;
};

type PublicFilter = '' | '공개' | '비공개';

const mapStatus = (v: string): RegStatus | '' =>
  v === 'ing' ? '접수중' : v === 'done' ? '접수마감' : v === 'none' ? '비접수' : '';

const mapPublic = (v: string): PublicFilter =>
  v === 'open' ? '공개' : v === 'closed' ? '비공개' : '';

const mapYear = (v: string): string => (/^\d{4}$/.test(v) ? v : '');

const shorten = (s: string, max = 56) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

type Props = {
  rows: ApplicantListRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onFilterStatusChange?: (status: RegStatus | '') => void;
  onFilterPublicChange?: (v: PublicFilter) => void;
  onFilterYearChange?: (year: string) => void;

  onRowTitleClick?: (row: ApplicantListRow) => void;
  onResetFilters?: () => void;

  /** ✅ 프리셋을 교체해서 쓰고 싶을 때 (예: "관리자 / 대회_공지사항") */
  filterPresetKey?: keyof typeof PRESETS;
  /** ✅ 라벨/값을 부모에서 직접 매핑하고 싶을 때 */
  onPresetFieldChange?: (label: string, value: string) => void;

  /** ✅ 필터바 오른쪽에 붙일 임의 요소(예: 파란 CTA 버튼) */
  rightExtra?: ReactNode;
  
  /** ✅ 모든 대회 데이터 (년도 필터용) */
  allEvents?: ApplicantListRow[];
};

export default function ApplicantEventListTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onFilterStatusChange,
  onFilterPublicChange,
  onFilterYearChange,
  onRowTitleClick,
  onResetFilters,
  filterPresetKey,
  onPresetFieldChange,
  rightExtra,
  allEvents,
}: Props) {
  const columns: Column<ApplicantListRow>[] = [
    { key: 'id', header: '번호', width: 80, align: 'center' },
    {
      key: 'date',
      header: '대회날짜',
      width: 120,
      align: 'center',
      className: 'text-[#6B7280] whitespace-nowrap',
      render: (r) => `[${r.date.replaceAll('-', '.')}]`,
    },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <button
          type="button"
          className="truncate hover:underline cursor-pointer text-left"
          title={r.title}
          onClick={(e) => { e.stopPropagation(); onRowTitleClick?.(r); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRowTitleClick?.(r);
            }
          }}
        >
          {r.title}
        </button>
      ),
    },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 110,
      align: 'center',
      render: (r) => <RegistrationStatusBadge status={r.applyStatus} size="smd" />,
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 100,
      align: 'center',
      render: (r) =>
        r.isPublic ? (
          <span className="text-[#1E5EFF]">공개</span>
        ) : (
          <span className="text-[#D12D2D]">비공개</span>
        ),
    },
    {
      key: 'url',
      header: 'URL',
      width: 320,
      align: 'center',
      className: 'w-[320px]',
      render: (r) => (
        <div className="w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline"
            title={r.url}
          >
            {shorten(r.url)}
          </a>
        </div>
      ),
    },
  ];

  // 모든 대회 데이터에서 실제 있는 년도만 추출 (allEvents가 있으면 사용, 없으면 rows 사용)
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
      { label: "전체", value: "" },
      ...yearList.map(y => ({ label: String(y), value: String(y) }))
    ];
  }, [allEvents, rows]);

  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');
  const presetKey = (filterPresetKey ?? ('참가신청 / 기본' as keyof typeof PRESETS));
  const originalPreset = PRESETS[presetKey]?.props;
  
  // 년도 필드만 동적으로 수정
  const preset = React.useMemo(() => {
    if (!originalPreset) return undefined;
    return {
      ...originalPreset,
      fields: originalPreset.fields?.map(field => 
        field.label === '년도' 
          ? { ...field, options: availableYears }
          : field
      ),
    };
  }, [originalPreset, availableYears]);

  const RightControls = preset ? (
    <div className="flex items-center gap-2">
      <FilterBar
        {...preset}
        className="!gap-3"
        buttons={[{ label: '검색', tone: 'dark' }]}
        showReset
        onFieldChange={(label, value) => {
          // 1) 부모가 직접 받겠다 하면 그대로 전달
          if (onPresetFieldChange) {
            onPresetFieldChange(String(label), String(value));
            return;
          }
          // 2) 기본(대회관리) 매핑
          const L = norm(String(label));
          if (L === '신청상태') onFilterStatusChange?.(mapStatus(String(value)));
          else if (L === '공개여부') onFilterPublicChange?.(mapPublic(String(value)));
          else if (L === '년도') onFilterYearChange?.(mapYear(String(value)));
        }}
        onSearch={(q) => onSearch?.(q)}
        onReset={() => onResetFilters?.()}
      />
      {rightExtra /* ✅ 검색/초기화 바로 옆에 외부 요소 주입 */}
    </div>
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
          <div className="text-sm text-gray-400">대회를 등록하면 여기에 표시됩니다</div>
        </div>
      </div>
    );
  }

  return (
    <AdminTable<ApplicantListRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      renderFilters={null}
      renderSearch={null}
      renderActions={RightControls}
      pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
      minWidth={1200}
    />
  );
}
