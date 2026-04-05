// app/admin/local-events/[eventId]/Client.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import Button from '@/components/common/Button/Button';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { useLocalEventDetail, useDeleteLocalEvent } from './api';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import { useLocalEventUserDetail } from '@/app/(main)/schedule/local/hooks/useLocalEvents';
import { useDeleteLocalEventUser } from '@/app/(main)/schedule/local/hooks/useLocalEvents';
import { useAuthStore } from '@/stores';
import LocalEventUserDetailChrome from '@/app/(main)/schedule/local/components/LocalEventUserDetailChrome';
import LocalEventUserDetailSkeleton from '@/app/(main)/schedule/local/components/LocalEventUserDetailSkeleton';

/** 내 지역대회 목록 모바일 카드와 동일한 공개/비공개 아웃라인 뱃지 */
function userVisibilityOutline(v: string) {
  const base =
    'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight whitespace-nowrap';
  if (v === 'OPEN') {
    return (
      <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>공개</span>
    );
  }
  if (v === 'TEST') {
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>테스트</span>
    );
  }
  if (v === 'CLOSE') {
    return (
      <span className={`${base} border-rose-200 bg-rose-50 text-rose-700`}>비공개</span>
    );
  }
  return (
    <span className={`${base} border-gray-200 bg-gray-50 text-gray-700`}>{v || '—'}</span>
  );
}

/** LocalEventMineList 모바일 카드와 동일한 신청상태 뱃지 오버라이드 */
const USER_MOBILE_REG_BADGE_CLASS =
  'max-md:!rounded-full max-md:!h-7 max-md:!min-h-7 max-md:!w-fit max-md:!min-w-0 max-md:!max-w-full max-md:!px-2.5 max-md:!py-0 max-md:!text-[11px] max-md:!leading-tight';

export default function Client({
  eventId,
  mode = 'admin',
}: {
  eventId: string;
  mode?: 'admin' | 'user';
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasHydrated } = useAuthStore();

  // API에서 지역대회 상세 정보 조회 (훅은 항상 호출하되, mode에 맞는 쪽만 네트워크 요청)
  const adminDetail = useLocalEventDetail(eventId, {
    enabled: mode === 'admin',
  });
  const userDetail = useLocalEventUserDetail(eventId, {
    enabled: mode === 'user',
  });
  const { data: apiData, isLoading, error } =
    mode === 'admin' ? adminDetail : userDetail;

  const adminDelete = useDeleteLocalEvent(eventId);
  const userDelete = useDeleteLocalEventUser(eventId);
  const deleteMutation = mode === 'admin' ? adminDelete : userDelete;

  // 페이지 진입 시 캐시 무효화하여 항상 최신 데이터 가져오기
  React.useEffect(() => {
    queryClient.invalidateQueries({
      queryKey:
        mode === 'admin'
          ? ['admin', 'local-events', 'detail', eventId]
          : ['local-event', 'detail', eventId],
    });
    // refetch는 useLocalEventDetail의 refetchOnMount가 자동으로 처리하므로 제거
  }, [eventId, mode, queryClient]);

  const [showDeleteSuccess, setShowDeleteSuccess] = React.useState(false);

  // NOT_FOUND 에러 처리 (삭제된 대회 직접 링크 등). 삭제 성공 모달 중에는 자동 이동하지 않음(확인 버튼만).
  React.useEffect(() => {
    if (showDeleteSuccess) return;
    if (!error) return;
    const err = error as { httpStatus?: string; code?: string };
    if (err.httpStatus !== 'NOT_FOUND' && err.code !== 'NOT_FOUND_EVENT') return;
    const id = window.setTimeout(() => {
      router.replace(
        mode === 'admin'
          ? '/admin/local-events/management'
          : '/schedule/local?tab=mine'
      );
    }, 1000);
    return () => window.clearTimeout(id);
  }, [error, router, mode, showDeleteSuccess]);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const goList = () =>
    router.replace(
      mode === 'admin'
        ? '/admin/local-events/management?deleted=true'
        : '/schedule/local?tab=mine'
    );

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteMutation.mutateAsync(undefined);
      if (mode === 'admin') {
        queryClient.cancelQueries({ queryKey: ['admin', 'local-events', 'detail', eventId] });
        queryClient.removeQueries({ queryKey: ['admin', 'local-events', 'detail', eventId] });
      } else {
        queryClient.cancelQueries({ queryKey: ['local-event', 'detail', eventId] });
        queryClient.removeQueries({ queryKey: ['local-event', 'detail', eventId] });
      }
      setShowDeleteSuccess(true);
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', error);
    }
  };

  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccess(false);
    goList();
  };

  const handleEdit = () => {
    router.push(
      mode === 'admin'
        ? `/admin/local-events/${eventId}/edit`
        : `/schedule/local/${eventId}/edit`
    );
  };

  const deleteModals = (
    <>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="지역대회 삭제"
        message={'정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'}
        confirmText="삭제하기"
        cancelText="취소"
        isLoading={deleteMutation.isPending}
        variant="danger"
        centerAlign={true}
        multiline={true}
      />
      <SuccessModal
        isOpen={showDeleteSuccess}
        onClose={handleDeleteSuccessClose}
        title="삭제 완료"
        message="지역대회가 삭제되었습니다."
        allowDismissal={false}
      />
    </>
  );

  const userAuthPending = mode === 'user' && !hasHydrated;
  const showUserLoading = mode === 'user' && (isLoading || userAuthPending);

  // 로딩 상태 처리
  if (showUserLoading) {
    return (
      <>
        {deleteModals}
        <LocalEventUserDetailSkeleton goList={goList} />
      </>
    );
  }

  if (mode !== 'user' && isLoading) {
    return (
      <>
        {deleteModals}
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
      </>
    );
  }

  // 에러 상태 처리
  if (error && mode === 'user') {
    return (
      <>
        {deleteModals}
        <div className="mx-auto max-w-[1300px] py-3 px-2.5 sm:px-4 max-[380px]:px-2">
          <LocalEventUserDetailChrome goList={goList} />
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-10 sm:px-6 text-center text-sm sm:text-base text-red-600 font-pretendard">
              지역대회 정보를 불러오는 중 오류가 발생했습니다.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {deleteModals}
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
      </>
    );
  }

  if (!apiData && mode === 'user') {
    return (
      <>
        {deleteModals}
        <div className="mx-auto max-w-[1300px] py-3 px-2.5 sm:px-4 max-[380px]:px-2">
          <LocalEventUserDetailChrome goList={goList} />
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-10 sm:px-6 text-center text-sm sm:text-base text-gray-500 font-pretendard">
              지역대회 정보를 찾을 수 없습니다.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!apiData) {
    return (
      <>
        {deleteModals}
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
      </>
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
  const toRegStatus = (status: string): RegStatus => {
    if (status === 'OPEN') return '접수중';
    if (status === 'PENDING') return '비접수';
    if (status === 'FINAL_CLOSED') return '최종마감';
    if (status === 'UPLOAD_APPLYING') return '업로드신청';
    // CLOSED 및 그 외는 접수마감으로 처리
    return '접수마감';
  };

  const isUser = mode === 'user';

  return (
    <>
      {deleteModals}
      <div
      className={cn(
        'mx-auto max-w-[1300px] py-3',
        isUser ? 'px-2.5 sm:px-4 max-[380px]:px-2' : 'px-4'
      )}
    >
      {/* 헤더 */}
      <div className="mb-4">
        <div className={isUser ? 'py-2 md:py-3' : ''}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goList}
              className={cn(
                'flex min-w-0 items-center text-left text-gray-600 transition-colors hover:text-gray-800 font-pretendard',
                isUser && 'max-[380px]:text-sm'
              )}
            >
              <svg
                className={cn(
                  'mr-1.5 shrink-0 sm:mr-2',
                  isUser ? 'h-4 w-4 max-[380px]:h-3.5 max-[380px]:w-3.5 sm:h-5 sm:w-5' : 'h-5 w-5'
                )}
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
              <span className="max-[380px]:hidden">지역대회 목록으로 돌아가기</span>
              <span className="hidden max-[380px]:inline">돌아가기</span>
            </button>

          {mode === 'admin' ? (
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
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className={cn(
                  'rounded-full bg-[#256EF4] font-medium text-white transition hover:brightness-110 active:scale-[0.98]',
                  isUser
                    ? 'h-8 px-3 text-xs max-[380px]:h-7 max-[380px]:px-2.5 max-[380px]:text-[11px] sm:h-9 sm:px-4 sm:text-[13px]'
                    : 'h-9 px-4 text-[13px]'
                )}
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending}
                className={cn(
                  'rounded-full bg-[#111827] font-medium text-white transition hover:bg-black active:scale-[0.98] disabled:opacity-50',
                  isUser
                    ? 'h-8 px-3 text-xs max-[380px]:h-7 max-[380px]:px-2.5 max-[380px]:text-[11px] sm:h-9 sm:px-4 sm:text-[13px]'
                    : 'h-9 px-4 text-[13px]'
                )}
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}
          </div>
        </div>

        <div className="mb-3">
          <h1
            className={cn(
              'mb-1 font-pretendard font-semibold text-gray-900',
              isUser
                ? 'text-lg max-[380px]:text-base sm:text-xl md:text-2xl'
                : 'text-2xl'
            )}
          >
            {apiData.eventName}
          </h1>
        </div>
      </div>

      {/* 대회 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="bg-gray-100 rounded-t-lg border-l-4 border-blue-500 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2
            className={cn(
              'font-pretendard font-semibold text-gray-900',
              isUser ? 'text-base md:text-xl' : 'text-xl'
            )}
          >
            대회 기본 정보
          </h2>
        </div>
        <div
          className={cn(
            'space-y-4 sm:space-y-6',
            isUser ? 'px-4 py-5 md:px-6 md:py-6' : 'px-6 py-6'
          )}
        >
          {/* 1. 대회명 | 대회 ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회명
              </span>
              <p
                className={cn(
                  'text-gray-900 font-pretendard',
                  isUser ? 'text-sm break-words md:text-lg' : 'text-lg'
                )}
              >
                {apiData.eventName}
              </p>
            </div>
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회 ID
              </span>
              <p
                className={cn(
                  'break-all font-mono text-gray-900 font-pretendard text-sm',
                  isUser && 'text-[11px] md:text-sm'
                )}
              >
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
              <p
                className={cn(
                  'text-gray-900 font-pretendard',
                  isUser ? 'text-sm break-words md:text-lg' : 'text-lg'
                )}
              >
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
                  className={cn(
                    'inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors break-all',
                    isUser && 'text-xs sm:text-sm'
                  )}
                >
                  <span className={cn(isUser ? 'text-xs sm:text-sm' : 'text-sm')}>
                    {apiData.eventUrl}
                  </span>
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
                  className={isUser ? USER_MOBILE_REG_BADGE_CLASS : undefined}
                />
              </div>
            </div>

            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                공개여부
              </span>
              <div className="pt-1">
                {isUser ? (
                  <>
                    <div className="md:hidden">{userVisibilityOutline(apiData.visibleStatus)}</div>
                    <span
                      className={cn(
                        'hidden items-center justify-center rounded-[6px] font-medium md:inline-flex',
                        'h-9 w-[70px] text-[13px] leading-[22px]',
                        apiData.visibleStatus === 'OPEN'
                          ? 'bg-kma-blue text-white'
                          : apiData.visibleStatus === 'TEST'
                            ? 'bg-[#FFA500] text-white'
                            : 'bg-kma-red text-white'
                      )}
                    >
                      {apiData.visibleStatus === 'OPEN'
                        ? '공개'
                        : apiData.visibleStatus === 'TEST'
                          ? '테스트'
                          : '비공개'}
                    </span>
                  </>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* 4. 날짜 정보 */}
          <div
            className={cn(
              'rounded-lg border border-gray-200 bg-gray-50',
              isUser ? 'p-2.5 sm:p-3' : 'p-3'
            )}
          >
            <h3
              className={cn(
                'mb-2 flex items-center gap-2 font-semibold text-gray-900 font-pretendard sm:mb-2.5',
                isUser ? 'text-sm sm:text-base md:text-lg' : 'text-lg'
              )}
            >
              <svg
                className={cn(
                  'shrink-0 text-blue-600',
                  isUser ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5'
                )}
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
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                <span className="mb-1 block text-xs font-medium text-gray-500 font-pretendard sm:mb-2">
                  개최일
                </span>
                <p
                  className={cn(
                    'font-semibold text-gray-900 font-pretendard',
                    isUser ? 'text-xs leading-snug sm:text-sm md:text-lg' : 'text-lg'
                  )}
                >
                  {formatDateTime(apiData.eventStartDate)}
                </p>
              </div>

              {apiData.registStartDate && (
                <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                  <span className="mb-1 block text-xs font-medium text-gray-500 font-pretendard sm:mb-2">
                    신청시작일
                  </span>
                  <p
                    className={cn(
                      'font-semibold text-gray-900 font-pretendard',
                      isUser ? 'text-xs leading-snug sm:text-sm md:text-lg' : 'text-lg'
                    )}
                  >
                    {formatDateTime(apiData.registStartDate)}
                  </p>
                </div>
              )}

              {apiData.registDeadline && (
                <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                  <span className="mb-1 block text-xs font-medium text-gray-500 font-pretendard sm:mb-2">
                    신청 마감일
                  </span>
                  <p
                    className={cn(
                      'font-semibold text-gray-900 font-pretendard',
                      isUser ? 'text-xs leading-snug sm:text-sm md:text-lg' : 'text-lg'
                    )}
                  >
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
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <h2
              className={cn(
                'font-pretendard font-semibold text-gray-900',
                isUser ? 'text-base md:text-xl' : 'text-xl'
              )}
            >
              홍보 배너
            </h2>
          </div>
          <div className="px-2 py-2 sm:px-3 sm:py-3">
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

      {/* 신청자 정보 — 유저(메인)는 회사만, 관리자는 이름·번호·회사 */}
      {(mode === 'admin'
        ? apiData.applicantName || apiData.applicantPhNum || apiData.applicantCompany
        : apiData.applicantCompany?.trim()) ? (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <h2
              className={cn(
                'font-pretendard font-semibold text-gray-900',
                isUser ? 'text-base md:text-xl' : 'text-xl'
              )}
            >
              신청자 정보
            </h2>
          </div>
          <div className={cn(isUser ? 'px-4 py-5 md:px-6 md:py-6' : 'px-6 py-6')}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mode === 'admin' ? (
                <>
                  <div className="space-y-1 px-2">
                    <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                      신청자명
                    </span>
                    <p className="text-lg text-gray-900 font-pretendard">
                      {apiData.applicantName?.trim() ? apiData.applicantName : '—'}
                    </p>
                  </div>
                  <div className="space-y-1 px-2">
                    <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                      신청자 번호
                    </span>
                    <p className="text-lg text-gray-900 font-pretendard">
                      {apiData.applicantPhNum?.trim() ? apiData.applicantPhNum : '—'}
                    </p>
                  </div>
                </>
              ) : null}
              <div
                className={
                  mode === 'admin' ? 'space-y-1 px-2 md:col-span-2' : 'space-y-1 px-2'
                }
              >
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  신청자 회사
                </span>
                <p
                  className={cn(
                    'text-gray-900 font-pretendard',
                    isUser ? 'text-sm break-words md:text-lg' : 'text-lg'
                  )}
                >
                  {apiData.applicantCompany?.trim() ? apiData.applicantCompany : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 생성/수정 정보 */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="rounded-t-lg border-l-4 border-blue-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <h2
            className={cn(
              'font-pretendard font-semibold text-gray-900',
              isUser ? 'text-base md:text-xl' : 'text-xl'
            )}
          >
            생성/수정 정보
          </h2>
        </div>
        <div className={cn(isUser ? 'px-4 py-5 md:px-6 md:py-6' : 'px-6 py-6')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                생성일
              </span>
              <p
                className={cn(
                  'text-gray-900 font-pretendard',
                  isUser ? 'text-sm md:text-lg' : 'text-lg'
                )}
              >
                {formatDateTime(apiData.createdAt)}
              </p>
            </div>
            <div className="space-y-1 px-2">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                수정일
              </span>
              <p
                className={cn(
                  'text-gray-900 font-pretendard',
                  isUser ? 'text-sm md:text-lg' : 'text-lg'
                )}
              >
                {formatDateTime(apiData.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}

