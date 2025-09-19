"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import FaqListPage from "@/components/admin/boards/faq/FaqListPage";
import { getEventFaqs, deleteEventFaq } from "@/data/faq/event";
import { getEventById } from "@/data/events";

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const event = getEventById(Number(eventId));
  const eventTitle = event?.title ?? `#${eventId}`;

  return (
    <FaqListPage
      title={
        <span>
          선택대회 : <span className="text-[#1E5EFF]">{eventTitle}</span> FAQ
        </span>
      }
      headerButton={{
        label: "전마협 메인 FAQ 관리하기 >",
        size: "sm",
        tone: "primary",
        onClick: () => router.push("/admin/boards/faq/main"),
      }}
      provider={(page, size, opt) => getEventFaqs(String(eventId), page, size, opt)}
      linkForRow={(r) => `/admin/boards/faq/events/${eventId}/${r.id}`}
      onDelete={(id) => deleteEventFaq(String(eventId), id)}
      createHref={`/admin/boards/faq/events/${eventId}/write`}
    />
  );
}
