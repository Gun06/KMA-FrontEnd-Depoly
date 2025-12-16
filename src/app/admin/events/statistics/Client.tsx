/**
 * 통계 페이지 클라이언트 컴포넌트
 */
'use client';

import React, { useState } from 'react';
import EventSelector from './components/EventSelector';
import StatisticsDisplay from './components/StatisticsDisplay';
import { useEventStatistics } from './hooks/useStatistics';

export default function StatisticsClient() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const {
    data: statisticsData,
    isLoading,
    error,
  } = useEventStatistics(selectedEventId);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId || null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">통계 확인</h1>
        <p className="text-gray-600 mt-2">
          대회를 선택하여 신청 내역 통계를 확인하세요.
        </p>
      </div>

      <EventSelector
        selectedEventId={selectedEventId}
        onSelectEvent={handleSelectEvent}
      />

      {!selectedEventId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            위에서 대회를 선택하면 통계 정보가 표시됩니다.
          </p>
        </div>
      )}

      {selectedEventId && isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">통계 데이터를 불러오는 중...</div>
        </div>
      )}

      {selectedEventId && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 font-medium mb-2">오류 발생</div>
          <div className="text-red-600">
            통계 데이터를 불러오는 중 오류가 발생했습니다.
            {error instanceof Error && ` (${error.message})`}
          </div>
        </div>
      )}

      {selectedEventId && statisticsData && (
        <StatisticsDisplay data={statisticsData} />
      )}
    </div>
  );
}
