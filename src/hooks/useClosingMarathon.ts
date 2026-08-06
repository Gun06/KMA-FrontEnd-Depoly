import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClosingMarathonForAdmin,
  patchClosingMarathonEvent,
  deleteClosingMarathonEvent,
} from '@/components/admin/banners/closing-marathon/api/closingMarathon';
import type { ClosingMarathonType } from '@/types/closingMarathon';

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
    mutationFn: ({
      type,
      eventId,
    }: {
      type: ClosingMarathonType;
      eventId: string;
    }) => patchClosingMarathonEvent(type, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closingMarathonKeys.all });
    },
  });
}

export function useDeleteClosingMarathonEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteClosingMarathonEvent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closingMarathonKeys.all });
    },
  });
}
