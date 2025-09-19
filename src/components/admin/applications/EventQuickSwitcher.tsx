'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MOCK_EVENTS } from '@/data/events';

export default function EventQuickSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  // /admin/applications/management/[eventId] 에서 eventId 추출
  const m = pathname?.match(/\/admin\/applications\/management\/(\d+)/);
  const currentId = m ? Number(m[1]) : undefined;

  const events = React.useMemo(
    () => [...MOCK_EVENTS].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600">{compact ? '대회:' : '대회선택:'}</span>
      <select
        value={currentId ?? ''}
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) router.push(`/admin/applications/management/${id}`);
        }}
        aria-label="대회 선택"
        className="h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-800 min-w-[260px] max-w-[520px]"
      >
        <option value="" disabled>대회를 선택하세요</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            [{ev.date.replaceAll('-', '.')}] {ev.title}
          </option>
        ))}
      </select>

      {/* 필요하면 바로 목록으로 가는 링크도 제공 */}
      <a
        href="/admin/applications/list"
        className="text-sm text-blue-600 hover:underline whitespace-nowrap"
      >
        대회목록
      </a>
    </div>
  );
}
