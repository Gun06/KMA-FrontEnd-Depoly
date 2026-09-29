"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import PopupListManager from '@/components/admin/banners/popups/components/PopupListManager';
import Button from '@/components/common/Button/Button';
import { useEventList } from '@/hooks/useNotices';
import type { EventListResponse, EventListItem } from '@/types/eventList';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  // 대회 목록에서 해당 대회 정보 찾기
  const { data: eventListData } = useEventList(1, 100) as {
    data: EventListResponse | undefined;
  };
  const event = eventListData?.content?.find((e: EventListItem) => e.id === eventId);
  const eventName = event?.nameKr ?? `#${eventId}`;

  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <PopupListManager
        eventId={eventId}
        title={
          <>
            선택대회:{' '}
            <span className="text-[#1E5EFF]">{eventName}</span>
          </>
        }
        headerAction={
          <Button
            size="sm"
            tone="competition"
            className="!h-9 !px-3 !text-[13px]"
            onClick={() => router.push('/admin/banners/popups/main')}
          >
            메인 팝업 관리하기 &gt;
          </Button>
        }
      />
    </main>
  );
}
