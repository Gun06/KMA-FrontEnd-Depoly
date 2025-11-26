// app/admin/events/[eventId]/page.tsx
import Client from './Client';
import { notFound } from 'next/navigation';

export const dynamicParams = true;
// (선택) 정적 캐싱 방지하고 항상 최신 컨텍스트로 보이고 싶다면:
// export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { eventId: string } }) {
  const id = params.eventId; // eventId를 그대로 사용 (UUID 또는 숫자 ID)

  // 빈 문자열이나 잘못된 형식만 체크
  if (!id || id.trim() === '') {
    notFound();
  }

  return <Client eventId={id} />;
}
