/**
 * 통계 표시 컴포넌트
 */
'use client';

import React, { useState } from 'react';
import type { EventStatisticsResponse } from '../types';
import { formatNumber, formatGenderPercentage, parseCategoryParticipants } from '../utils';

interface StatisticsDisplayProps {
  data: EventStatisticsResponse;
  distanceData?: EventStatisticsResponse;
}

export default function StatisticsDisplay({ data, distanceData }: StatisticsDisplayProps) {
  const [isDistanceExpanded, setIsDistanceExpanded] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const distanceParticipants = distanceData?.eventCategoryParticipants ?? [];

  const renderParticipantCards = (
    participants: EventStatisticsResponse['eventCategoryParticipants']
  ) => {
    if (!participants || participants.length === 0) return null;

    return (
      <div className="space-y-2.5">
        {participants.map((category, index) => {
          const parsed = parseCategoryParticipants(category.totalParticipants);
          const paidPercentage = parsed.total > 0
            ? Math.round((parsed.paid / parsed.total) * 100)
            : 0;

          return (
            <div
              key={`participant-${index}`}
              className="rounded-lg border border-gray-200 bg-gray-50/70 p-4"
            >
              <div className="mb-3 border-b border-gray-200 pb-2">
                <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                  {category.categoryName}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="mb-1 text-[11px] font-medium text-gray-500">
                    총 참가자
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatNumber(parsed.total)}
                    <span className="ml-1 text-sm font-normal text-gray-500">명</span>
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="mb-1 text-[11px] font-medium text-gray-500">
                    성별 구성
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">남성</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatNumber(parsed.male)}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">여성</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatNumber(parsed.female)}명
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-green-200 bg-green-50/60 p-3">
                  <div className="mb-1 text-[11px] font-medium text-green-700">
                    입금 완료
                  </div>
                  <div className="mb-0.5 text-xl font-semibold text-green-700">
                    {formatNumber(parsed.paid)}
                    <span className="ml-1 text-sm font-normal text-green-600">명</span>
                  </div>
                  <div className="text-[11px] text-green-700/80">
                    {paidPercentage}% 완료
                  </div>
                </div>

                <div className="rounded-md border border-red-200 bg-red-50/60 p-3">
                  <div className="mb-1 text-[11px] font-medium text-red-700">
                    미입금
                  </div>
                  <div className="mb-0.5 text-xl font-semibold text-red-700">
                    {formatNumber(parsed.unpaid)}
                    <span className="ml-1 text-sm font-normal text-red-600">명</span>
                  </div>
                  <div className="text-[11px] text-red-700/80">
                    {100 - paidPercentage}% 미완료
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 대회명 */}
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1 text-xs font-medium text-gray-500">선택한 대회</p>
        <h2 className="text-2xl font-semibold text-gray-900">
          {data.eventName}
        </h2>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-gray-500">
            총 참가자 수
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatNumber(data.totalParticipants)}
            <span className="ml-1 text-sm font-normal text-gray-500">명</span>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-blue-700/80">
            오늘 참가자 수
          </div>
          <div className="text-2xl font-semibold text-blue-700">
            {formatNumber(data.todayParticipants)}
            <span className="ml-1 text-sm font-normal text-blue-700/80">명</span>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50/40 p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-green-700/80">
            완료 참가자 수
          </div>
          <div className="text-2xl font-semibold text-green-700">
            {formatNumber(data.totalCompletedParticipants)}
            <span className="ml-1 text-sm font-normal text-green-700/80">명</span>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50/40 p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-red-700/80">
            미결제 참가자 수
          </div>
          <div className="text-2xl font-semibold text-red-700">
            {formatNumber(data.totalUnpaidParticipants)}
            <span className="ml-1 text-sm font-normal text-red-700/80">명</span>
          </div>
        </div>
      </div>

      {/* 추가 통계 정보 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-gray-500">
            성별 비율
          </div>
          <div className="text-base font-semibold text-gray-900 leading-relaxed">
            {formatGenderPercentage(data.totalGenderPercentage)}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-gray-500">
            총 단체 수
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {formatNumber(data.totalOrganizations)}
            <span className="ml-1 text-sm font-normal text-gray-500">팀</span>
          </div>
        </div>
      </div>

      {/* 종목별 참가자 통계 */}
      {distanceParticipants.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setIsDistanceExpanded((prev) => !prev)}
            aria-expanded={isDistanceExpanded}
          >
            <h3 className="text-base font-semibold text-gray-900">
              종목별 참가자 통계
            </h3>
            <span className="text-xs font-medium text-gray-500">
              {isDistanceExpanded ? '접기' : '펼치기'}
            </span>
          </button>

          {isDistanceExpanded && (
            <div className="border-t border-gray-200 px-4 pb-4 pt-3">
              <div className="mt-1">
                  {renderParticipantCards(distanceParticipants)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 카테고리별 참가자 통계 (기본 접힘) */}
      {data.eventCategoryParticipants && data.eventCategoryParticipants.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setIsCategoryExpanded((prev) => !prev)}
            aria-expanded={isCategoryExpanded}
          >
            <h3 className="text-base font-semibold text-gray-900">
              카테고리별 참가자 통계
            </h3>
            <span className="text-xs font-medium text-gray-500">
              {isCategoryExpanded ? '접기' : '펼치기'}
            </span>
          </button>

          {isCategoryExpanded && (
            <div className="border-t border-gray-200 px-4 pb-4 pt-3">
              <div className="mt-1">
                  {renderParticipantCards(data.eventCategoryParticipants)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
