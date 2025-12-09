import { useGetQuery } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../api';

export function useAdminDepartments(enabled = false) {
  return useGetQuery(
    ['admin', 'departments'],
    ADMIN_API_ENDPOINTS.DEPARTMENTS,
    'admin',
    { enabled },
    true
  );
}

