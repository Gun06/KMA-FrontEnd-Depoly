import { useApiMutation } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../api';

interface ResetPasswordRequest {
  password: string;
}

interface UseResetPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 본인 비밀번호 초기화 훅
 */
export function useResetPasswordSelf(options?: UseResetPasswordOptions) {
  return useApiMutation<string, ResetPasswordRequest>(
    ADMIN_API_ENDPOINTS.RESET_PASSWORD_SELF,
    'admin',
    'PATCH',
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

/**
 * 총관리자가 타 관리자 비밀번호 초기화 훅
 */
export function useResetPasswordOther(adminId: string, options?: UseResetPasswordOptions) {
  return useApiMutation<string, ResetPasswordRequest>(
    ADMIN_API_ENDPOINTS.RESET_PASSWORD_OTHER(adminId),
    'admin',
    'PATCH',
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

