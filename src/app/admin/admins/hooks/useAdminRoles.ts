import { useGetQuery } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../api';
import type { RoleItem } from '../types';

export function useAdminRoles(enabled = false) {
  return useGetQuery<RoleItem[]>(
    ['admin', 'roles'],
    ADMIN_API_ENDPOINTS.ROLES,
    'admin',
    { enabled },
    true
  );
}

