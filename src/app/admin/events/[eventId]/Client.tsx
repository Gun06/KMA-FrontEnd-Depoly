"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import CompetitionCreateForm from "@/components/admin/Form/competition/CompetitionCreateForm";
import type { UseCompetitionPrefill } from "@/hooks/useCompetitionForm";
import { useEventsActions, useEventsState } from "@/contexts/EventsContext";
import { rowToPrefill } from "@/data/eventPrefill";

export default function Client({
  eventId,
  prefill,
}: {
  eventId: number;
  prefill: UseCompetitionPrefill;
}) {
  const router = useRouter();
  const { rows, forms } = useEventsState();
  const { removeOne } = useEventsActions();

  // 프리필 우선순위: 저장 스냅샷 → row→prefill → SSR 폴백
  const effectivePrefill = useMemo(() => {
    if (forms[eventId]) return forms[eventId] as UseCompetitionPrefill;
    const r = rows.find((x) => x.id === eventId);
    return r ? (rowToPrefill(r) as UseCompetitionPrefill) : prefill;
  }, [forms, eventId, rows, prefill]);

  const goList = () => router.replace("/admin/events/management");

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;
    // TODO(API): 여기서 DELETE /api/admin/events/:id 호출 후 아래 로컬 갱신 유지
    removeOne(eventId);
    goList();
  };

  return (
    <CompetitionCreateForm
      mode="edit"
      prefill={effectivePrefill}
      onBack={goList}
      onDelete={handleDelete}
      hideBottomPrimary
      editHref={`/admin/events/${eventId}/edit`}
    />
  );
}
