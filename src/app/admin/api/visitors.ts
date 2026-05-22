import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { useGetQuery } from '@/hooks/useFetch';
import type { VisitorTrendItem } from '@/types/visitor';

export interface VisitorTrendParams {
  eventId: string;
  startDate: string;
  endDate: string;
}

function buildTrendEndpoint({ eventId, startDate, endDate }: VisitorTrendParams) {
  const qs = new URLSearchParams({
    eventId,
    startDate,
    endDate,
  });
  return `/api/v1/dashboard/visitors/trend?${qs.toString()}`;
}

/** API 응답 필드명 정규화 (date + count) */
export function normalizeVisitorTrend(data: unknown): VisitorTrendItem[] {
  if (!data) return [];

  const list = Array.isArray(data)
    ? data
    : typeof data === 'object' && data !== null
      ? ((data as Record<string, unknown>).content ??
          (data as Record<string, unknown>).data ??
          (data as Record<string, unknown>).items ??
          [])
      : [];

  if (!Array.isArray(list)) return [];

  return list
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const date =
        (typeof r.date === 'string' && r.date) ||
        (typeof r.visitDate === 'string' && r.visitDate) ||
        (typeof r.countedAt === 'string' && r.countedAt) ||
        '';
      const rawCount =
        r.count ?? r.visitorCount ?? r.visitCount ?? r.dailyCount ?? 0;
      const count = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 0;
      if (!date) return null;
      return { date: date.slice(0, 10), count };
    })
    .filter((item): item is VisitorTrendItem => item !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** API에 없는 날짜는 count 0으로 채워 기간 전체를 표시 */
export function fillVisitorTrendRange(
  startDate: string,
  endDate: string,
  items: VisitorTrendItem[]
): VisitorTrendItem[] {
  if (!startDate || !endDate || startDate > endDate) return items;

  let days: Date[];
  try {
    days = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });
  } catch {
    return items;
  }

  const countByDate = new Map(items.map((item) => [item.date, item.count]));

  return days.map((day) => {
    const date = format(day, 'yyyy-MM-dd');
    return { date, count: countByDate.get(date) ?? 0 };
  });
}

export function useVisitorTrend(params: VisitorTrendParams | null) {
  const endpoint = params ? buildTrendEndpoint(params) : '';

  const query = useGetQuery<unknown>(
    ['admin', 'visitors', 'trend', params?.eventId, params?.startDate, params?.endDate],
    endpoint,
    'admin',
    {
      enabled: Boolean(params?.startDate && params?.endDate && params?.eventId),
      staleTime: 60 * 1000,
    },
    true
  );

  return {
    ...query,
    data: normalizeVisitorTrend(query.data),
  };
}
