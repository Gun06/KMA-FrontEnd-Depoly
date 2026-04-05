import type { LocalEventCreateApiResponse } from '../types/localEvent';

export function parseCreatedLocalEventId(data: unknown): string {
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data && typeof data === 'object') {
    const o = data as LocalEventCreateApiResponse & { id?: string };
    if (typeof o.id === 'string' && o.id) return o.id;
    const r = o.result;
    if (r && typeof r === 'object' && typeof r.id === 'string' && r.id) return r.id;
  }
  throw new Error('응답에서 대회 ID를 찾을 수 없습니다.');
}
