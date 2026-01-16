import { useQuery } from '@tanstack/react-query';
import { fetchScheduleEvents, fetchCalendarEvents } from '@/services/schedule';
import { ScheduleEvent, CalendarEvent } from '@/types/event';

export const useSchedule = (
  year: number, 
  month: number, 
  type: 'ALL' | 'KMA' | 'LOCAL' = 'ALL'
) => {
  return useQuery({
    queryKey: ['schedule', year, month, type],
    queryFn: () => fetchScheduleEvents(year, month, type),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!year && !!month,
  });
};

// API 응답을 평면화하여 ScheduleEvent[]로 변환하는 헬퍼 함수
export const flattenScheduleEvents = (data: { [key: string]: ScheduleEvent[] }): ScheduleEvent[] => {
  return Object.values(data).flat();
};

// eventType으로 필터링하는 헬퍼 함수
export const useCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarEvents(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!year && !!month,
  });
};

// eventType으로 필터링하는 헬퍼 함수
export const filterScheduleEventsByType = (events: ScheduleEvent[], eventType: 'KMA' | 'LOCAL' | 'ALL'): ScheduleEvent[] => {
  if (eventType === 'ALL') {
    return events;
  }
  return events.filter(event => event.eventType === eventType);
};

// API 응답을 평면화하여 CalendarEvent[]로 변환하는 헬퍼 함수
export const flattenCalendarEvents = (data: { [key: string]: CalendarEvent[] }): CalendarEvent[] => {
  return Object.values(data).flat();
};
