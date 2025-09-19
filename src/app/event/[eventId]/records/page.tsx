"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import RecordInquiryForm from "@/components/event/Records/RecordInquiryForm";

export default function RecordsPage({ params }: { params: { eventId: string } }) {
  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "기록조회",
        subMenu: "개인 기록 조회"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <RecordInquiryForm />
      </div>
    </SubmenuLayout>
  );
}
