// app/admin/local-events/[eventId]/edit/Client.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import EditForm from './components/EditForm';
import { LocalEventUpdateTransformer } from './api/localEventUpdateTransformer';
import { FormDataBuilder } from './api/formDataBuilder';
import type { LocalEventUpdatePayload } from './api/types';
import { useUpdateLocalEvent } from './api';
import { useLocalEventDetail } from '../api';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import SuccessModal from '@/app/admin/local-events/register/components/parts/SuccessModal';
import LoadingModal from '@/app/admin/local-events/register/components/parts/LoadingModal';

export default function Client({ eventId }: { eventId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateLocalEventMutation = useUpdateLocalEvent(eventId);
  
  // API에서 지역대회 상세 정보 조회
  const { data: apiData, isLoading: isLoadingDetail, error: detailError } = useLocalEventDetail(eventId);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // API 데이터를 폼 prefill 형식으로 변환
  const prefill = useMemo(() => {
    if (!apiData) return undefined;

    // ISO 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (isoString: string) => {
      return isoString.split('T')[0];
    };

    // ISO 날짜에서 시간 추출 (백엔드 데이터를 5분 단위로 반올림)
    const extractTime = (isoString: string) => {
      // ISO 형식: "2026-01-21T00:00:00" 또는 "2026-01-21T00:00:00Z"
      // T 이후의 시간 부분을 직접 추출
      const timeMatch = isoString.match(/T(\d{2}):(\d{2}):/);
      if (timeMatch) {
        const hh = parseInt(timeMatch[1], 10);
        const mm = parseInt(timeMatch[2], 10);
        // 분을 5분 단위로 반올림 (0~55 범위)
        const roundedMm = Math.min(Math.round(mm / 5) * 5, 55);
        return {
          hh: String(hh).padStart(2, '0'), // 시간
          mm: String(roundedMm).padStart(2, '0'), // 분 (5분 단위)
        };
      }
      // 매칭 실패 시 기본값
      return {
        hh: '00',
        mm: '00',
      };
    };

    const eventStartTime = extractTime(apiData.eventStartDate);
    const registStartTime = extractTime(apiData.registStartDate);
    const registDeadlineTime = extractTime(apiData.registDeadline);

    // FINAL_CLOSED는 폼에서 지원하지 않으므로 CLOSED로 변환
    const normalizedEventStatus: 'PENDING' | 'OPEN' | 'CLOSED' = 
      apiData.eventStatus === 'FINAL_CLOSED' ? 'CLOSED' : apiData.eventStatus;

    return {
      eventName: apiData.eventName,
      eventUrl: apiData.eventUrl,
      eventStatus: normalizedEventStatus,
      visibleStatus: apiData.visibleStatus,
      eventCategoryCsv: apiData.eventCategoryCsv ?? '',
      eventStartDate: formatDate(apiData.eventStartDate),
      eventStartHh: eventStartTime.hh,
      eventStartMm: eventStartTime.mm,
      registStartDate: formatDate(apiData.registStartDate),
      registStartHh: registStartTime.hh,
      registStartMm: registStartTime.mm,
      registDeadline: formatDate(apiData.registDeadline),
      registDeadlineHh: registDeadlineTime.hh,
      registDeadlineMm: registDeadlineTime.mm,
      existingPromotionBanner: apiData.promotionBanner,
    };
  }, [apiData]);

  /**
   * 지역대회 수정 처리 함수
   */
  const handleUpdate = async (payload: LocalEventUpdatePayload) => {
    try {
      // 1. 데이터 변환
      const { localEventUpdateRequest, promotionBanner } =
        LocalEventUpdateTransformer.transformToServerFormat(payload);

      // 2. 이미지 유효성 검증 (홍보 배너는 선택사항)
      const validation = LocalEventUpdateTransformer.validateImages(promotionBanner);
      if (!validation.isValid) {
        setErrorMessage(`이미지 업로드 오류\n\n${validation.errors.join('\n')}`);
        setErrorModalOpen(true);
        return;
      }

      // 3. FormData 생성
      const formData = FormDataBuilder.buildLocalEventUpdateFormData(
        localEventUpdateRequest,
        promotionBanner
      );

      // 4. 로딩 모달 표시
      setLoadingModalOpen(true);

      // 5. 지역대회 수정 API 호출
      await new Promise<void>((resolve, reject) => {
        updateLocalEventMutation.mutate(formData, {
          onSuccess: async () => {
            resolve();
          },
          onError: (error: Error) => {
            reject(error);
          },
        });
      });

      // 성공 시 로딩 모달 닫고 성공 모달 표시
      setLoadingModalOpen(false);
      setSuccessModalOpen(true);
    } catch (error) {
      // 오류 발생 시 로딩 모달 닫기
      setLoadingModalOpen(false);
      // 오류 상세 로그
      const errorMsg = error instanceof Error ? error.message : '지역대회 수정 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    }
  };

  const handleViewDetail = () => {
    setSuccessModalOpen(false);
    router.replace(`/admin/local-events/${eventId}`);
  };

  const handleBackToList = () => {
    setSuccessModalOpen(false);
    router.replace('/admin/local-events/management');
  };

  // 로딩 상태 처리
  if (isLoadingDetail) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-pretendard">
              지역대회 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 에러 상태 처리
  if (detailError) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-pretendard font-semibold text-gray-900 mb-4">
              데이터를 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 font-pretendard mb-6">
              지역대회 정보를 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!apiData || !prefill) {
    return (
      <main className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-pretendard font-semibold text-gray-900 mb-4">
              지역대회 정보가 없습니다
            </h2>
            <p className="text-gray-600 font-pretendard mb-6">
              해당 지역대회의 정보를 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <EditForm
        prefill={prefill}
        onUpdate={handleUpdate}
        onBack={() => router.push(`/admin/local-events/${eventId}`)}
      />
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="오류"
        message={errorMessage}
      />
      <SuccessModal
        isOpen={successModalOpen}
        onViewDetail={handleViewDetail}
        onBackToList={handleBackToList}
      />
      <LoadingModal
        isOpen={loadingModalOpen}
        message="지역대회 수정 중..."
      />
    </main>
  );
}

