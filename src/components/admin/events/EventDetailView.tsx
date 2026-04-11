'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { cn } from '@/utils/cn';
import { PREVIEW_BG } from '@/app/admin/events/register/components/parts/theme';
import type { EventTheme } from '@/types/event';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';

export type EventDetailData = {
  id: string;
  nameKr: string;
  nameEng?: string;
  startDate: string;
  /** 신청 시작일 (ISO 8601) */
  registStartDate?: string;
  region: string;
  eventType: string;
  promotionBanner?: string;
  host: string;
  organizer: string;
  registMaximum?: number;
  mainBannerColor: string;
  mainBannerPcImageUrl?: string;
  mainBannerMobileImageUrl?: string;
  sideMenuBannerImageUrl?: string; // 사이드메뉴배너(herosection 이미지)
  /** 사이드 광고 배너 */
  eventAdvertiseBannerUrl?: string | null;
  mainOutlinePcImageUrl?: string;
  mainOutlineMobileImageUrl?: string;
  eventOutlinePageImageUrl?: string;
  noticePageImageUrl?: string;
  souvenirPageImageUrl?: string;
  meetingPlacePageImageUrl?: string;
  resultImageUrl?: string;
  coursePageImageUrl?: string;
  eventsPageUrl?: string;
  /** 통계 페이지 URL */
  statisticsUrl?: string;
  eventStatus: string;
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  registDeadline?: string;
  paymentDeadline?: string;
  /** 전체 동의 체크박스 라벨 */
  agreeAllLabel?: string;
  /** 은행명 (예: 국민은행) */
  bank?: string;
  /** 가상계좌/입금 계좌번호 */
  virtualAccount?: string;
  /** 예금주명 (선택) */
  accountHolderName?: string;
  eventCategories?: Array<{
    id: string;
    name: string;
    amount?: number;
    isActive?: boolean;
    souvenirs: Array<{
      id: string;
      name: string;
      sizes?: string;
      eventCategoryId: string;
      isActive?: boolean;
    }>;
  }>;
  eventBanners?: Array<{
    id: string;
    imageUrl: string;
    url: string;
    providerName: string;
    bannerType: string;
    static: boolean;
    badge?: boolean;
  }>;
  /** 약관 (API: termsInfo / eventTerms / eventTerm) */
  eventTerms?: Array<{
    id?: string;
    content: string;
    termsLabel?: string;
    required?: boolean;
    sortOrder: number;
  }>;
};

type Props = {
  eventData: EventDetailData;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
};

/** 약관 본문: 2줄 클램프 시 실제로 잘릴 때만 더보기/접기 표시 */
function EventTermBody({
  content,
  isExpanded,
  onToggle,
}: {
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [clampedOverflows, setClampedOverflows] = useState(false);

  const measureClampedOverflow = useCallback(() => {
    const el = bodyRef.current;
    if (!el || isExpanded) return;
    // line-clamp 적용 시 숨겨진 영역이 있으면 scrollHeight > clientHeight
    setClampedOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [isExpanded, content]);

  useLayoutEffect(() => {
    measureClampedOverflow();
  }, [measureClampedOverflow]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measureClampedOverflow());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureClampedOverflow]);

  const showToggle = isExpanded || clampedOverflows;

  return (
    <>
      <p
        ref={bodyRef}
        className={cn(
          'text-sm text-gray-700 font-pretendard leading-relaxed',
          isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2 break-words'
        )}
      >
        {content}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 font-pretendard"
        >
          {isExpanded ? '접기' : '더보기'}
        </button>
      )}
    </>
  );
}

export default function EventDetailView({
  eventData,
  onEdit,
  onDelete,
  onBack,
}: Props) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  /** 약관 조항별 본문 펼침 (상세 조회용) */
  const [expandedTermKeys, setExpandedTermKeys] = useState<Set<string>>(
    () => new Set()
  );
  
  // 결제정보(은행/계좌) - eventData에서 직접 가져오기
  const bankName = eventData.bank || '';
  const accountNumber = eventData.virtualAccount || '';
  const accountHolderName = eventData.accountHolderName || '';

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/admin/events/${eventData.id}/edit`);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/admin/events/management');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${datePart} ${hours}시 ${minutes}분`;
  };

  // 서버 이벤트 상태값 → 신청상태(RegStatus) 매핑
  const toRegStatus = (status: string): RegStatus => {
    if (status === 'OPEN' || status === 'ONGOING') return '접수중';
    if (status === 'PENDING') return '비접수';
    if (status === 'FINAL_CLOSED') return '최종마감';
    // CLOSED, COMPLETED, 그 외는 모두 접수마감으로 처리
    return '접수마감';
  };

  const handleImageClick = (imageUrl?: string) => {
    if (!imageUrl) return;
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-4">
      {/* 헤더 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
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
            대회 목록으로 돌아가기
          </button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleDeleteClick}
              className="text-red-600 border-red-600 hover:bg-red-50 font-pretendard"
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
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

        <div className="mb-4">
          <h1 className="text-2xl font-pretendard font-semibold text-gray-900 mb-1">
            {eventData.nameKr}
          </h1>
          {eventData.nameEng && (
            <p className="text-base text-gray-600 font-pretendard">
              {eventData.nameEng}
            </p>
          )}
        </div>
      </div>

      {/* 대회 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="bg-gray-100 rounded-t-lg px-5 py-3 border-l-4 border-blue-500">
          <h2 className="text-lg font-pretendard font-semibold text-gray-900">
            대회 기본 정보
          </h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* 1. 대회명 | 영문명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회명
              </span>
              <p className="text-base font-semibold text-gray-900 font-pretendard">
                {eventData.nameKr}
              </p>
            </div>

            {eventData.nameEng && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  영문명
                </span>
                <p className="text-base font-semibold text-gray-900 font-pretendard">
                  {eventData.nameEng}
                </p>
              </div>
            )}
          </div>

          {/* 2. 개최지 | 참가인원 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                개최지
              </span>
              <p className="text-base text-gray-900 font-pretendard">
                {eventData.region}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                참가인원
              </span>
              <p className="text-base text-gray-900 font-pretendard">
                {eventData.registMaximum
                  ? eventData.registMaximum.toLocaleString()
                  : 0}
                명
              </p>
            </div>
          </div>

          {/* 3. 주최 | 주관 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                주최
              </span>
              <p className="text-base text-gray-900 font-pretendard">
                {eventData.host}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                주관
              </span>
              <p className="text-base text-gray-900 font-pretendard">
                {eventData.organizer}
              </p>
            </div>
          </div>

          {/* 4. 신청상태 | 공개여부 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                신청상태
              </span>
              <div className="pt-1">
                <RegistrationStatusBadge
                  status={toRegStatus(eventData.eventStatus)}
                  size="smd"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                공개여부
              </span>
              <div className="pt-1">
                <span
                  className={`inline-flex items-center justify-center w-[70px] h-9 rounded-[6px] text-[13px] leading-[22px] font-medium ${
                    eventData.visibleStatus === 'OPEN'
                      ? 'bg-kma-blue text-white'
                      : eventData.visibleStatus === 'TEST'
                        ? 'bg-[#FFA500] text-white'
                        : 'bg-kma-red text-white'
                  }`}
                >
                  {eventData.visibleStatus === 'OPEN'
                    ? '공개'
                    : eventData.visibleStatus === 'TEST'
                      ? '테스트'
                      : '비공개'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. 이벤트페이지 | 통계페이지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventData.eventsPageUrl && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  이벤트 페이지
                </span>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href={eventData.eventsPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                    링크 열기
                  </a>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleCopyUrl(eventData.eventsPageUrl!)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors"
                  >
                    {copiedUrl === eventData.eventsPageUrl ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        복사하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {eventData.statisticsUrl && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  통계 페이지
                </span>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href={eventData.statisticsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                    링크 열기
                  </a>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleCopyUrl(eventData.statisticsUrl!)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium font-pretendard transition-colors"
                  >
                    {copiedUrl === eventData.statisticsUrl ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        복사하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. 메인 색상 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                메인 색상
              </span>
              <div className="flex items-center gap-3 pt-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm',
                    PREVIEW_BG[eventData.mainBannerColor as EventTheme] ||
                      'bg-gray-400'
                  )}
                ></div>
                <span className="text-sm text-gray-900 font-pretendard font-medium">
                  {eventData.mainBannerColor}
                </span>
              </div>
            </div>
          </div>

          {/* 7. 결제 정보 - 맨 아래 */}
          {(bankName || accountNumber || eventData.accountHolderName != null) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 font-pretendard mb-3 flex items-center gap-2">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                결제 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {bankName && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                      은행
                    </span>
                    <p className="text-base font-semibold text-gray-900 font-pretendard">
                      {bankName}
                    </p>
                  </div>
                )}
                {accountNumber && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                      계좌번호
                    </span>
                    <p className="text-base font-semibold font-mono text-gray-900 font-pretendard">
                      {accountNumber}
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    예금주명
                  </span>
                  <p className="text-base font-semibold text-gray-900 font-pretendard">
                    {accountHolderName || '없음'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. 날짜 정보 - 맨 아래 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 font-pretendard mb-3 flex items-center gap-2">
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
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                  개최일
                </span>
                <p className="text-base font-semibold text-gray-900 font-pretendard">
                  {formatDate(eventData.startDate)}
                </p>
              </div>

              {eventData.registStartDate && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    신청시작일
                  </span>
                  <p className="text-base font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.registStartDate)}
                  </p>
                </div>
              )}

              {eventData.registDeadline && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    접수마감
                  </span>
                  <p className="text-base font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.registDeadline)}
                  </p>
                </div>
              )}

              {eventData.paymentDeadline && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    입금마감
                  </span>
                  <p className="text-base font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.paymentDeadline)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 8. 약관 정보 (날짜 정보 바로 아래) */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 font-pretendard mb-1 flex items-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              약관 정보
            </h3>
            <p className="text-xs text-gray-500 font-pretendard mb-3">
              참가 신청 화면에 노출되는 약관입니다.
            </p>

            {eventData.eventTerms && eventData.eventTerms.length > 0 ? (
              <div className="space-y-3">
                {eventData.eventTerms.map((term, idx) => {
                  const termKey = term.id ?? `term-${idx}`;
                  const isExpanded = expandedTermKeys.has(termKey);
                  const content = term.content ?? '';

                  const toggleTerm = () => {
                    setExpandedTermKeys(prev => {
                      const next = new Set(prev);
                      if (next.has(termKey)) next.delete(termKey);
                      else next.add(termKey);
                      return next;
                    });
                  };

                  return (
                    <div
                      key={termKey}
                      className="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "text-[11px] px-2 py-0.5 rounded-full font-semibold",
                            term.required ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"
                          )}
                        >
                          {term.required ? "필수" : "선택"}
                        </span>
                        <p className="text-sm font-bold text-gray-900 font-pretendard">
                          {term.termsLabel?.trim() || `약관 ${idx + 1}`}
                        </p>
                      </div>
                      <EventTermBody
                        content={content}
                        isExpanded={isExpanded}
                        onToggle={toggleTerm}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600 font-pretendard">
                  등록된 약관이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 대회 카테고리 및 참가비 */}
      {eventData.eventCategories && eventData.eventCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="bg-gray-100 rounded-t-lg px-5 py-3 border-l-4 border-blue-500">
            <h2 className="text-lg font-pretendard font-semibold text-gray-900">
              대회 카테고리 및 참가비
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-3">
              {eventData.eventCategories.map(category => {
                const isCategoryActive = category.isActive !== false; // 기본값은 true
                return (
                  <div
                    key={category.id}
                    className={cn(
                      "border border-gray-200 rounded-lg p-3",
                      isCategoryActive ? "bg-white" : "bg-gray-100"
                    )}
                  >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-pretendard font-medium text-gray-900">
                        {category.name}
                      </h3>
                      {!isCategoryActive && (
                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded whitespace-nowrap font-medium">
                          마감
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-pretendard font-semibold text-blue-600">
                      {category.amount ? category.amount.toLocaleString() : 0}원
                    </span>
                  </div>

                  {category.souvenirs && category.souvenirs.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-pretendard font-medium text-gray-700 mb-2">
                        기념품
                      </h4>
                      <div className="space-y-2">
                        {category.souvenirs.map(souvenir => {
                          const isSouvenirActive = souvenir.isActive !== false; // 기본값은 true
                          return (
                            <div
                              key={souvenir.id}
                              className={cn(
                                "flex items-center justify-between py-2 px-3 rounded",
                                isSouvenirActive 
                                  ? "bg-gray-50" 
                                  : "bg-gray-100" // 기념품 마감된 경우 진한 회색
                              )}
                            >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-pretendard text-gray-900">
                                {souvenir.name}
                              </span>
                              {!isSouvenirActive && (
                                <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded whitespace-nowrap font-medium">
                                  마감
                                </span>
                              )}
                            </div>
                            {souvenir.sizes && (
                              <span className="text-xs font-pretendard text-gray-600">
                                {souvenir.sizes}
                              </span>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 배너 이미지들 */}
      {eventData.eventBanners && eventData.eventBanners.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="bg-gray-100 rounded-t-lg px-5 py-3 border-l-4 border-blue-500">
            <h2 className="text-lg font-pretendard font-semibold text-gray-900">
              배너 이미지
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {eventData.eventBanners.map((banner, index) => (
                <div
                  key={banner.id || banner.imageUrl || `${banner.bannerType}-${banner.providerName}-${index}`}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="mb-2">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.providerName}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(banner.imageUrl)}
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // 이미지 로딩 실패 시 플레이스홀더 표시
                          const placeholder =
                            target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    {/* 이미지가 없거나 로딩 실패 시 플레이스홀더 */}
                    <div
                      className={`w-full h-32 bg-gray-100 border border-gray-200 rounded flex items-center justify-center ${banner.imageUrl ? 'hidden' : 'flex'}`}
                    >
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs font-pretendard">
                          {banner.imageUrl ? '이미지 로딩 실패' : '이미지 없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-pretendard font-medium text-gray-700">
                        제공자
                      </span>
                      <span className="text-sm font-pretendard text-gray-900">
                        {banner.providerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-pretendard font-medium text-gray-700">
                        타입
                      </span>
                      <span
                        className={`inline-flex items-center justify-center rounded-[6px] text-[13px] leading-[22px] font-medium px-3 text-white ${
                          banner.bannerType === 'HOST'
                            ? 'bg-kma-red'
                            : banner.bannerType === 'ORGANIZER'
                              ? 'bg-kma-blue'
                              : banner.bannerType === 'SPONSOR'
                                ? 'bg-amber-500'
                                : banner.bannerType === 'ASSIST'
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-600'
                        }`}
                      >
                        {banner.bannerType === 'HOST'
                          ? '주최'
                          : banner.bannerType === 'ORGANIZER'
                            ? '주관'
                            : banner.bannerType === 'SPONSOR'
                              ? '후원'
                              : banner.bannerType === 'ASSIST'
                                ? '협력'
                                : banner.bannerType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-pretendard font-medium text-gray-700">
                        고정여부
                      </span>
                      <span
                        className={`inline-flex items-center justify-center rounded-[6px] text-[13px] leading-[22px] font-medium px-3 ${
                          banner.static
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {banner.static ? '고정' : '회전'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-pretendard font-medium text-gray-700">
                        배지표시여부
                      </span>
                      <span
                        className={`inline-flex items-center justify-center rounded-[6px] text-[13px] leading-[22px] font-medium px-3 ${
                          banner.badge !== false
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {banner.badge !== false ? '공개' : '비공개'}
                      </span>
                    </div>
                    {banner.url && (
                      <div className="pt-2">
                        <a
                          href={banner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm font-pretendard"
                        >
                          링크 보기
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 대회 이미지들 */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="bg-gray-100 rounded-t-lg px-5 py-3 border-l-4 border-blue-500">
          <h2 className="text-lg font-pretendard font-semibold text-gray-900">
            대회 이미지
          </h2>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 대회 메인배너(데스크탑) */}
            {eventData.mainBannerPcImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회 메인배너(데스크탑)
                </h3>
                <img
                  src={eventData.mainBannerPcImageUrl}
                  alt="대회 메인배너(데스크탑)"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.mainBannerPcImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 대회 메인배너(모바일) */}
            {eventData.mainBannerMobileImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회 메인배너(모바일)
                </h3>
                <img
                  src={eventData.mainBannerMobileImageUrl}
                  alt="대회 메인배너(모바일)"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.mainBannerMobileImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 대회 중간배너(데스크탑) */}
            {eventData.mainOutlinePcImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회 중간배너(데스크탑)
                </h3>
                <img
                  src={eventData.mainOutlinePcImageUrl}
                  alt="대회 중간배너(데스크탑)"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.mainOutlinePcImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 대회 중간배너(모바일) */}
            {eventData.mainOutlineMobileImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회 중간배너(모바일)
                </h3>
                <img
                  src={eventData.mainOutlineMobileImageUrl}
                  alt="대회 중간배너(모바일)"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.mainOutlineMobileImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 인스타배너(홍보용) */}
            {eventData.promotionBanner && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  인스타배너(홍보용)
                </h3>
                <img
                  src={eventData.promotionBanner}
                  alt="인스타배너(홍보용)"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.promotionBanner)}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 사이드 메뉴배너 */}
            {eventData.sideMenuBannerImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  사이드 메뉴배너
                </h3>
                <img
                  src={eventData.sideMenuBannerImageUrl}
                  alt="사이드 메뉴배너"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.sideMenuBannerImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 사이드 광고 배너 */}
            {eventData.eventAdvertiseBannerUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  사이드 광고 배너
                </h3>
                <img
                  src={eventData.eventAdvertiseBannerUrl}
                  alt="사이드 광고 배너"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(
                      eventData.eventAdvertiseBannerUrl ?? undefined
                    )
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 인증서 배경 이미지 */}
            {eventData.resultImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  인증서 배경 이미지
                </h3>
                <img
                  src={eventData.resultImageUrl}
                  alt="인증서 배경 이미지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.resultImageUrl)}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 이벤트 아웃라인 페이지 */}
            {eventData.eventOutlinePageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회요강 페이지
                </h3>
                <img
                  src={eventData.eventOutlinePageImageUrl}
                  alt="대회요강 페이지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.eventOutlinePageImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 공지사항 페이지 */}
            {eventData.noticePageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회 유의사항 페이지
                </h3>
                <img
                  src={eventData.noticePageImageUrl}
                  alt="대회 유의사항 페이지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.noticePageImageUrl)}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 기념품 페이지 */}
            {eventData.souvenirPageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  기념품 페이지
                </h3>
                <img
                  src={eventData.souvenirPageImageUrl}
                  alt="기념품 페이지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.souvenirPageImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 집합장소 페이지 */}
            {eventData.meetingPlacePageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  집합장소 페이지
                </h3>
                <img
                  src={eventData.meetingPlacePageImageUrl}
                  alt="집합장소 페이지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    handleImageClick(eventData.meetingPlacePageImageUrl)
                  }
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 코스 페이지 */}
            {eventData.coursePageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-base font-pretendard font-medium text-gray-900">
                  대회코스 페이지
                </h3>
                <img
                  src={eventData.coursePageImageUrl}
                  alt="대회코스 페이지"
                  className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.coursePageImageUrl)}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
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
            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="대회 삭제"
        message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        isLoading={isDeleting}
        variant="danger"
        centerAlign={true}
        multiline={true}
      />
    </div>
  );
}
