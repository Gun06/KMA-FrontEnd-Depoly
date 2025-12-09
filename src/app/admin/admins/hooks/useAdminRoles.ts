import { useGetQuery } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../api';

export function useAdminRoles(enabled = false) {
  return useGetQuery(
    ['admin', 'roles'],
    ADMIN_API_ENDPOINTS.ROLES,
    'admin',
    { enabled },
    true
  );
}

