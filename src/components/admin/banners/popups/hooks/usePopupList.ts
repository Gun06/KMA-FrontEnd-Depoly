import { useGetQuery } from '@/hooks/useFetch';
import { useMounted } from '../utils/helpers';
import { POPUP_API_ENDPOINTS } from '../api';

export function usePopupList(eventId?: string) {
  const mounted = useMounted();
  
  return useGetQuery(
    eventId ? ['eventPopups', eventId] : ['homepagePopups'],
    eventId ? POPUP_API_ENDPOINTS.EVENT_POPUP(eventId) : POPUP_API_ENDPOINTS.HOMEPAGE_POPUP,
    'admin',
    { enabled: mounted },
    true // withAuth = true
  );
}

