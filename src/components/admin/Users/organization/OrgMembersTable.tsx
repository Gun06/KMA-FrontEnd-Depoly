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
    { key: 'id', header: '번호', width: 90, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    { key: 'name', header: '성명', width: 100, align: 'center' },
    { key: 'course', header: '코스', width: 170, align: 'center', className: 'whitespace-nowrap text-sm' },
    { key: 'gender', header: '성별', width: 70, align: 'center' },
    { key: 'birth', header: '생년월일', width: 120, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'eventName',
      header: '대회명',
      width: 250,
      align: 'center',
      className: 'break-words text-sm leading-tight py-2',
      render: (r) => (
        <div className="max-w-[250px] break-words whitespace-normal leading-tight">
          {r.eventName || '-'}
        </div>
      ),
    },
    {
      key: 'regDate',
      header: '신청일시',
      width: 130,
      align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => r.regDate || r.createdAt || '-',
    },
    {
      key: 'fee',
      header: '금액',
      width: 110,
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
      width: 110,
      align: 'center',
      className: 'whitespace-nowrap',
      render: (r) => {
        const text = (r.memo ?? '').trim();
        return text.length > 6 ? `${text.slice(0, 6)}…` : text || '-';
      },
    },
    {
      key: 'account',
      header: '입금자명',
      width: 130,
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
      width: 130,
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

  const Actions = preset ? (
    <FilterBar
      {...preset}
      className="ml-auto !gap-3"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        if (L === '검색필드') onSearchKeyChange?.(value as SearchKey);
        else if (L === '입금여부') onPaymentStatusChange?.(value as PaymentStatus);
      }}
      onSearch={(q) => onSearch?.(q)}
      onActionClick={(label) => {
        if (label === '뒤로가기') onClickBack?.();
      }}
      onReset={onResetFilters}
    />
  ) : null;

  return (
    <div className="space-y-4">
      {title ? <div className="text-[15px]">{title}</div> : null}
      <AdminTable<OrgMemberRow>
        columns={cols}
        rows={rows}
        rowKey={(r) => `${r.orgId}-${r.id}`}
        onRowClick={onRowClick}
        renderFilters={null}
        renderSearch={null}
        renderActions={Actions}
        pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
        minWidth={1160}
        allowTextSelection={true}
      />
    </div>
  );
}
