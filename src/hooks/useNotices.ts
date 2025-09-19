import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotices, 
  fetchEventNotices, 
  fetchNoticeById, 
  fetchEventNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  type NoticeListResponse,
  type NoticeFilters 
} from '@/services/notice';
import type { NoticeItem } from '@/components/common/Table/types';

// Query Keys
export const noticeQueryKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeQueryKeys.all, 'list'] as const,
  list: (filters: NoticeFilters) => [...noticeQueryKeys.lists(), filters] as const,
  details: () => [...noticeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...noticeQueryKeys.details(), id] as const,
  
  // 대회별 공지사항
  eventAll: (eventId: string) => ['event-notices', eventId] as const,
  eventLists: (eventId: string) => [...noticeQueryKeys.eventAll(eventId), 'list'] as const,
  eventList: (eventId: string, filters: Omit<NoticeFilters, 'eventId'>) => 
    [...noticeQueryKeys.eventLists(eventId), filters] as const,
  eventDetails: (eventId: string) => [...noticeQueryKeys.eventAll(eventId), 'detail'] as const,
  eventDetail: (eventId: string, id: number) => 
    [...noticeQueryKeys.eventDetails(eventId), id] as const,
};

/**
 * 메인 공지사항 목록을 가져오는 훅
 */
export function useNotices(filters: NoticeFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: noticeQueryKeys.list(filters),
    queryFn: () => fetchNotices(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
  });
}

/**
 * 대회별 공지사항 목록을 가져오는 훅
 */
export function useEventNotices(
  eventId: string, 
  filters: Omit<NoticeFilters, 'eventId'> = {}, 
  enabled: boolean = true
) {
  return useQuery({
    queryKey: noticeQueryKeys.eventList(eventId, filters),
    queryFn: () => fetchEventNotices(eventId, filters),
    enabled: enabled && !!eventId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 공지사항 상세 정보를 가져오는 훅
 */
export function useNotice(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: noticeQueryKeys.detail(id),
    queryFn: () => fetchNoticeById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 대회별 공지사항 상세 정보를 가져오는 훅
 */
export function useEventNotice(eventId: string, id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: noticeQueryKeys.eventDetail(eventId, id),
    queryFn: () => fetchEventNoticeById(eventId, id),
    enabled: enabled && !!eventId && !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 공지사항 생성 mutation 훅
 */
export function useCreateNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      // 공지사항 목록 쿼리들을 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.lists() });
    },
  });
}

/**
 * 공지사항 수정 mutation 훅
 */
export function useUpdateNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NoticeItem> }) => 
      updateNotice(id, data),
    onSuccess: (_, { id }) => {
      // 해당 공지사항 상세 정보와 목록을 무효화
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.lists() });
    },
  });
}

/**
 * 공지사항 삭제 mutation 훅
 */
export function useDeleteNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: (_, id) => {
      // 해당 공지사항 상세 정보를 제거하고 목록을 무효화
      queryClient.removeQueries({ queryKey: noticeQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.lists() });
    },
  });
}

/**
 * 공지사항 목록 프리페치 (성능 최적화용)
 */
export function usePrefetchNotices() {
  const queryClient = useQueryClient();
  
  return (filters: NoticeFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: noticeQueryKeys.list(filters),
      queryFn: () => fetchNotices(filters),
      staleTime: 5 * 60 * 1000, // 5분
    });
  };
}

/**
 * 대회별 공지사항 목록 프리페치
 */
export function usePrefetchEventNotices() {
  const queryClient = useQueryClient();
  
  return (eventId: string, filters: Omit<NoticeFilters, 'eventId'> = {}) => {
    queryClient.prefetchQuery({
      queryKey: noticeQueryKeys.eventList(eventId, filters),
      queryFn: () => fetchEventNotices(eventId, filters),
      staleTime: 5 * 60 * 1000, // 5분
    });
  };
}
