import { useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import { POPUP_API_ENDPOINTS } from '../api';

interface UsePopupUpdateOptions {
  id: string;
  eventId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePopupUpdate({ id, eventId, onSuccess, onError }: UsePopupUpdateOptions) {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    POPUP_API_ENDPOINTS.POPUP_UPDATE(id),
    'admin',
    'PATCH',
    true,
    {
      onSuccess: () => {
        const queryKey = eventId ? ['eventPopups', eventId] : ['homepagePopups'];
        queryClient.invalidateQueries({ queryKey });
        onSuccess?.();
      },
      onError: (error: Error) => {
        onError?.(error);
      }
    }
  );
}

