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
    key: 'edit',
    header: '수정',
    headerAlign: 'center',
    align: 'center',
    render: (row) => (
      <div className="text-center">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = `/admin/admins/${row.id}/edit`;
            }
          }}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        >
          수정
        </button>
      </div>
    ),
  },
  // 부서 컬럼 제거됨
];

export const DEFAULT_PAGE_SIZE = 20;

