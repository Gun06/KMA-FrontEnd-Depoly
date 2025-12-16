/**
 * 통계 표시 컴포넌트
 */
'use client';

import React from 'react';
import type { EventStatisticsResponse } from '../types';
import { formatNumber, formatGenderPercentage, parseCategoryParticipants } from '../utils';

interface StatisticsDisplayProps {
  data: EventStatisticsResponse;
}

export default function StatisticsDisplay({ data }: StatisticsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* 대회명 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-200">
        <h2 className="text-3xl font-bold text-gray-900">
          {data.eventName}
        </h2>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-gray-400 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            총 참가자 수
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(data.totalParticipants)}
            <span className="text-lg font-normal text-gray-600 ml-1">명</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            오늘 참가자 수
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatNumber(data.todayParticipants)}
            <span className="text-lg font-normal text-blue-500 ml-1">명</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-400 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            완료 참가자 수
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatNumber(data.totalCompletedParticipants)}
            <span className="text-lg font-normal text-green-500 ml-1">명</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-400 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            미결제 참가자 수
          </div>
          <div className="text-3xl font-bold text-red-600">
            {formatNumber(data.totalUnpaidParticipants)}
            <span className="text-lg font-normal text-red-500 ml-1">명</span>
          </div>
        </div>
      </div>

      {/* 추가 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            성별 비율
          </div>
          <div className="text-lg font-semibold text-gray-900 leading-relaxed">
            {formatGenderPercentage(data.totalGenderPercentage)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            총 단체 수
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalOrganizations)}
            <span className="text-base font-normal text-gray-600 ml-1">팀</span>
          </div>
        </div>
      </div>

      {/* 카테고리별 참가자 수 */}
      {data.eventCategoryParticipants && data.eventCategoryParticipants.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            카테고리별 참가자 통계
          </h3>
          <div className="space-y-3">
            {data.eventCategoryParticipants.map((category, index) => {
              const parsed = parseCategoryParticipants(category.totalParticipants);
              const paidPercentage = parsed.total > 0 
                ? Math.round((parsed.paid / parsed.total) * 100) 
                : 0;
              
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50 hover:bg-white"
                >
                  {/* 카테고리명 */}
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    <h4 className="text-base font-bold text-gray-900 leading-tight">
                      {category.categoryName}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 총 참가자 수 */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        총 참가자
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(parsed.total)}
                        <span className="text-base font-normal text-gray-600 ml-1">명</span>
                      </div>
                    </div>

                    {/* 성별 정보 */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        성별 구성
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">남성</span>
                          <span className="text-base font-semibold text-blue-700">
                            {formatNumber(parsed.male)}명
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">여성</span>
                          <span className="text-base font-semibold text-pink-700">
                            {formatNumber(parsed.female)}명
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 입금 정보 */}
                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                      <div className="text-xs font-medium text-green-700 mb-2 uppercase tracking-wide">
                        입금 완료
                      </div>
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {formatNumber(parsed.paid)}
                        <span className="text-base font-normal text-green-600 ml-1">명</span>
                      </div>
                      <div className="text-xs text-green-600">
                        {paidPercentage}% 완료
                      </div>
                    </div>

                    {/* 미입금 정보 */}
                    <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                      <div className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wide">
                        미입금
                      </div>
                      <div className="text-2xl font-bold text-red-700 mb-1">
                        {formatNumber(parsed.unpaid)}
                        <span className="text-base font-normal text-red-600 ml-1">명</span>
                      </div>
                      <div className="text-xs text-red-600">
                        {100 - paidPercentage}% 미완료
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
