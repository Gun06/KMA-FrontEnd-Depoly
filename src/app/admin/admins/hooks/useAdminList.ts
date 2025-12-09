import { useGetQuery } from '@/hooks/useFetch';
import type { AdminListResponse, AdminListParams } from '../types';
import { ADMIN_API_ENDPOINTS } from '../api';

export function useAdminList(params: AdminListParams = {}) {
  const { page = 1, size = 20 } = params;

  return useGetQuery<AdminListResponse>(
    ['admin', 'list', page, size],
    `${ADMIN_API_ENDPOINTS.LIST}?page=${page}&size=${size}`,
    'admin',
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
    true
  );
}

