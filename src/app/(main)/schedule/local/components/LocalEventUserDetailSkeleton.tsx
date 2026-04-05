'use client';

import { cn } from '@/utils/cn';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      aria-hidden
    />
  );
}

type Props = { goList: () => void };

/**
 * 지역대회 상세(유저) 로딩 — 실제 조회 화면과 같은 뼈대 + 스켈레톤
 */
export default function LocalEventUserDetailSkeleton({ goList }: Props) {
  return (
    <div className="mx-auto max-w-[1300px] py-3 px-2.5 sm:px-4 max-[380px]:px-2">
      <div className="mb-4">
        <div className="py-2 md:py-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goList}
              className="flex min-w-0 items-center text-left text-gray-600 transition-colors hover:text-gray-800 font-pretendard max-[380px]:text-sm"
            >
              <svg
                className="mr-1.5 shrink-0 h-4 w-4 max-[380px]:h-3.5 max-[380px]:w-3.5 sm:mr-2 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="max-[380px]:hidden">지역대회 목록으로 돌아가기</span>
              <span className="hidden max-[380px]:inline">돌아가기</span>
            </button>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Shimmer className="h-8 w-[52px] rounded-full max-[380px]:h-7 max-[380px]:w-12" />
              <Shimmer className="h-8 w-[52px] rounded-full max-[380px]:h-7 max-[380px]:w-12" />
            </div>
          </div>
        </div>
        <div className="mb-3 space-y-2">
          <Shimmer className="h-7 w-[min(100%,20rem)] sm:h-8" />
          <Shimmer className="h-5 w-[min(100%,14rem)] sm:h-6 opacity-80" />
        </div>
      </div>

      <div
        className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        aria-busy
        aria-label="지역대회 정보 불러오는 중"
      >
        <div className="bg-gray-100 rounded-t-lg border-l-4 border-blue-500 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2 className="font-pretendard font-semibold text-gray-900 text-base md:text-xl">
            대회 기본 정보
          </h2>
        </div>
        <div className="space-y-4 sm:space-y-6 px-4 py-5 md:px-6 md:py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-5 w-full max-w-xs" />
            </div>
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-5 w-full" />
            </div>
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-5 w-4/5 max-w-sm" />
            </div>
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-5 w-full max-w-md" />
            </div>
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-2 px-2">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-7 w-16 rounded-md" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
            <div className="mb-2 flex items-center gap-2 sm:mb-2.5">
              <Shimmer className="h-5 w-5 rounded sm:h-5" />
              <Shimmer className="h-5 w-24 sm:h-5 sm:w-28" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                <Shimmer className="mb-2 h-3 w-14" />
                <Shimmer className="h-4 w-full max-w-[200px]" />
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                <Shimmer className="mb-2 h-3 w-20" />
                <Shimmer className="h-4 w-full max-w-[200px]" />
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm md:col-span-2">
                <Shimmer className="mb-2 h-3 w-24" />
                <Shimmer className="h-4 w-full max-w-[240px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2 className="font-pretendard font-semibold text-gray-900 text-base md:text-xl">
            홍보 배너
          </h2>
        </div>
        <div className="px-4 py-5 md:px-6 md:py-6">
          <Shimmer className="mx-auto h-40 w-full max-w-lg rounded-lg sm:h-48" />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2 className="font-pretendard font-semibold text-gray-900 text-base md:text-xl">
            신청자 정보
          </h2>
        </div>
        <div className="space-y-4 px-4 py-5 md:px-6 md:py-6">
          <div className="space-y-2 px-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-5 w-48 max-w-full" />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2 className="font-pretendard font-semibold text-gray-900 text-base md:text-xl">
            생성/수정 정보
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 px-4 py-5 md:grid-cols-2 md:px-6 md:py-6">
          <div className="space-y-2 px-2">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-5 w-44" />
          </div>
          <div className="space-y-2 px-2">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-5 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
