// app/admin/local-events/[eventId]/edit/page.tsx
import { notFound } from 'next/navigation';
import Client from './Client';

export const dynamicParams = true;

export default function Page({ params }: { params: { eventId: string } }) {
  const id = params.eventId; // eventId를 그대로 사용 (UUID 또는 숫자 ID)

  // 빈 문자열이나 잘못된 형식만 체크
  if (!id || id.trim() === '') {
    notFound();
  }

  return <Client eventId={id} />;
}

