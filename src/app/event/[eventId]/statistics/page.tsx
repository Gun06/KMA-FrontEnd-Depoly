/**
 * 공개 통계 페이지
 * /event/{eventId}/statistics
 */
'use client';

import React from 'react';
import StatisticsDisplay from '@/app/admin/events/statistics/components/StatisticsDisplay';
import StatisticsSkeleton from './components/StatisticsSkeleton';
import { usePublicEventDistanceStatistics } from './hooks/usePublicStatistics';

export default function PublicStatisticsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  
  const {
    data: distanceStatisticsData,
    isLoading,
    error,
  } = usePublicEventDistanceStatistics(eventId);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">통계 확인</h1>
        </div>

        {isLoading && <StatisticsSkeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800 font-medium mb-2">오류 발생</div>
            <div className="text-red-600">
              통계 데이터를 불러오는 중 오류가 발생했습니다.
              {error instanceof Error && ` (${error.message})`}
            </div>
          </div>
        )}

        {distanceStatisticsData && (
          <StatisticsDisplay 
            data={{
              ...distanceStatisticsData,
              eventCategoryParticipants: [], // 카테고리별 통계 숨김
            }} 
            distanceData={distanceStatisticsData}
            defaultDistanceExpanded={true}
            showSideBanner={true}
          />
        )}
      </div>
    </div>
  );
}
