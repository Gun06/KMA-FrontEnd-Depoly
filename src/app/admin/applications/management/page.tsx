// src/app/admin/applications/management/page.tsx
import { redirect } from 'next/navigation';
import { MOCK_EVENTS } from '@/data/events';

// YYYY-MM-DD -> UTC Date (타임존 이슈 방지)
function toUtcDate(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 0, 0, 0);
}

// ① “최신 대회” = 개최일이 가장 늦은 대회 (미래 포함)
//   동일 날짜면 id 큰 것 우선
function pickLatestEventId(): number | null {
  const latest = [...MOCK_EVENTS]
    .sort((a, b) => {
      const diff = toUtcDate(b.date) - toUtcDate(a.date);
      return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
    })[0];
  return latest?.id ?? null;
}

/* ② 만약 "가장 최근에 개최한(과거 중 최신)"을 원하면 이 함수를 대신 쓰세요.
function pickMostRecentlyHeldId(): number | null {
  const today = new Date();
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0);
  const past = [...MOCK_EVENTS]
    .filter(e => toUtcDate(e.date) <= todayUTC)
    .sort((a, b) => {
      const diff = toUtcDate(b.date) - toUtcDate(a.date);
      return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
    });
  // 과거가 없다면 전체 최신으로 대체
  return past[0]?.id ?? pickLatestEventId();
}
*/

export default function Page() {
  const id = pickLatestEventId(); // ← 필요 시 위를 pickMostRecentlyHeldId()로 교체

  if (!id) {
    redirect('/admin/applications/list'); // 대회가 하나도 없을 때
  }

  redirect(`/admin/applications/management/${id}`);
}
