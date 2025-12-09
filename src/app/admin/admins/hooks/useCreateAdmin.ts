import { useApiMutation } from '@/hooks/useFetch';
import type { AdminFormData } from '../types';
import { ADMIN_API_ENDPOINTS } from '../api';

interface UseCreateAdminOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateAdmin(options?: UseCreateAdminOptions) {
  return useApiMutation<string, AdminFormData>(
    ADMIN_API_ENDPOINTS.CREATE,
    'admin',
    'POST',
    true,
    {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
}

