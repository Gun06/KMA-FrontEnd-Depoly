import {
  ScheduleApiResponse,
  CalendarApiResponse,
  type MainPageBlockListFilter,
} from '@/types/event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

/** 블록 일정 카드 썸네일: 광고 배너 URL이 있으면 우선 */
export function blockListDisplayImageSrc(item: {
  eventAdvertiseImgSrc?: string | null | undefined;
  eventImgSrc?: string | null | undefined;
}): string {
  const ad = item.eventAdvertiseImgSrc?.trim();
  if (ad) return ad;
  return item.eventImgSrc?.trim() ?? '';
}

export const fetchScheduleEvents = async (
  year: number,
  month: number,
  type: 'ALL' | 'KMA' | 'LOCAL' = 'ALL',
  filter: MainPageBlockListFilter = 'ALL'
): Promise<ScheduleApiResponse> => {
  try {
    const queryParams = new URLSearchParams({
      year: String(year),
      month: String(month),
      type: type,
      filter,
    });
    
    const response = await fetch(`${API_BASE_URL}/api/v1/public/main-page/block-list?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`대회일정 조회 실패: ${response.status} ${response.statusText}`);
    }

    const data: ScheduleApiResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchCalendarEvents = async (year: number, month: number): Promise<CalendarApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/main-page/calender-list?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`캘린더 일정 조회 실패: ${response.status} ${response.statusText}`);
    }

    const data: CalendarApiResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
