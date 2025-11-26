'use client';

import React from 'react';
import EventPopupDisplay from './EventPopupDisplay';
import { useEventPopups } from './hooks/useEventPopups';
import { transformEventApiResponseToPopupItem, getCurrentDeviceType, isInDateRange, isDeviceCompatible, shouldShowToday, setDontShowToday } from './utils/eventPopupUtils';
import { EventPopupItem } from './types';

/* ---------- Storage ---------- */
const DONT_SHOW_TODAY_KEY = 'kma_event_popup_dont_show_today';

interface EventPopupManagerProps {
  eventId: string;
}

/* ---------- Component ---------- */
export default function EventPopupManager({ eventId }: EventPopupManagerProps) {
  const [popups, setPopups] = React.useState<EventPopupItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // 현재 디바이스 타입 감지
  const deviceType = getCurrentDeviceType();
  
  // API에서 팝업 데이터 가져오기
  const { data: apiPopups, isLoading, error } = useEventPopups(eventId, deviceType);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // API 데이터가 있으면 사용, 실패하면 팝업 표시 안함
  React.useEffect(() => {
    if (apiPopups && apiPopups.length > 0) {
      // API 데이터를 EventPopupItem 형식으로 변환
      const transformedPopups = transformEventApiResponseToPopupItem(apiPopups);
      setPopups(transformedPopups);
    } else if (!isLoading && error) {
      // API 호출 실패 시 팝업 표시 안함
      setPopups([]);
    }
  }, [apiPopups, isLoading, error]);

  if (!mounted) return null;

  // 필터링: 공개 + 기간 + 디바이스 + 오늘 하루 보지 않음
  const now = Date.now();
  const isMobile = deviceType === 'MOBILE';
  const shouldShow = shouldShowToday();

  const visiblePopups = popups.filter((popup) => {
    if (!popup.visible) return false;
    if (!isInDateRange(now, popup.startAt, popup.endAt)) return false;
    if (!isDeviceCompatible(popup.device, isMobile)) return false;
    if (!popup.image) return false;
    return true;
  });

  if (visiblePopups.length === 0 || !shouldShow) return null;

  return (
    <EventPopupDisplay
      popups={visiblePopups}
      onDontShowToday={setDontShowToday}
    />
  );
}
