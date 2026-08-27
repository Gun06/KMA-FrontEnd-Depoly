'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventUseableUI } from './useEventUseableUI';

export function useGroupRegistrationGuard(
  eventId: string,
  redirectTo: string
) {
  const router = useRouter();
  const { settings, isLoading } = useEventUseableUI(eventId);

  useEffect(() => {
    if (isLoading) return;
    if (!settings.groupRegistrationEnabled) {
      router.replace(redirectTo);
    }
  }, [isLoading, settings.groupRegistrationEnabled, router, redirectTo]);

  return {
    settings,
    isLoading,
    isBlocked: isLoading || !settings.groupRegistrationEnabled,
    groupRegistrationEnabled: settings.groupRegistrationEnabled,
  };
}
