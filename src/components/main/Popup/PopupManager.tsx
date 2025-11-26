'use client';

import React from 'react';
import PopupDisplay from './PopupDisplay';
import { useMainPagePopups } from './hooks/useMainPagePopups';
import { transformApiResponseToPopupItem, getCurrentDeviceType, isInDateRange, isDeviceCompatible, shouldShowToday, setDontShowToday } from './utils/popupUtils';
import { PopupItem } from './types';

// PopupItem 타입을 re-export
export type { PopupItem };

/* ---------- Types ---------- */
// PopupItem 타입은 types/index.ts에서 import

/* ---------- Storage ---------- */
const DONT_SHOW_TODAY_KEY = 'kma_popup_dont_show_today';

/* ---------- Component ---------- */
export default function PopupManager() {
  const [popups, setPopups] = React.useState<PopupItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // 현재 디바이스 타입 감지
  const deviceType = getCurrentDeviceType();
  
  // API에서 팝업 데이터 가져오기
  const { data: apiPopups, isLoading, error } = useMainPagePopups(deviceType);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // API 데이터가 있으면 사용, 실패하면 팝업 표시 안함
  React.useEffect(() => {
    if (apiPopups && apiPopups.length > 0) {
      // API 데이터를 PopupItem 형식으로 변환
      const transformedPopups = transformApiResponseToPopupItem(apiPopups);
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
    <PopupDisplay
      popups={visiblePopups}
      onDontShowToday={setDontShowToday}
    />
  );
}
