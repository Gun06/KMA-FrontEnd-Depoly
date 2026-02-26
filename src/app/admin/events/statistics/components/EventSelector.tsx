/**
 * 대회 선택 컴포넌트
 */
'use client';

import React from 'react';
import { useAdminEventList } from '@/services/admin';
import { SearchableSelect, type SearchableSelectOption } from '@/components/common/Dropdown/SearchableSelect';

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

  // SearchableSelect용 옵션 변환 (조건부 return 이전에 호출)
  const selectOptions: SearchableSelectOption<string>[] = React.useMemo(() => {
    return events.map((event) => ({
      value: String(event.id),
      label: `${event.nameKr} (${event.startDate.split('T')[0]})`,
    }));
  }, [events]);

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
      <div className="w-full max-w-4xl">
        <SearchableSelect
          value={selectedEventId || null}
          options={selectOptions}
          onChange={(value) => {
            if (value) {
              onSelectEvent(value);
            } else {
              onSelectEvent('');
            }
          }}
          placeholder="대회를 선택하세요"
          searchable={true}
          searchPlaceholder="대회명 검색..."
          showPlaceholderColor={false}
          maxHeight="max-h-96"
        />
      </div>
    </div>
  );
}
