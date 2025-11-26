import { ScheduleApiResponse, CalendarApiResponse } from '@/types/event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export const fetchScheduleEvents = async (year: number, month: number): Promise<ScheduleApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/main-page/block-list?year=${year}&month=${month}`, {
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
