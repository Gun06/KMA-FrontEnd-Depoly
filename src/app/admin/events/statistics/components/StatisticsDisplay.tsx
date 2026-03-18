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
  showSideBanner?: boolean; // 공개 페이지에서만 배너 표시
}

export default function StatisticsDisplay({ data, distanceData, defaultDistanceExpanded = false, showSideBanner = false }: StatisticsDisplayProps) {
  const [isDistanceExpanded, setIsDistanceExpanded] = useState(defaultDistanceExpanded);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const distanceParticipants = distanceData?.eventCategoryParticipants ?? [];

  const genderRatio = (() => {
    if (!data.totalGenderPercentage) {
      return { male: 50, female: 50 };
    }
    const ratioMatch = data.totalGenderPercentage.match(/(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)/);
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

  // 환불률 계산 환불(요청 + 완료) / 총 참가자 × 100
  const refundRate = (() => {
    const totalMatch = data.totalParticipants?.match(/(\d+)/);
    const refundedMatch = data.totalRefunded?.match(/(\d+)/);

    const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    const refunded = refundedMatch ? parseInt(refundedMatch[1], 10) : 0;

    if (!total || !refunded) return 0;

    return Math.round((refunded / total) * 100);
  })();

  // 환불진행률 계산 전액환불완료 / (전액환불요청 + 전액환불완료) × 100
  const refundProgressRate = (() => {
    const refundedMatch = data.totalRefunded?.match(/(\d+)/);
    const needRefundedMatch = data.totalNeedRefunded?.match(/(\d+)/);

    const refunded = refundedMatch ? parseInt(refundedMatch[1], 10) : 0;
    const needRefunded = needRefundedMatch ? parseInt(needRefundedMatch[1], 10) : 0;

    const totalRequests = refunded + needRefunded;
    if (!totalRequests || !refunded) return 0;

    return Math.round((refunded / totalRequests) * 100);
  })();

  // 단체 규모별 비율 계산
  const groupSizeRates = (() => {
    if (!data.group1to19 && !data.group20to29 && !data.group30over) return null;
    
    const group1to19Match = data.group1to19?.match(/(\d+)/);
    const group20to29Match = data.group20to29?.match(/(\d+)/);
    const group30overMatch = data.group30over?.match(/(\d+)/);
    
    const group1to19Count = group1to19Match ? parseInt(group1to19Match[1], 10) : 0;
    const group20to29Count = group20to29Match ? parseInt(group20to29Match[1], 10) : 0;
    const group30overCount = group30overMatch ? parseInt(group30overMatch[1], 10) : 0;
    
    const totalGroups = group1to19Count + group20to29Count + group30overCount;
    if (!totalGroups) return null;
    
    return {
      group1to19: Math.round((group1to19Count / totalGroups) * 100),
      group20to29: Math.round((group20to29Count / totalGroups) * 100),
      group30over: Math.round((group30overCount / totalGroups) * 100),
      group1to19Count,
      group20to29Count,
      group30overCount,
    };
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
                  {category.categoryName || '-'}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    입금 {formatNumber(parsed.paid)}명
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-1 font-medium text-rose-700">
                    미입금 {formatNumber(parsed.unpaid)}명
                  </span>
                  <span className="rounded-full bg-purple-50 px-2 py-1 font-medium text-purple-700">
                    환불 {formatNumber(parsed.refund)}명
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
      <div className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-900 px-5 py-5 text-white shadow-xl shadow-slate-900/10 md:px-6">
        {/* 콘텐츠 */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-300">EVENT OVERVIEW</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                {data.eventName || '-'}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {data.todayParticipants && (
                  <span className="rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-200">
                    오늘 참가자 +{formatNumber(data.todayParticipants)}명
                  </span>
                )}
                {data.todayRefundRequest && (
                  <span className="rounded-full bg-purple-500/20 px-4 py-1.5 text-sm font-medium text-purple-200">
                    오늘 환불자 +{formatNumber(data.todayRefundRequest)}명
                  </span>
                )}
              </div>
            </div>
          </div>
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
              <span className="text-sm text-slate-600">입금</span>
              <span className="text-lg font-semibold text-emerald-700">
                {formatNumber(data.totalCompletedParticipants)}명
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">미입금</span>
              <span className="text-lg font-semibold text-rose-700">
                {formatNumber(data.totalUnpaidParticipants)}명
              </span>
            </div>
            {data.totalRefunded && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-600">환불</span>
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
            {/* 사이드 배너 - 인사이트 섹션 상단에 배치 */}
            {showSideBanner && data.sideBannerImageUrl && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.sideBannerImageUrl}
                  alt="이벤트 배너"
                  className="max-h-40 w-full rounded-lg object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsBannerModalOpen(true)}
                />
              </div>
            )}
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
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>환불률</span>
                <span>{refundRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500"
                  style={{ width: `${refundRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>환불진행률</span>
                <span>{refundProgressRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500"
                  style={{ width: `${refundProgressRate}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-500">성별 비율 원문</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {formatGenderPercentage(data.totalGenderPercentage)}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
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
              </div>
            </div>
            {groupSizeRates && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium text-slate-500">단체 규모별</p>
                <div className="mt-0.5 space-y-1">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                    <span>1~19인</span>
                    <span>{formatNumber(groupSizeRates.group1to19Count)}팀</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                    <span>20~29인</span>
                    <span>{formatNumber(groupSizeRates.group20to29Count)}팀</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                    <span>30인~</span>
                    <span>{formatNumber(groupSizeRates.group30overCount)}팀</span>
                  </div>
                </div>
              </div>
            )}
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

      {/* 사이드 배너 모달 */}
      {isBannerModalOpen && data.sideBannerImageUrl && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsBannerModalOpen(false)}
          style={{ margin: 0, padding: 0 }}
        >
          {/* X 버튼 - 이미지에서 20px 떨어진 위치 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBannerModalOpen(false);
            }}
            className="fixed top-5 right-5 text-white hover:text-gray-300 z-[60] bg-black bg-opacity-50 rounded-full p-2 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* 이미지 컨테이너 */}
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center p-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.sideBannerImageUrl}
              alt="이벤트 배너 확대"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
