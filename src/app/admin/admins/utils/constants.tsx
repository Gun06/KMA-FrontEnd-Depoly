import type { Column } from '@/components/common/Table/BaseTable';
import type { AdminItem } from '../types';

export const ADMIN_TABLE_COLUMNS: Column<AdminItem>[] = [
  {
    key: 'no',
    header: '번호',
    render: (row) => <div className="text-center">{row.no}</div>,
  },
  {
    key: 'account',
    header: '아이디',
    render: (row) => <div className="text-center">{row.account}</div>,
  },
  {
    key: 'name',
    header: '이름',
    render: (row) => <div className="text-center">{row.name}</div>,
  },
  {
    key: 'roleName',
    header: '권한',
    render: (row) => <div className="text-center">{row.roleName}</div>,
  },
  {
    key: 'deptName',
    header: '부서',
    render: (row) => <div className="text-center">{row.deptName || '-'}</div>,
  },
];

export const DEFAULT_PAGE_SIZE = 20;

