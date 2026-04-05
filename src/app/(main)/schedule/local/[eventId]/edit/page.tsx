import EditClient from './EditClient';

export default function LocalEventEditPage({ params }: { params: { eventId: string } }) {
  return <EditClient eventId={params.eventId} />;
}
