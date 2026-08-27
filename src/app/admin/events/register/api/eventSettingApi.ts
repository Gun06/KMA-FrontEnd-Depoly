'use client';

import { api } from '@/hooks/useFetch';
import type { EventSettingSpec } from '@/types/eventSetting';

export async function updateEventSetting(
  eventId: string,
  data: EventSettingSpec
): Promise<unknown> {
  return api.authPut<unknown>(
    'admin',
    `/api/v1/event/${eventId}/event-setting`,
    data
  );
}
