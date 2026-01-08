// app/admin/events/[eventId]/edit/page.tsx
import Client from './Client';
import { getEventById } from './data';
import { rowToPrefill } from '@/data/eventPrefill';
import type { EventRow } from '@/components/admin/events/EventTable';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import { notFound } from 'next/navigation';

export const dynamicParams = true;
// export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { eventId: string } }) {
  const id = params.eventId; // eventId를 그대로 사용 (UUID 또는 숫자 ID)

  // 빈 문자열이나 잘못된 형식만 체크
  if (!id || id.trim() === '') {
    notFound();
  }

  // 🔹 SSR 더미에서만 시도 → 없으면 비워서 Client에 넘김(컨텍스트가 채울 것)
  // 숫자 ID인 경우에만 mock 데이터에서 찾기 시도
  let row = null;
  const numericId = Number(id);
  if (Number.isFinite(numericId) && numericId > 0) {
    row = getEventById(numericId);
  }

  const prefillForm = row ? (rowToPrefill(row) as any) : ({} as any);

  // 🔹 패치 계산을 위한 fallback row(더미 없을 때 최소 스켈레톤)
  const prefillRow: EventRow =
    row ??
    ({
      id,
      date: '',
      title: '',
      titleEn: '',
      place: '',
      host: '',
      applyStatus: '접수중' as RegStatus,
      isPublic: 'OPEN',
    } as EventRow);

  return (
    <Client eventId={id} prefillForm={prefillForm} prefillRow={prefillRow} />
  );
}
