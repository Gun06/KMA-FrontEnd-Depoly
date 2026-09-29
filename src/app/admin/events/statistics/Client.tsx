/**
 * 통계 페이지 클라이언트 컴포넌트
 */
'use client';

import React, { useState } from 'react';
import EventSelector from './components/EventSelector';
import StatisticsDisplay from './components/StatisticsDisplay';
import { useEventDistanceStatistics, useEventStatistics } from './hooks/useStatistics';

export default function StatisticsClient() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const {
    data: statisticsData,
    isLoading,
    error,
  } = useEventStatistics(selectedEventId);
  const {
    data: distanceStatisticsData,
    isLoading: isDistanceLoading,
    error: distanceError,
  } = useEventDistanceStatistics(selectedEventId);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId || null);
  };

  return (
    <main className="mx-auto w-full max-w-[1920px] space-y-3 px-4 py-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-semibold text-gray-900">통계 확인</h3>
          <p className="text-[13px] text-gray-500">
            대회를 선택하여 신청 내역 통계를 확인하세요.
          </p>
        </div>
        <div className="px-4 py-3">
          <EventSelector
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      {!selectedEventId && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          위에서 대회를 선택하면 통계 정보가 표시됩니다.
        </div>
      )}

      {selectedEventId && (isLoading || isDistanceLoading) && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          통계 데이터를 불러오는 중...
        </div>
      )}

      {selectedEventId && (error || distanceError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <div className="mb-1 font-medium text-red-800">오류 발생</div>
          <div className="text-red-600">
            통계 데이터를 불러오는 중 오류가 발생했습니다.
            {(error instanceof Error && ` (${error.message})`) ||
              (distanceError instanceof Error && ` (${distanceError.message})`)}
          </div>
        </div>
      )}

      {selectedEventId && statisticsData && (
        <StatisticsDisplay
          data={statisticsData}
          distanceData={distanceStatisticsData}
          showSideBanner={true}
          dense
        />
      )}
    </main>
  );
}
