import { useGetQuery } from '@/hooks/useFetch';
import type { PopupItem } from '@/types/popup';
import { POPUP_API_ENDPOINTS } from '../api';

/**
 * 팝업 수정 폼에서 사용하는 팝업 데이터 조회 훅
 */
export function usePopupEdit(id: string, eventId?: string) {
  const { data: popupListData, isLoading } = useGetQuery(
    eventId ? ['eventPopups', eventId] : ['homepagePopups'],
    eventId ? POPUP_API_ENDPOINTS.EVENT_POPUP(eventId) : POPUP_API_ENDPOINTS.HOMEPAGE_POPUP,
    'admin'
  );

  const popupData = popupListData && Array.isArray(popupListData) 
    ? popupListData.find((popup: PopupItem) => popup.id === id)
    : null;

  return {
    popupData,
    isLoading
  };
}

