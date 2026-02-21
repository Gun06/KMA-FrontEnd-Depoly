/**
 * 통계 페이지 스켈레톤 UI
 */
'use client';

import React from 'react';

export default function StatisticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 대회명 스켈레톤 */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="h-9 bg-gray-200 rounded w-2/5"></div>
      </div>

      {/* 주요 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-gray-300">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* 추가 통계 정보 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
        ))}
      </div>

      {/* 카테고리별 통계 스켈레톤 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 bg-gray-50"
            >
              {/* 카테고리명 스켈레톤 */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-64"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 총 참가자 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>

                {/* 성별 정보 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>

                {/* 입금 완료 */}
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>

                {/* 미입금 */}
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
