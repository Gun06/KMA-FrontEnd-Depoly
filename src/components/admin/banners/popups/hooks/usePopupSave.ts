import { useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import { POPUP_API_ENDPOINTS } from '../api';

interface UsePopupSaveOptions {
  eventId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePopupSave({ eventId, onSuccess, onError }: UsePopupSaveOptions = {}) {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    eventId ? POPUP_API_ENDPOINTS.EVENT_POPUP(eventId) : POPUP_API_ENDPOINTS.HOMEPAGE_POPUP,
    'admin',
    'POST',
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

