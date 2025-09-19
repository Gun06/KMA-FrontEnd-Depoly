"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import GroupApplicationConfirmForm from "@/components/event/Registration/GroupApplicationConfirmForm";

export default function GroupApplicationConfirmPage({ params }: { params: { eventId: string } }) {
  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 확인"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <GroupApplicationConfirmForm eventId={params.eventId} />
      </div>
    </SubmenuLayout>
  );
}
