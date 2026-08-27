"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import GroupApplicationConfirmForm from "@/components/event/Registration/GroupApplicationConfirmForm";
import { useParams } from "next/navigation";
import { useGroupRegistrationGuard } from "../../apply/shared/hooks/useGroupRegistrationGuard";
import LoadingSpinner from "../../apply/shared/components/LoadingSpinner";

export default function GroupApplicationConfirmPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isBlocked } = useGroupRegistrationGuard(
    eventId,
    `/event/${eventId}/registration/confirm`
  );

  if (isBlocked) {
    return (
      <SubmenuLayout
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 조회",
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="페이지를 확인하는 중..." />
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 조회"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <GroupApplicationConfirmForm eventId={eventId} />
      </div>
    </SubmenuLayout>
  );
}
