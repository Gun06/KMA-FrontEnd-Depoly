/**
 * 통계 페이지 스켈레톤 UI
 */
'use client';

import React from 'react';

export default function StatisticsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* EVENT OVERVIEW 스켈레톤 */}
      <div className="rounded-3xl border border-slate-900/10 bg-slate-900 px-5 py-5 shadow-xl shadow-slate-900/10 md:px-6">
        <div className="h-3 w-32 bg-slate-700 rounded"></div>
        <div className="mt-3 h-8 w-64 bg-slate-700 rounded md:h-9"></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-slate-700/50 rounded-full"
            ></div>
          ))}
        </div>
      </div>

      {/* 핵심 지표 + 인사이트 스켈레톤 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* 핵심 지표 스켈레톤 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 인사이트 스켈레톤 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-4">
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
          <div className="mt-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="h-3 w-12 bg-slate-200 rounded"></div>
                  <div className="h-3 w-8 bg-slate-200 rounded"></div>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-1/2 rounded-full bg-slate-200"></div>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="mt-2 h-4 w-32 bg-slate-200 rounded"></div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="mt-2 h-6 w-12 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 종목별 참가자 통계 스켈레톤 (열린 상태) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex w-full items-center justify-between bg-slate-900 px-4 py-3">
          <div>
            <div className="h-4 w-32 bg-slate-700 rounded"></div>
            <div className="mt-1 h-3 w-24 bg-slate-700/70 rounded"></div>
          </div>
          <div className="h-3 w-8 bg-slate-700/70 rounded"></div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/40 px-4 pb-4 pt-3">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {/* 카테고리명 및 배지 스켈레톤 */}
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="h-5 w-16 bg-emerald-100 rounded-full"></div>
                    <div className="h-5 w-20 bg-rose-100 rounded-full"></div>
                  </div>
                </div>

                {/* 통계 카드 그리드 스켈레톤 */}
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="h-3 w-16 bg-slate-200 rounded"></div>
                      <div className="mt-1 h-5 w-12 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>

                {/* 입금 진행률 스켈레톤 */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                    <div className="h-3 w-8 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2 w-1/3 rounded-full bg-slate-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
