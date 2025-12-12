import type { Column } from '@/components/common/Table/BaseTable';
import type { AdminItem } from '../types';

export const ADMIN_TABLE_COLUMNS: Column<AdminItem>[] = [
  {
    key: 'no',
    header: '번호',
    headerAlign: 'center',
    align: 'center',
    render: (row) => <div className="text-center text-gray-900">{row.no}</div>,
  },
  {
    key: 'account',
    header: '아이디',
    headerAlign: 'center',
    align: 'center',
    render: (row) => <div className="text-center text-gray-900">{row.account}</div>,
  },
  {
    key: 'name',
    header: '이름',
    headerAlign: 'center',
    align: 'center',
    render: (row) => <div className="text-center text-gray-900">{row.name}</div>,
  },
  {
    key: 'roleName',
    header: '권한',
    headerAlign: 'center',
    align: 'center',
    render: (row) => <div className="text-center text-gray-900">{row.roleName}</div>,
  },
  {
    key: 'deptName',
    header: '부서',
    headerAlign: 'center',
    align: 'center',
    render: (row) => <div className="text-center text-gray-900">{row.deptName || '-'}</div>,
  },
];

export const DEFAULT_PAGE_SIZE = 20;

