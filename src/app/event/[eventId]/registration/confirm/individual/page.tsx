"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import IndividualApplicationConfirmForm from "@/components/event/Registration/IndividualApplicationConfirmForm";

export default function IndividualApplicationConfirmPage({ params }: { params: { eventId: string } }) {
  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "개인 신청 확인"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <IndividualApplicationConfirmForm eventId={params.eventId} />
      </div>
    </SubmenuLayout>
  );
}
