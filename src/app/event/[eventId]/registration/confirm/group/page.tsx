"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import GroupApplicationConfirmForm from "@/components/event/Registration/GroupApplicationConfirmForm";
import { useParams } from "next/navigation";

export default function GroupApplicationConfirmPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 확인"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <GroupApplicationConfirmForm eventId={eventId} />
      </div>
    </SubmenuLayout>
  );
}
