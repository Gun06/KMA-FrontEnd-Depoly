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
  defaultDistanceExpanded?: boolean;
}

export default function StatisticsDisplay({ data, distanceData, defaultDistanceExpanded = false }: StatisticsDisplayProps) {
  const [isDistanceExpanded, setIsDistanceExpanded] = useState(defaultDistanceExpanded);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const distanceParticipants = distanceData?.eventCategoryParticipants ?? [];

  const genderRatio = (() => {
    const ratioMatch = data.totalGenderPercentage?.match(/(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)/);
    if (!ratioMatch) {
      return { male: 50, female: 50 };
    }
    const male = Number(ratioMatch[1]);
    const female = Number(ratioMatch[2]);
    const sum = male + female;
    if (!sum) return { male: 50, female: 50 };
    return {
      male: Math.round((male / sum) * 100),
      female: Math.round((female / sum) * 100),
    };
  })();

  // 입금률 계산
  const paidRate = (() => {
    const totalMatch = data.totalParticipants?.match(/(\d+)/);
    const completedMatch = data.totalCompletedParticipants?.match(/(\d+)/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    const completed = completedMatch ? parseInt(completedMatch[1], 10) : 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  })();

  // 환불 처리율 계산 (환불 완료 / (환불 완료 + 환불 요청))
  const refundProcessRate = (() => {
    if (!data.totalRefunded) return null;
    const refundedMatch = data.totalRefunded?.match(/(\d+)/);
    const needRefundedMatch = data.totalNeedRefunded?.match(/(\d+)/);
    const needPartitialRefundedMatch = data.totalNeedPartitialRefunded?.match(/(\d+)/);
    
    const refunded = refundedMatch ? parseInt(refundedMatch[1], 10) : 0;
    const needRefunded = needRefundedMatch ? parseInt(needRefundedMatch[1], 10) : 0;
    const needPartitialRefunded = needPartitialRefundedMatch ? parseInt(needPartitialRefundedMatch[1], 10) : 0;
    
    const totalRefundRequests = refunded + needRefunded + needPartitialRefunded;
    if (!totalRefundRequests) return null;
    
    return Math.round((refunded / totalRefundRequests) * 100);
  })();

  const renderParticipantCards = (
    participants: EventStatisticsResponse['eventCategoryParticipants']
  ) => {
    if (!participants || participants.length === 0) return null;

    return (
      <div className="space-y-3">
        {participants.map((category, index) => {
          const parsed = parseCategoryParticipants(category.totalParticipants);
          const paidPercentage = parsed.total > 0
            ? Math.round((parsed.paid / parsed.total) * 100)
            : 0;

          return (
            <div
              key={`participant-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  {category.categoryName}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    입금 {formatNumber(parsed.paid)}명
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-1 font-medium text-rose-700">
                    미입금 {formatNumber(parsed.unpaid)}명
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    총 참가자
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900">
                    {formatNumber(parsed.total)}
                    <span className="ml-1 text-xs font-medium text-slate-500">명</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    남성
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900">
                    {formatNumber(parsed.male)}
                    <span className="ml-1 text-xs font-medium text-slate-500">명</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    여성
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900">
                    {formatNumber(parsed.female)}
                    <span className="ml-1 text-xs font-medium text-slate-500">명</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    입금률
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900">
                    {paidPercentage}
                    <span className="ml-1 text-xs font-medium text-slate-500">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>입금 진행률</span>
                  <span>{paidPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${paidPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-900/10 bg-slate-900 px-5 py-5 text-white shadow-xl shadow-slate-900/10 md:px-6">
        <p className="text-xs font-medium text-slate-300">EVENT OVERVIEW</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          {data.eventName}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
            총 참가 {formatNumber(data.totalParticipants)}명
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
            오늘 +{formatNumber(data.todayParticipants)}명
          </span>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
            완료 {formatNumber(data.totalCompletedParticipants)}명
          </span>
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-200">
            미결제 {formatNumber(data.totalUnpaidParticipants)}명
          </span>
          {data.totalRefunded && (
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-200">
              환불 완료 {formatNumber(data.totalRefunded)}명
            </span>
          )}
          {data.totalNeedRefunded && (
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-200">
              전액 환불 요청 {formatNumber(data.totalNeedRefunded)}명
            </span>
          )}
          {data.totalNeedPartitialRefunded && (
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
              차액 환불 요청 {formatNumber(data.totalNeedPartitialRefunded)}명
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">핵심 지표</h3>
            <span className="text-xs text-slate-500">실시간 집계 기준</span>
          </div>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">총 참가자</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatNumber(data.totalParticipants)}명
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">오늘 참가자</span>
              <span className="text-lg font-semibold text-blue-700">
                +{formatNumber(data.todayParticipants)}명
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">입금 완료</span>
              <span className="text-lg font-semibold text-emerald-700">
                {formatNumber(data.totalCompletedParticipants)}명
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">미결제</span>
              <span className="text-lg font-semibold text-rose-700">
                {formatNumber(data.totalUnpaidParticipants)}명
              </span>
            </div>
            {data.totalRefunded && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-600">환불 완료</span>
                <span className="text-lg font-semibold text-purple-700">
                  {formatNumber(data.totalRefunded)}명
                </span>
              </div>
            )}
            {data.totalNeedRefunded && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-600">전액 환불 요청</span>
                <span className="text-lg font-semibold text-orange-700">
                  {formatNumber(data.totalNeedRefunded)}명
                </span>
              </div>
            )}
            {data.totalNeedPartitialRefunded && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-600">차액 환불 요청</span>
                <span className="text-lg font-semibold text-amber-700">
                  {formatNumber(data.totalNeedPartitialRefunded)}명
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-4">
          <h3 className="text-sm font-semibold text-slate-900">인사이트</h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>남성</span>
                <span>{genderRatio.male}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${genderRatio.male}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>여성</span>
                <span>{genderRatio.female}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-pink-500"
                  style={{ width: `${genderRatio.female}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>입금률</span>
                <span>{paidRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${paidRate}%` }}
                />
              </div>
            </div>
            {refundProcessRate !== null && (
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>환불 처리율</span>
                  <span>{refundProcessRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${refundProcessRate}%` }}
                  />
                </div>
              </div>
            )}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-500">성별 비율 원문</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {formatGenderPercentage(data.totalGenderPercentage)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-500">총 단체 수</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">
                {formatNumber(data.totalOrganizations)}팀
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 종목별 참가자 통계 */}
      {distanceParticipants.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-slate-900 px-4 py-3 text-left transition-colors hover:bg-slate-800"
            onClick={() => setIsDistanceExpanded((prev) => !prev)}
            aria-expanded={isDistanceExpanded}
          >
            <div>
              <h3 className="text-sm font-semibold text-white">종목별 참가자 통계</h3>
              <p className="mt-0.5 text-[11px] text-slate-300">
                총 {distanceParticipants.length}개 종목
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {isDistanceExpanded ? '닫기' : '열기'}
            </span>
          </button>

          {isDistanceExpanded && (
            <div className="border-t border-slate-200 bg-slate-50/40 px-4 pb-4 pt-3">
              {renderParticipantCards(distanceParticipants)}
            </div>
          )}
        </div>
      )}

      {/* 카테고리별 참가자 통계 (기본 접힘) */}
      {data.eventCategoryParticipants && data.eventCategoryParticipants.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-slate-900 px-4 py-3 text-left transition-colors hover:bg-slate-800"
            onClick={() => setIsCategoryExpanded((prev) => !prev)}
            aria-expanded={isCategoryExpanded}
          >
            <div>
              <h3 className="text-sm font-semibold text-white">카테고리별 참가자 통계</h3>
              <p className="mt-0.5 text-[11px] text-slate-300">
                총 {data.eventCategoryParticipants.length}개 카테고리
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {isCategoryExpanded ? '닫기' : '열기'}
            </span>
          </button>

          {isCategoryExpanded && (
            <div className="border-t border-slate-200 bg-slate-50/40 px-4 pb-4 pt-3">
              {renderParticipantCards(data.eventCategoryParticipants)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
