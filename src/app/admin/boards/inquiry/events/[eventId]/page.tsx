// src/app/admin/boards/inquiry/events/[eventId]/page.tsx
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";
import { getEventInquiries, deleteEventInquiry } from "@/data/inquiry/event";
import { getEventById } from "@/data/events";

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const event = getEventById(Number(eventId));
  const eventTitle = event?.title ?? `#${eventId}`;

  return (
    <InquiryListPage
      title={<span>선택대회 : <span className="text-[#1E5EFF]">{eventTitle}</span> 문의사항</span>}
      headerButton={{ label: "전마협 메인 문의사항 관리하기 >",  size: "sm",
      tone: "primary", onClick: () => router.push("/admin/boards/inquiry/main") }}
      provider={(page, size, opt) => getEventInquiries(eventId, page, size, opt)}
      linkForRow={(r) => r.__replyOf
        ? `/admin/boards/inquiry/events/${eventId}/${r.__replyOf}#answer`
        : `/admin/boards/inquiry/events/${eventId}/${r.id}`
      }
      onDelete={(id) => deleteEventInquiry(eventId, id)}
      providerIsExpanded={false}  // 🔸 이벤트는 원글만 오므로 여기서 확장
    />
  );
}
