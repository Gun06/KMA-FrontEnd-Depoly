import type { PopupItem } from '@/components/main/Popup';
import popupImage01 from '@/assets/images/main/popup01.png';
import popupImage02 from '@/assets/images/main/popup02.jpg';
import popupImage03 from '@/assets/images/main/popup03.jpg';

// 샘플 팝업 데이터 생성 함수
export function createSamplePopupData(): PopupItem[] {
  return [
    {
      id: 1,
      url: 'https://example.com/event1',
      image: popupImage01.src,
      visible: true,
      device: 'all',
      startAt: new Date().toISOString().slice(0, 16), // 현재 시간부터
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 30일 후까지
    },
    {
      id: 2,
      url: 'https://example.com/event2',
      image: popupImage02.src,
      visible: true,
      device: 'pc',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 15일 후까지
    },
    {
      id: 3,
      url: 'https://example.com/event3',
      image: popupImage03.src,
      visible: true,
      device: 'all',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7일 후까지
    },
  ];
}

// 로컬스토리지에 샘플 데이터 저장
export function initializeSamplePopupData(): void {
  if (typeof window === 'undefined') return;
  
  // 기존 데이터가 있어도 새로운 이미지로 업데이트
  const sampleData = createSamplePopupData();
  localStorage.setItem('kma_main_popups_v1', JSON.stringify(sampleData));
}

// 로컬스토리지 초기화 (개발용)
export function clearPopupData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kma_main_popups_v1');
  localStorage.removeItem('kma_popup_dont_show_today');
}
