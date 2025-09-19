import Client from "./Client";

export default function Page({ params }: { params: { eventId: string } }) {
  return <Client eventId={params.eventId} />;
}
