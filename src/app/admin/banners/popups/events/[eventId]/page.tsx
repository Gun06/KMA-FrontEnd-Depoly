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
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      {/* 팝업 관리 섹션 - 공지사항과 동일한 스타일 */}
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">
          선택대회:{' '}
          <span className="text-[#1E5EFF]">{eventName}</span>
        </h3>
        <Button
          size="sm"
          tone="competition"
          onClick={() => router.push('/admin/banners/popups/main')}
        >
          메인 팝업 관리하기 &gt;
        </Button>
      </div>
      
      <PopupListManager eventId={eventId} />
    </div>
  );
}
