// app/admin/events/[eventId]/Client.tsx
'use client';

import DetailClient from './components/DetailClient';

export default function Client({
  eventId,
}: {
  eventId: string;
}) {
  return <DetailClient eventId={eventId} />;
}
