// app/admin/events/[eventId]/edit/page.tsx
import Client from "./Client";
import { getEventById } from "@/data/events";
import { rowToPrefill } from "@/data/eventPrefill";
import type { EventRow } from "@/components/admin/events/EventTable";
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";
import { notFound } from "next/navigation";

export const dynamicParams = true;
// export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { eventId: string } }) {
  const id = Number(params.eventId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const row = getEventById(id) || null;

  // 🔹 폼 프리필: 더미 있으면 row→prefill, 없으면 빈 객체(컨텍스트가 대체)
  const prefillForm = row ? (rowToPrefill(row) as any) : ({} as any);

  // 🔹 패치 계산을 위한 fallback row(더미 없을 때 최소 스켈레톤)
  const prefillRow: EventRow =
    row ??
    ({
      id,
      date: "",
      title: "",
      titleEn: "",
      place: "",
      host: "",
      applyStatus: "접수중" as RegStatus,
      isPublic: true,
    } as EventRow);

  return <Client eventId={id} prefillForm={prefillForm} prefillRow={prefillRow} />;
}
