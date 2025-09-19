// app/admin/events/[eventId]/page.tsx
import Client from "./Client";
import { getEventById } from "@/data/events";
import { rowToPrefill } from "@/data/eventPrefill";
import { notFound } from "next/navigation";

export const dynamicParams = true;
// (선택) 정적 캐싱 방지하고 항상 최신 컨텍스트로 보이고 싶다면:
// export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { eventId: string } }) {
  const id = Number(params.eventId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  // 🔹 SSR 더미에서만 시도 → 없으면 비워서 Client에 넘김(컨텍스트가 채울 것)
  const row = getEventById(id) || null;
  const prefill = row ? (rowToPrefill(row) as any) : ({} as any);

  return <Client eventId={id} prefill={prefill} />;
}
