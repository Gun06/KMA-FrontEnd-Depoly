// app/admin/events/[eventId]/edit/Client.tsx
'use client';

import EditClient from './components/EditClient';
import type { UseCompetitionPrefill } from '@/app/admin/events/register/hooks/useCompetitionForm';
import type { EventRow } from '@/components/admin/events/EventTable';

export default function Client({
  eventId,
  prefillForm,
  prefillRow,
}: {
  eventId: string;
  prefillForm: UseCompetitionPrefill;
  prefillRow: EventRow;
}) {
  return (
    <EditClient
      eventId={eventId}
      prefillForm={prefillForm}
      prefillRow={prefillRow}
    />
  );
}
