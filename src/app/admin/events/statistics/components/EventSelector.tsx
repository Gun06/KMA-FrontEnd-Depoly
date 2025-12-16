/**
 * 대회 선택 컴포넌트
 */
'use client';

import React from 'react';
import { useAdminEventList } from '@/services/admin';

interface EventSelectorProps {
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}

export default function EventSelector({
  selectedEventId,
  onSelectEvent,
}: EventSelectorProps) {
  const { data, isLoading, error } = useAdminEventList({
    page: 1,
    size: 100, // 모든 대회를 가져오기 위해 큰 값 설정
  });

  // Hook은 항상 조건부 return 이전에 호출되어야 함
  const events = React.useMemo(() => {
    const eventList = data?.content || [];
    // 날짜순 내림차순 정렬 (최신 대회가 먼저)
    return [...eventList].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">대회 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">
          대회 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대회 선택
        </label>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
          등록된 대회가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        대회 선택
      </label>
      <select
        value={selectedEventId || ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value) {
            onSelectEvent(value);
          } else {
            // 빈 값 선택 시 null로 설정
            onSelectEvent('');
          }
        }}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">대회를 선택하세요</option>
        {events.map((event) => (
          <option key={event.id} value={String(event.id)}>
            {event.nameKr} ({event.startDate.split('T')[0]})
          </option>
        ))}
      </select>
    </div>
  );
}
