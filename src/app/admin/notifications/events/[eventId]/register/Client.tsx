"use client";

import { useParams } from "next/navigation";
import NotificationRegisterForm from "../../../components/NotificationRegisterForm";

export default function Client() {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <NotificationRegisterForm
      initialTargetType="event"
      initialEventId={eventId}
      hideTargetSelection={false}
      onSuccessRedirect={() => `/admin/notifications/events/${eventId}`}
    />
  );
}
