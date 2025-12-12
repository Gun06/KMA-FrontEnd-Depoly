import { useGetQuery } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../api';
import type { DepartmentItem } from '../types';

export function useAdminDepartments(enabled = false) {
  return useGetQuery<DepartmentItem[]>(
    ['admin', 'departments'],
    ADMIN_API_ENDPOINTS.DEPARTMENTS,
    'admin',
    { enabled },
    true
  );
}

