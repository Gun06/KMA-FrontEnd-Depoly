import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClosingMarathonForAdmin,
  patchClosingMarathonEvent,
} from '@/components/admin/banners/closing-marathon/api/closingMarathon';

export const closingMarathonKeys = {
  all: ['closingMarathon'] as const,
  detail: () => [...closingMarathonKeys.all, 'detail'] as const,
};

export function useClosingMarathonForAdmin() {
  return useQuery({
    queryKey: closingMarathonKeys.detail(),
    queryFn: getClosingMarathonForAdmin,
    staleTime: 0,
  });
}

export function usePatchClosingMarathonEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId?: string | null) => patchClosingMarathonEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closingMarathonKeys.all });
    },
  });
}
