/**
 * 대회 선택 컴포넌트
 */
'use client';

import React from 'react';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import {
  pinSelectedEventOption,
  useAdminEventSelect,
} from '@/hooks/useAdminEventSelect';

interface EventSelectorProps {
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}

export default function EventSelector({
  selectedEventId,
  onSelectEvent,
}: EventSelectorProps) {
  const {
    events,
    eventsLoading,
    isError,
    setKeyword: setEventSearchKeyword,
    hasMore,
    isLoadingMore,
    fetchNextPage,
    loadMoreLabel,
  } = useAdminEventSelect();

  const [selectedEventLabel, setSelectedEventLabel] = React.useState<
    string | null
  >(null);

  const selectOptions = React.useMemo(() => {
    const base = events.map((event) => ({
      value: String(event.id),
      label: `${event.nameKr} (${event.startDate.split('T')[0]})`,
    }));
    return pinSelectedEventOption(base, selectedEventId, selectedEventLabel);
  }, [events, selectedEventId, selectedEventLabel]);

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">
          대회 목록을 불러오는 중 오류가 발생했습니다.
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
            onSelectEvent(value || '');
            setSelectedEventLabel(
              selectOptions.find((o) => o.value === value)?.label ?? null
            );
          }}
          placeholder={
            eventsLoading ? '대회 목록 불러오는 중…' : '대회를 선택하세요'
          }
          searchable
          searchPlaceholder="대회명 검색..."
          showPlaceholderColor={false}
          maxHeight="max-h-96"
          onSearchChange={setEventSearchKeyword}
          onLoadMore={() => {
            void fetchNextPage();
          }}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          loadMoreLabel={loadMoreLabel}
          emptyMessage={
            eventsLoading ? '불러오는 중…' : '검색 결과가 없습니다.'
          }
        />
      </div>
    </div>
  );
}
