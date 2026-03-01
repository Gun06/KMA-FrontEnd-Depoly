import OwnedRegistrationEditClient from "./Client";

export default function OwnedRegistrationEditPage({ params }: { params: { eventId: string; registrationId: string } }) {
  return <OwnedRegistrationEditClient eventId={params.eventId} registrationId={params.registrationId} />;
}
