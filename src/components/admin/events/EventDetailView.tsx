'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { cn } from '@/utils/cn';
import { PREVIEW_BG } from '@/app/admin/events/register/components/parts/theme';
import type { EventTheme } from '@/types/event';

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
  mainOutlinePcImageUrl?: string;
  mainOutlineMobileImageUrl?: string;
  eventOutlinePageImageUrl?: string;
  noticePageImageUrl?: string;
  souvenirPageImageUrl?: string;
  meetingPlacePageImageUrl?: string;
  resultImageUrl?: string;
  coursePageImageUrl?: string;
  eventsPageUrl?: string;
  eventStatus: string;
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  registDeadline?: string;
  paymentDeadline?: string;
  /** 은행명 (예: 국민은행) */
  bank?: string;
  /** 가상계좌/입금 계좌번호 */
  virtualAccount?: string;
  eventCategories?: Array<{
    id: string;
    name: string;
    amount?: number;
    souvenirs: Array<{
      id: string;
      name: string;
      sizes?: string;
      eventCategoryId: string;
    }>;
  }>;
  eventBanners?: Array<{
    id: string;
    imageUrl: string;
    url: string;
    providerName: string;
    bannerType: string;
    static: boolean;
  }>;
};

type Props = {
  eventData: EventDetailData;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
};

export default function EventDetailView({
  eventData,
  onEdit,
  onDelete,
  onBack,
}: Props) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 결제정보(은행/계좌) - eventData에서 직접 가져오기
  const bankName = eventData.bank || '';
  const accountNumber = eventData.virtualAccount || '';

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

  const handleDelete = async () => {
    if (
      !window.confirm('정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')
    ) {
      return;
    }
    if (onDelete) {
      await onDelete();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 서버 이벤트 상태값 → 신청상태(RegStatus) 매핑
  const toRegStatus = (status: string): RegStatus => {
    if (status === 'OPEN' || status === 'ONGOING') return '접수중';
    if (status === 'PENDING') return '비접수';
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

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
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
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50 font-pretendard"
            >
              삭제
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

        <div className="mb-6">
          <h1 className="text-3xl font-pretendard font-semibold text-gray-900 mb-2">
            {eventData.nameKr}
          </h1>
          {eventData.nameEng && (
            <p className="text-lg text-gray-600 font-pretendard">
              {eventData.nameEng}
            </p>
          )}
        </div>
      </div>

      {/* 대회 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="bg-gray-100 rounded-t-lg px-6 py-4 border-l-4 border-blue-500">
          <h2 className="text-xl font-pretendard font-semibold text-gray-900">
            대회 기본 정보
          </h2>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* 1. 대회명 | 영문명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                대회명
              </span>
              <p className="text-lg font-semibold text-gray-900 font-pretendard">
                {eventData.nameKr}
              </p>
            </div>

            {eventData.nameEng && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  영문명
                </span>
                <p className="text-lg font-semibold text-gray-900 font-pretendard">
                  {eventData.nameEng}
                </p>
              </div>
            )}
          </div>

          {/* 2. 개최지 | 참가인원 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                개최지
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {eventData.region}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                참가인원
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {eventData.registMaximum
                  ? eventData.registMaximum.toLocaleString()
                  : 0}
                명
              </p>
            </div>
          </div>

          {/* 3. 주최 | 주관 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                주최
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {eventData.host}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                주관
              </span>
              <p className="text-lg text-gray-900 font-pretendard">
                {eventData.organizer}
              </p>
            </div>
          </div>

          {/* 4. 신청상태 | 공개여부 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* 5. 메인색상 | 이벤트페이지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                메인 색상
              </span>
              <div className="flex items-center gap-3 pt-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm',
                    PREVIEW_BG[eventData.mainBannerColor as EventTheme] ||
                      'bg-gray-400'
                  )}
                ></div>
                <span className="text-base text-gray-900 font-pretendard font-medium">
                  {eventData.mainBannerColor}
                </span>
              </div>
            </div>

            {eventData.eventsPageUrl && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 font-pretendard uppercase tracking-wide">
                  이벤트 페이지
                </span>
                <div className="pt-1">
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
                </div>
              </div>
            )}
          </div>

          {/* 6. 결제 정보 - 맨 아래 */}
          {(bankName || accountNumber) && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-pretendard mb-5 flex items-center gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bankName && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                      은행
                    </span>
                    <p className="text-lg font-semibold text-gray-900 font-pretendard">
                      {bankName}
                    </p>
                  </div>
                )}
                {accountNumber && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                      계좌번호
                    </span>
                    <p className="text-lg font-semibold font-mono text-gray-900 font-pretendard">
                      {accountNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. 날짜 정보 - 맨 아래 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-pretendard mb-5 flex items-center gap-2">
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
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                  개최일
                </span>
                <p className="text-lg font-semibold text-gray-900 font-pretendard">
                  {formatDate(eventData.startDate)}
                </p>
              </div>

              {eventData.registStartDate && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    신청시작일
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.registStartDate)}
                  </p>
                </div>
              )}

              {eventData.registDeadline && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    접수마감
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.registDeadline)}
                  </p>
                </div>
              )}

              {eventData.paymentDeadline && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-medium text-gray-500 font-pretendard block mb-2">
                    입금마감
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-pretendard">
                    {formatDate(eventData.paymentDeadline)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 대회 카테고리 및 참가비 */}
      {eventData.eventCategories && eventData.eventCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="bg-gray-100 rounded-t-lg px-6 py-4 border-l-4 border-blue-500">
            <h2 className="text-xl font-pretendard font-semibold text-gray-900">
              대회 카테고리 및 참가비
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              {eventData.eventCategories.map(category => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-pretendard font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <span className="text-xl font-pretendard font-semibold text-blue-600">
                      {category.amount ? category.amount.toLocaleString() : 0}원
                    </span>
                  </div>

                  {category.souvenirs && category.souvenirs.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-pretendard font-medium text-gray-700 mb-2">
                        기념품
                      </h4>
                      <div className="space-y-2">
                        {category.souvenirs.map(souvenir => (
                          <div
                            key={souvenir.id}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-pretendard text-gray-900">
                              {souvenir.name}
                            </span>
                            {souvenir.sizes && (
                              <span className="text-xs font-pretendard text-gray-600">
                                {souvenir.sizes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 배너 이미지들 */}
      {eventData.eventBanners && eventData.eventBanners.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="bg-gray-100 rounded-t-lg px-6 py-4 border-l-4 border-blue-500">
            <h2 className="text-xl font-pretendard font-semibold text-gray-900">
              배너 이미지
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventData.eventBanners.map((banner, index) => (
                <div
                  key={banner.id || banner.imageUrl || `${banner.bannerType}-${banner.providerName}-${index}`}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="mb-3">
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
                                ? 'bg-gray-600'
                                : 'bg-gray-600'
                        }`}
                      >
                        {banner.bannerType === 'HOST'
                          ? '주최'
                          : banner.bannerType === 'ORGANIZER'
                            ? '주관'
                            : banner.bannerType === 'SPONSOR'
                              ? '후원'
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="bg-gray-100 rounded-t-lg px-6 py-4 border-l-4 border-blue-500">
          <h2 className="text-xl font-pretendard font-semibold text-gray-900">
            대회 이미지
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 홍보용(인스타배너) */}
            {eventData.promotionBanner && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  홍보용(인스타배너)
                </h3>
                <img
                  src={eventData.promotionBanner}
                  alt="홍보용(인스타배너)"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.promotionBanner)}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 대회메인 배너-데스크탑 */}
            {eventData.mainBannerPcImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  대회메인 배너(데스크탑)
                </h3>
                <img
                  src={eventData.mainBannerPcImageUrl}
                  alt="대회메인 배너(데스크탑)"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 대회메인 배너-모바일 */}
            {eventData.mainBannerMobileImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  대회메인 배너(모바일)
                </h3>
                <img
                  src={eventData.mainBannerMobileImageUrl}
                  alt="대회메인 배너(모바일)"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 사이드메뉴배너 */}
            {eventData.sideMenuBannerImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  사이드메뉴배너
                </h3>
                <img
                  src={eventData.sideMenuBannerImageUrl}
                  alt="사이드메뉴배너"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 대회메인 중간배너 PC */}
            {eventData.mainOutlinePcImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                대회메인 중간배너(PC)
                </h3>
                <img
                  src={eventData.mainOutlinePcImageUrl}
                  alt="대회메인 중간배너(PC)"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 대회메인 중간배너 모바일 */}
            {eventData.mainOutlineMobileImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                대회메인 중간배너(모바일)
                </h3>
                <img
                  src={eventData.mainOutlineMobileImageUrl}
                  alt="대회메인 중간배너(모바일)"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 이벤트 아웃라인 페이지 */}
            {eventData.eventOutlinePageImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  대회요강 페이지
                </h3>
                <img
                  src={eventData.eventOutlinePageImageUrl}
                  alt="대회요강 페이지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  대회 유의사항 페이지
                </h3>
                <img
                  src={eventData.noticePageImageUrl}
                  alt="대회 유의사항 페이지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  기념품 페이지
                </h3>
                <img
                  src={eventData.souvenirPageImageUrl}
                  alt="기념품 페이지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  집합장소 페이지
                </h3>
                <img
                  src={eventData.meetingPlacePageImageUrl}
                  alt="집합장소 페이지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 결과 이미지 */}
            {eventData.resultImageUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  인증서 배경 이미지
                </h3>
                <img
                  src={eventData.resultImageUrl}
                  alt="인증서 배경 이미지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(eventData.resultImageUrl)}
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
                <h3 className="text-lg font-pretendard font-medium text-gray-900">
                  대회코스 페이지
                </h3>
                <img
                  src={eventData.coursePageImageUrl}
                  alt="대회코스 페이지"
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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
    </div>
  );
}
