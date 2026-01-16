// app/admin/local-events/[eventId]/edit/components/EditForm.tsx
'use client';

import React from 'react';
import LocalEventForm from '../../../components/LocalEventForm';
import type { LocalEventUpdatePayload } from '../api/types';
import { useLocalEventForm } from '@/app/admin/local-events/register/hooks/useLocalEventForm';

type Props = {
  onUpdate: (payload: LocalEventUpdatePayload) => Promise<void>;
  onBack?: () => void;
  prefill?: Parameters<typeof useLocalEventForm>[0] & {
    existingPromotionBanner?: string;
  };
};

export default function EditForm({
  onUpdate,
  onBack,
  prefill,
}: Props) {
  return (
    <LocalEventForm
      mode="edit"
      onSubmit={onUpdate}
      onBack={onBack}
      prefill={prefill}
    />
  );
}

