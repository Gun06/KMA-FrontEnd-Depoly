"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import GroupRecordInquiryForm from "@/components/event/Records/GroupRecordInquiryForm";

export default function GroupRecordsPage({ params }: { params: { eventId: string } }) {
  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "기록조회",
        subMenu: "단체 기록 조회"
      }}
    >
      <div className="container mx-auto px-4 py-8 relative">
        {/* 배경 블러 효과 */}
        <div className="blur-sm pointer-events-none">
          <GroupRecordInquiryForm />
        </div>
        
        {/* 준비중 메시지 */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-xl px-8 py-6 text-center">
            <p className="text-xl font-semibold text-gray-800">
              서비스 준비중입니다!
            </p>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
