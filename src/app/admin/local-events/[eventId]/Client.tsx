// app/admin/local-events/[eventId]/Client.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button/Button';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { useLocalEventDetail, useDeleteLocalEvent } from './api';
import type { LocalEventDetailResponse } from './api/types';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';

export default function Client({ eventId }: { eventId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // API에서 지역대회 상세 정보 조회
  const { data: apiData, isLoading, error } = useLocalEventDetail(eventId);
  const deleteMutation = useDeleteLocalEvent(eventId);

  // 페이지 진입 시 캐시 무효화하여 항상 최신 데이터 가져오기
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'local-events', 'detail', eventId] });
    // refetch는 useLocalEventDetail의 refetchOnMount가 자동으로 처리하므로 제거
  }, [eventId, queryClient]);

  // NOT_FOUND 에러 처리 (삭제된 대회인 경우)
  React.useEffect(() => {
    if (error) {
      const err = error as { httpStatus?: string; code?: string };
      if (err.httpStatus === 'NOT_FOUND' || err.code === 'NOT_FOUND_EVENT') {
        // 삭제된 대회인 경우 목록으로 리다이렉트
        setTimeout(() => {
          router.replace('/admin/local-events/management');
        }, 1000);
      }
    }
  }, [error, router]);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const goList = () => router.replace('/admin/local-events/management?deleted=true');

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteMutation.mutateAsync(undefined);
      // 삭제 성공 후 상세 페이지 쿼리 취소 및 캐시 제거
      queryClient.cancelQueries({ queryKey: ['admin', 'local-events', 'detail', eventId] });
      queryClient.removeQueries({ queryKey: ['admin', 'local-events', 'detail', eventId] });
      // 목록으로 이동
      goList();
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/local-events/${eventId}/edit`);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">지역대회 상세</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" tone="dark" widthType="pager" onClick={goList}>
              목록으로
            </Button>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center text-gray-500">
          지역대회 정보를 불러오는 중...
        </div>
      </main>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">지역대회 상세</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" tone="dark" widthType="pager" onClick={goList}>
              목록으로
            </Button>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center text-red-500">
          지역대회 정보를 불러오는 중 오류가 발생했습니다.
        </div>
      </main>
    );
  }

  if (!apiData) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">지역대회 상세</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" tone="dark" widthType="pager" onClick={goList}>
              목록으로
            </Button>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center text-gray-500">
          지역대회 정보를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  // 날짜 포맷팅
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 서버 이벤트 상태값 → 신청상태(RegStatus) 매핑
  const toRegStatus = (status: LocalEventDetailResponse['eventStatus']): RegStatus => {
    if (status === 'OPEN') return '접수중';
    if (status === 'PENDING') return '비접수';
    if (status === 'FINAL_CLOSED') return '내부마감';
    // CLOSED는 접수마감으로 처리
    return '접수마감';
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-3">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goList}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-pretendard"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            지역대회 목록으로 돌아가기
          </button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleDeleteClick}
              className="text-red-600 border-red-600 hover:bg-red-50 font-pretendard"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
            <Button
              variant="solid"
              size="md"
              onClick={handleEdit}
              className="font-pretendard"
            >
              편집
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <h1 className="text-2xl font-pretendard font-semibold text-gray-900 mb-1">
            {apiData.eventName}
          </h1>
        </div>
      </div>

      {/* 대회 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="bg-gray-100 rounded-t-lg px-3 py-2 border-l-4 border-blue-500">
          <h2 className="text-xl font-pretendard font-semibold text-gray-900">
            대회 기본 정보
          </h2>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* 1. 대회명 | 대회 ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회명
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {apiData.eventName}
              </p>
            </div>
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회 ID
              </span>
              <p className="text-lg text-gray-900 font-pretendard font-mono text-sm">
                {apiData.id}
              </p>
            </div>
          </div>

          {/* 2. 거리/코스 | 대회 페이지 URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                거리/코스
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {apiData.eventCategoryCsv?.trim()
                  ? apiData.eventCategoryCsv
                  : '거리/코스 정보가 없습니다'}
              </p>
            </div>
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회 페이지 URL
              </span>
              <div className="pt-1">
                <a
                  href={apiData.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors break-all"
                >
                  <span className="text-sm">{apiData.eventUrl}</span>
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 3. 신청상태 | 공개여부 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                신청상태
              </span>
              <div className="pt-1">
                <RegistrationStatusBadge
                  status={toRegStatus(apiData.eventStatus)}
                  size="smd"
                />
              </div>
            </div>

            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                공개여부
              </span>
              <div className="pt-1">
                <span
                  className={`inline-flex items-center justify-center w-[70px] h-9 rounded-[6px] text-[13px] leading-[22px] font-medium ${
                    apiData.visibleStatus === 'OPEN'
                      ? 'bg-kma-blue text-white'
                      : apiData.visibleStatus === 'TEST'
                        ? 'bg-[#FFA500] text-white'
                        : 'bg-kma-red text-white'
                  }`}
                >
                  {apiData.visibleStatus === 'OPEN'
                    ? '공개'
                    : apiData.visibleStatus === 'TEST'
                      ? '테스트'
                      : '비공개'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. 날짜 정보 */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-pretendard mb-2.5 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              날짜 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                  개최일
                </span>
                <p className="text-lg font-semibold text-gray-900 font-pretendard">
                  {formatDateTime(apiData.eventStartDate)}
                </p>
              </div>

              {apiData.registStartDate && (
                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    신청시작일
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-pretendard">
                    {formatDateTime(apiData.registStartDate)}
                  </p>
                </div>
              )}

              {apiData.registDeadline && (
                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    신청 마감일
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-pretendard">
                    {formatDateTime(apiData.registDeadline)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 홍보 배너 */}
      {apiData.promotionBanner && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="bg-gray-100 rounded-t-lg px-3 py-2 border-l-4 border-blue-500">
            <h2 className="text-xl font-pretendard font-semibold text-gray-900">
              홍보 배너
            </h2>
          </div>
          <div className="px-3 py-3">
            <div className="flex justify-center">
              <img
                src={apiData.promotionBanner}
                alt="홍보 배너"
                className="max-h-96 rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 생성/수정 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="bg-gray-100 rounded-t-lg px-3 py-2 border-l-4 border-blue-500">
          <h2 className="text-xl font-pretendard font-semibold text-gray-900">
            생성/수정 정보
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                생성일
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {formatDateTime(apiData.createdAt)}
              </p>
            </div>
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                수정일
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {formatDateTime(apiData.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="지역대회 삭제"
        message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        isLoading={deleteMutation.isPending}
        variant="danger"
        centerAlign={true}
        multiline={true}
      />
    </div>
  );
}

