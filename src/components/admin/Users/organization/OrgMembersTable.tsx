// components/admin/Users/organization/OrgMembersTable.tsx
'use client';

import React, { useMemo } from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import PaymentBadgeApplicants from '@/components/common/Badge/PaymentBadgeApplicants';
import type { OrgMemberRow } from '@/data/users/orgMembers';

type SearchKey = 'ALL' | 'NAME' | 'PAYMENTER_NAME' | 'ORGANIZATION' | 'MEMO' | 'DETAIL_MEMO' | 'NOTE' | 'MATCHING_LOG' | 'BIRTH' | 'PH_NUM';
type PaymentStatus = '' | 'UNPAID' | 'COMPLETED' | 'MUST_CHECK' | 'NEED_PARTITIAL_REFUND' | 'NEED_REFUND' | 'REFUNDED';

type Props = {
  rows: OrgMemberRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSearchKeyChange?: (k: SearchKey) => void;
  onPaymentStatusChange?: (s: PaymentStatus) => void;

  onClickExcel?: () => void;
  onResetFilters?: () => void;
  onClickBack?: () => void;

  /** ✅ 선택 제어(옵션) */
  selectedIds?: number[];
  onToggleSelectOne?: (id: number, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: number[]) => void;

  title?: React.ReactNode;
  onRowClick?: (row: OrgMemberRow) => void;
};

export default function OrgMembersTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onSearchKeyChange,
  onPaymentStatusChange,
  onClickExcel,
  onResetFilters,
  onClickBack,
  selectedIds = [],
  onToggleSelectOne,
  onToggleSelectAll,
  title,
  onRowClick,
}: Props) {
  // 구성원 화면 기본 컬럼 (신청자관리 스타일)
  const baseCols: Column<OrgMemberRow>[] = [
    { key: 'id', header: '번호', width: 64, align: 'center', className: 'whitespace-nowrap tabular-nums text-gray-500' },
    { key: 'name', header: '성명', width: 90, align: 'center' },
    { key: 'course', header: '코스', width: 150, align: 'center', className: 'whitespace-nowrap' },
    { key: 'gender', header: '성별', width: 56, align: 'center' },
    { key: 'birth', header: '생년월일', width: 100, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'eventName',
      header: '대회명',
      width: 220,
      align: 'center',
      render: (r) => (
        <span className="mx-auto block max-w-[240px] truncate" title={r.eventName || undefined}>
          {r.eventName || '-'}
        </span>
      ),
    },
    {
      key: 'regDate',
      header: '신청일시',
      width: 110,
      align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => r.regDate || r.createdAt || '-',
    },
    {
      key: 'fee',
      header: '금액',
      width: 96,
      align: 'right',
      className: 'whitespace-nowrap tabular-nums pr-4',
      render: (r) =>
        typeof r.fee === 'number' && !Number.isNaN(r.fee)
          ? `${r.fee.toLocaleString()}원`
          : '-',
    },
    {
      key: 'memo',
      header: '메모',
      width: 160,
      align: 'center',
      render: (r) => {
        const text = (r.memo ?? '').trim();
        return (
          <span className="mx-auto block max-w-[180px] truncate" title={text || undefined}>
            {text || '-'}
          </span>
        );
      },
    },
    {
      key: 'account',
      header: '입금자명',
      width: 110,
      align: 'center',
      className: 'whitespace-nowrap',
      render: (r) => {
        const display = typeof r.account === 'string' ? r.account.trim() : '';
        return display || '-';
      },
    },
    {
      key: 'payStatus',
      header: '입금여부',
      width: 100,
      align: 'center',
      className: 'whitespace-nowrap',
      render: (r) => <PaymentBadgeApplicants payStatus={r.payStatus} paid={r.paid} />,
    },
  ];

  /** 선택 칼럼 제거 - 기본 컬럼만 사용 */
  const cols: Column<OrgMemberRow>[] = useMemo(
    () => baseCols,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  // 필터 프리셋
  const preset = PRESETS['관리자 / 단체 구성원']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  // 뒤로가기 버튼 제거를 위해 buttons 오버라이드
  const presetWithoutBackButton = preset
    ? {
        ...preset,
        buttons: preset.buttons?.filter((btn) => btn.label !== '뒤로가기') || [],
      }
    : undefined;

  const Actions = presetWithoutBackButton ? (
    <FilterBar
      {...presetWithoutBackButton}
      dense
      searchWidth={240}
      className="!items-center !gap-2 flex-wrap justify-end"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        if (L === '검색필드') onSearchKeyChange?.(value as SearchKey);
        else if (L === '입금여부') onPaymentStatusChange?.(value as PaymentStatus);
      }}
      onSearch={(q) => onSearch?.(q)}
      onReset={onResetFilters}
    />
  ) : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {title ? (
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        </div>
      ) : null}
      <AdminTable<OrgMemberRow>
        dense
        contentMinHeight={null}
        columns={cols}
        rows={rows}
        rowKey={(r) => `${r.orgId}-${r.id}`}
        onRowClick={onRowClick}
        renderFilters={
          <p className="shrink-0 text-sm text-gray-600">
            검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>명
          </p>
        }
        renderActions={Actions}
        emptyMessage="단체 구성원이 없습니다."
        pagination={{
          page,
          pageSize,
          total,
          onChange: onPageChange,
          bar: { totalTextFormatter: (t) => <>총 <b>{t.toLocaleString()}</b>명</> },
        }}
        minWidth={1150}
        allowTextSelection={true}
      />
    </div>
  );
}
