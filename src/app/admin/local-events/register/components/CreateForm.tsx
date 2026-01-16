// app/admin/local-events/register/components/CreateForm.tsx
'use client';

import React from 'react';
import LocalEventForm from '../../components/LocalEventForm';
import type { LocalEventCreatePayload } from '../api/types';
import { useLocalEventForm } from '../hooks/useLocalEventForm';

type Props = {
  onRegister: (payload: LocalEventCreatePayload) => Promise<void>;
  onBack?: () => void;
  prefill?: Parameters<typeof useLocalEventForm>[0];
};

export default function CreateForm({
  onRegister,
  onBack,
  prefill,
}: Props) {
  return (
    <LocalEventForm
      mode="create"
      onSubmit={onRegister}
      onBack={onBack}
      prefill={prefill}
    />
  );
}
