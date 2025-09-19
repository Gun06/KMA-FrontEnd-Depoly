// src/components/admin/Users/organization/orgColumns.tsx
import React from 'react';
import Link from 'next/link';
import type { Column } from '@/components/common/Table/BaseTable';
import type { OrganizationRow } from '@/data/users/organization';

const orgColumns: Column<OrganizationRow>[] = [
  { key: 'id', header: '번호', width: 80, align: 'center', className: 'whitespace-nowrap tabular-nums' },

  {
    key: 'org',
    header: '단체명',
    width: 220,
    align: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <Link
        href={`/admin/users/organization/${r.id}?tab=members`}
        className="block max-w-[240px] truncate hover:underline"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        data-allow-bubble="true"
      >
        {r.org}
      </Link>
    ),
  },

  {
    key: 'eventTitle',
    header: '대회명',
    width: 260,
    align: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <span
        className="block max-w-[260px] truncate"
        title={r.eventTitle || '-'}
      >
        {r.eventTitle || '-'}
      </span>
    ),
  },  

  { key: 'owner', header: '대표자명', width: 120, align: 'center', className: 'whitespace-nowrap' },

  {
    key: 'ownerId',
    header: '대표자 아이디',
    width: 140,
    align: 'center',
    className: 'whitespace-nowrap',
    render: (r) => <span className="block max-w-[140px] truncate mx-auto">{r.ownerId}</span>,
  },

  { key: 'createdAt', header: '등록일', width: 140, align: 'center', className: 'whitespace-nowrap tabular-nums' },

  { key: 'memberCount', header: '회원수', width: 120, align: 'center', className: 'whitespace-nowrap tabular-nums' },

  {
    key: 'list',
    header: '회원리스트',
    width: 140,
    align: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <Link
        href={`/admin/users/organization/${r.id}?tab=members`}
        className="text-[#2563EB] hover:underline"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        data-allow-bubble="true"
      >
        회원리스트 ›
      </Link>
    ),
  },
];

export default orgColumns;
