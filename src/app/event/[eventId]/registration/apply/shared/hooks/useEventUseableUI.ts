'use client';

import { useEffect, useState } from 'react';
import { fetchEventUseableUI } from '../api/useableUI';
import {
  DEFAULT_EVENT_SETTING,
  type EventSettingSpec,
} from '@/types/eventSetting';

export function useEventUseableUI(eventId: string) {
  const [settings, setSettings] = useState<EventSettingSpec>(
    DEFAULT_EVENT_SETTING
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEventUseableUI(eventId);
        if (!cancelled) {
          setSettings(data);
        }
      } catch {
        if (!cancelled) {
          setSettings(DEFAULT_EVENT_SETTING);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return { settings, isLoading };
}
