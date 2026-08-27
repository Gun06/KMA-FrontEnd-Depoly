import {
  DEFAULT_EVENT_SETTING,
  type EventSettingSpec,
} from '@/types/eventSetting';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export async function fetchEventUseableUI(
  eventId: string
): Promise<EventSettingSpec> {
  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/useable-UI`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    return DEFAULT_EVENT_SETTING;
  }

  const data = (await response.json()) as Partial<EventSettingSpec>;

  return {
    groupRegistrationEnabled:
      typeof data.groupRegistrationEnabled === 'boolean'
        ? data.groupRegistrationEnabled
        : DEFAULT_EVENT_SETTING.groupRegistrationEnabled,
    individualLoginIdEnabled:
      typeof data.individualLoginIdEnabled === 'boolean'
        ? data.individualLoginIdEnabled
        : DEFAULT_EVENT_SETTING.individualLoginIdEnabled,
  };
}
