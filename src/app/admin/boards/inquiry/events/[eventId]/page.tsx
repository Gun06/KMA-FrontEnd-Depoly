// src/app/admin/boards/inquiry/events/[eventId]/page.tsx
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";
import { useEventList } from "@/hooks/useNotices";
import { InquiryToggleTabs } from "@/components/admin/boards/inquiry/InquiryToggleTabs";

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  
  // 이벤트 목록에서 현재 이벤트 정보 가져오기
  const { data: eventListData } = useEventList(1, 100);
  const currentEvent = (eventListData as { content?: { id: string; nameKr: string }[] })?.content?.find((e: { id: string }) => e.id === eventId);
  const eventTitle = currentEvent?.nameKr ?? `#${eventId}`;

  return (
    <InquiryListPage
      apiType="event"
      eventId={eventId}
      titleAddon={
        <div className="flex w-full min-w-0 flex-col items-start gap-2">
          <InquiryToggleTabs
            active="event"
            onSelect={(value) => {
              if (value === 'all') router.push('/admin/boards/inquiry/all');
              if (value === 'main') router.push('/admin/boards/inquiry/main');
            }}
          />
          <h3 className="w-full min-w-0 text-[16px] font-semibold">
            <span>
              선택대회 : <span className="text-[#1E5EFF]">{eventTitle}</span> 문의사항
            </span>
          </h3>
        </div>
      }
      linkForRow={(r) => r.__replyOf
        ? `/admin/boards/inquiry/events/${eventId}/${r.__replyOf}#answer`
        : `/admin/boards/inquiry/events/${eventId}/${r.id}`
      }
      onDelete={(_id) => {
        // TODO: API 연동 후 실제 삭제 로직 구현
      }}
    />
  );
}
