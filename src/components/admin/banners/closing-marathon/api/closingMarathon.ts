import { request } from '@/hooks/useFetch';
import type { ClosingMarathonResponse } from '@/types/closingMarathon';

const BASE = '/api/v1/closing-marathon';

export async function getClosingMarathonForAdmin(): Promise<ClosingMarathonResponse> {
  return (await request<ClosingMarathonResponse>(
    'admin',
    BASE,
    'GET',
    undefined,
    true
  )) as ClosingMarathonResponse;
}

/** eventId 지정. null/미전달 시 지정 해제(자동 모드) */
export async function patchClosingMarathonEvent(
  eventId?: string | null
): Promise<void> {
  const trimmed = eventId?.trim();
  const endpoint = trimmed
    ? `${BASE}?eventId=${encodeURIComponent(trimmed)}`
    : BASE;

  await request<string>(
    'admin',
    endpoint,
    'PATCH',
    undefined,
    true
  );
}
