'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { cn } from '@/utils/cn';
import { PREVIEW_BG } from '@/components/admin/Form/competition/parts/theme';
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
  visibleStatus: boolean;
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-pretendard font-semibold text-gray-900">
            대회 기본 정보
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                대회명
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.nameKr}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                영문명
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.nameEng || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                개최일
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {formatDate(eventData.startDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                개최지
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.region}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                주최
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.host}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                주관
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.organizer}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                대회 유형
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.eventType}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                최대 참가자
              </span>
              <span className="text-lg text-gray-900 font-pretendard">
                {eventData.registMaximum
                  ? eventData.registMaximum.toLocaleString()
                  : 0}
                명
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                신청상태
              </span>
              <RegistrationStatusBadge
                status={toRegStatus(eventData.eventStatus)}
                size="smd"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                공개여부
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  eventData.visibleStatus
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {eventData.visibleStatus ? '공개' : '비공개'}
              </span>
            </div>

            {eventData.registStartDate && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 font-pretendard">
                  신청시작일
                </span>
                <span className="text-lg text-gray-900 font-pretendard">
                  {formatDate(eventData.registStartDate)}
                </span>
              </div>
            )}

            {eventData.registDeadline && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 font-pretendard">
                  접수마감
                </span>
                <span className="text-lg text-gray-900 font-pretendard">
                  {formatDate(eventData.registDeadline)}
                </span>
              </div>
            )}

            {eventData.paymentDeadline && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 font-pretendard">
                  입금마감
                </span>
                <span className="text-lg text-gray-900 font-pretendard">
                  {formatDate(eventData.paymentDeadline)}
                </span>
              </div>
            )}

            {/* 은행 / 계좌번호 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">은행</span>
              <span className="text-lg text-gray-900 font-pretendard">{bankName || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">계좌번호</span>
              <span className="text-lg text-gray-900 font-pretendard">{accountNumber || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                메인 색상
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded border border-gray-300',
                    PREVIEW_BG[eventData.mainBannerColor as EventTheme] ||
                      'bg-gray-400'
                  )}
                ></div>
                <span className="text-lg text-gray-900 font-pretendard">
                  {eventData.mainBannerColor}
                </span>
              </div>
            </div>

            {eventData.eventsPageUrl && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 font-pretendard">
                  이벤트 페이지
                </span>
                <a
                  href={eventData.eventsPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-pretendard"
                >
                  링크
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 대회 카테고리 및 참가비 */}
      {eventData.eventCategories && eventData.eventCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
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
          <div className="px-6 py-4 border-b border-gray-200">
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
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          banner.bannerType === 'HOST'
                            ? 'bg-blue-100 text-blue-800'
                            : banner.bannerType === 'ORGANIZER'
                              ? 'bg-green-100 text-green-800'
                              : banner.bannerType === 'SPONSOR'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
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
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          banner.static
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
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
        <div className="px-6 py-4 border-b border-gray-200">
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
