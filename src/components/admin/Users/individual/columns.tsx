// src/app/admin/users/individual/Columns.tsx
import React from 'react';
import Link from 'next/link';
import type { Column } from '@/components/common/Table/BaseTable';
import type { IndividualUserRow } from '@/data/users/individual';
import MemberBadge from '@/components/common/Badge/MemberBadge';

export type SelectColumnHooks = {
  headCheckbox?: React.ReactNode;
  rowCheckbox?: (row: IndividualUserRow) => React.ReactNode;
};

export type ApplicationsOptions = {
  applicationsHref?: (row: IndividualUserRow) => string;
  onOpenApplications?: (row: IndividualUserRow) => void;
  makeNameClickable?: boolean;
  addActionColumn?: boolean; // ✅ 기본 false
};

export function Columns(
  hooks?: SelectColumnHooks,
  opts?: ApplicationsOptions
): Column<IndividualUserRow>[] {
  const cols: Column<IndividualUserRow>[] = [];

  // ✅ 선택 체크박스 (52)
  if (hooks?.headCheckbox && hooks?.rowCheckbox) {
    cols.push({
      key: '__sel',
      header: <div className="inline-flex w-full items-center justify-center" data-allow-bubble="true">
        {hooks.headCheckbox}
      </div>,
      width: 52,
      align: 'center',
      headerAlign: 'center',
      render: (r) => hooks.rowCheckbox!(r),
    });
  }

  const fmtBirth = (s?: string) => (s ? s.replaceAll('-', '.') : '-');

  // ✅ 1300 안에 들어오도록 총합 슬림화 (선택 컬럼 포함해도 ~1,258px + 여유)
  cols.push(
    { key: 'id',        header: '번호',     width: 70,  align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'isMember',  header: '회원여부', width: 96,  align: 'center', headerAlign: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => <MemberBadge isMember={r.isMember} />,
    },
    { key: 'userId',    header: '아이디',   width: 110, align: 'center' },
    {
      key: 'name',
      header: '이름',
      width: 100,
      align: 'center',
      render: (r) => {
        if (!opts?.makeNameClickable) return r.name;
    
        if (opts.applicationsHref) {
          const href = opts.applicationsHref(r);
          return (
            <Link
              href={href}
              className="text-primary no-underline hover:underline hover:opacity-80"
            >
              {r.name}
            </Link>
          );
        }
    
        if (opts.onOpenApplications) {
          return (
            <button
              type="button"
              onClick={() => opts.onOpenApplications!(r)}
              className="text-primary no-underline hover:underline hover:opacity-80"
            >
              {r.name}
            </button>
          );
        }
    
        return r.name;
      }    
    },
    {
      key: 'maskedPw',  header: '비밀번호', width: 96,  align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => (r.maskedPw.length > 8 ? r.maskedPw.slice(0, 8) + '...' : r.maskedPw),
    },
    {
      key: 'birth',     header: '생년월일', width: 110, align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => fmtBirth(r.birth),
    },
    { key: 'phone',     header: '휴대전화', width: 120, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'address',   header: '주소',     width: 280, align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => <span className="block max-w-[900px] truncate mx-auto">{r.address}</span>,
    },
    { key: 'createdAt', header: '등록일',   width: 100, align: 'center', className: 'whitespace-nowrap tabular-nums' },
  );

  if (opts?.addActionColumn) {
    cols.push({
      key: 'list',
      header: '신청',
      width: 88,
      align: 'center',
      className: 'whitespace-nowrap',
      render: (r) => (
        <Link
          href={opts?.applicationsHref ? opts.applicationsHref(r) : `/admin/users/individual/${r.id}/events`}
          className="text-[#2563EB] hover:underline"
          onClick={(e) => e.stopPropagation()}      // ✅ 행 onClick 방지
          onMouseDown={(e) => e.stopPropagation()}  // ✅ 드래그/포커스 버블도 방지
          data-allow-bubble="true"
        >
          보기 &rsaquo;
        </Link>
      ),
    });
  }

  return cols;
}

export default Columns;
