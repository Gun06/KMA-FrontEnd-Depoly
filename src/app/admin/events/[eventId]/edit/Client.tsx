// app/admin/events/[eventId]/edit/Client.tsx
"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CompetitionCreateForm } from "@/features/registration/admin";
import type { EventCreatePayload } from "@/features/registration/admin";
import type { EventRow } from "@/components/admin/events/EventTable";
import type { UseCompetitionPrefill } from "@/hooks/useCompetitionForm";
import { useEventsActions, useEventsState } from "@/contexts/EventsContext";
import { payloadToEventPatch } from "@/utils/eventPatch";
import { rowToPrefill } from "@/data/eventPrefill";

export default function Client({
  eventId, prefillForm, prefillRow,
}: { eventId: number; prefillForm: UseCompetitionPrefill; prefillRow: EventRow }) {
  const router = useRouter();
  const { rows, forms } = useEventsState();
  const { upsertOne, saveForm } = useEventsActions();   // ✅ 변경: updateOne -> upsertOne

  const currentRow = useMemo(
    () => rows.find((r) => r.id === eventId) ?? prefillRow,
    [rows, eventId, prefillRow]
  );

  const formPrefill = useMemo(() => {
    return (forms[eventId] as any) ?? (rowToPrefill(currentRow) as any) ?? prefillForm;
  }, [forms, eventId, currentRow, prefillForm]);

  const goDetail = () => router.replace(`/admin/events/${eventId}`);

  const handleSubmit = async (payload: EventCreatePayload) => {
    const patch = payloadToEventPatch(payload, currentRow);

    // ✅ 원본 row + patch → 완성된 row로 업서트
    const nextRow: EventRow = { ...currentRow, ...patch };
    upsertOne(nextRow);

    // 상세 프리필 스냅샷도 저장(상세 화면에서 바로 반영)
    saveForm(eventId, payload);

    goDetail();
  };

  return (
    <CompetitionCreateForm
      mode="edit"
      prefill={formPrefill}
      initialEditing
      onBack={goDetail}
      onCancel={goDetail}
      onSubmit={handleSubmit}
      hideBottomPrimary
    />
  );
}
