import { request } from '@/hooks/useFetch';
import type {
  ClosingMarathonResponse,
  ClosingMarathonType,
} from '@/types/closingMarathon';
import { normalizeClosingMarathonResponse } from '@/types/closingMarathon';

const BASE = '/api/v1/closing-marathon';

function withTypeQuery(
  type: ClosingMarathonType,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams({ type, ...extra });
  return `${BASE}?${params.toString()}`;
}

export async function getClosingMarathonForAdmin(): Promise<ClosingMarathonResponse> {
  const raw = (await request<ClosingMarathonResponse>(
    'admin',
    BASE,
    'GET',
    undefined,
    true
  )) as ClosingMarathonResponse;

  return normalizeClosingMarathonResponse(raw);
}

/** 기한 임박 대회 수동 지정 (type 전환 포함) */
export async function patchClosingMarathonEvent(
  type: ClosingMarathonType,
  eventId: string
): Promise<void> {
  const trimmed = eventId.trim();
  if (!trimmed) {
    throw new Error('eventId is required');
  }

  await request<string>(
    'admin',
    withTypeQuery(type, { eventId: trimmed }),
    'PATCH',
    undefined,
    true
  );
}

/** 수동 지정 해제 → 자동 모드 (기본: 개최 임박) */
export async function deleteClosingMarathonEvent(): Promise<void> {
  await request<string>('admin', BASE, 'DELETE', undefined, true);
}
