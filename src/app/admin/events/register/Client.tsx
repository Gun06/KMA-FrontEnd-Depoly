// app/admin/events/register/Client.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateForm from './components/CreateForm';
import { EventDataTransformer } from './api/eventDataTransformer';
import { FormDataBuilder } from './api/formDataBuilder';
import type { EventCreatePayload } from './api/types';
import { createImageUploadErrorMessage } from '@/utils/errorHandler';
import { useCreateEvent, updateAllPageImages } from './api';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import SuccessModal from './components/parts/SuccessModal';
import LoadingModal from './components/parts/LoadingModal';
import { FormStateStorage } from './utils/formStateStorage';

export default function Client() {
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPartialSuccessError, setIsPartialSuccessError] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const createdEventIdRef = useRef<string | null>(null);

  /**
   * 대회 등록 처리 함수
   */
  const handleRegister = async (payload: EventCreatePayload) => {
    // 이미 생성된 대회가 있으면 재생성 대신 수정 페이지로 이동
    if (createdEventIdRef.current) {
      router.replace(`/admin/events/${createdEventIdRef.current}/edit`);
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    let userNotified = false;

    try {
      // 1. 데이터 변환 및 검증
      const { eventCreateRequest, imageFiles } =
        EventDataTransformer.transformToServerFormat(payload);

      // 2. 이미지 유효성 검증
      const validation = EventDataTransformer.validateImages(imageFiles);
      if (!validation.isValid) {
        const errorMsg = createImageUploadErrorMessage(validation.errors);
        setErrorMessage(`이미지 업로드 오류\n\n누락된 이미지:\n${errorMsg}\n\n위 이미지들을 모두 업로드해주세요.`);
        setIsPartialSuccessError(false);
        setErrorModalOpen(true);
        userNotified = true;
        throw new Error('IMAGE_VALIDATION_FAILED');
      }

      // 3. FormData 생성
      const formData = FormDataBuilder.buildEventCreateFormData(
        eventCreateRequest,
        imageFiles
      );

      // 4. 로딩 모달 표시
      setLoadingModalOpen(true);

      // 5. 대회 생성 API 호출
      const eventId = await new Promise<string>((resolve, reject) => {
        createEventMutation.mutate(formData, {
          onSuccess: async (data) => {
            if (data == null) {
              reject(new Error('대회 생성에 실패했습니다.'));
              return;
            }

            // 서버가 문자열(UUID 등) 또는 숫자로 응답하는 경우 모두 대비
            const idMaybe = typeof data === 'string' ? data : data.id;
            const stringId = String(idMaybe);

            resolve(stringId);
          },
          onError: (error: Error) => {
            reject(error);
          },
        });
      });

      // 생성 성공 직후 ID 저장 → 이후 중복 create API 호출 방지
      createdEventIdRef.current = eventId;
      setCreatedEventId(eventId);

      // 6. 페이지별 이미지 업데이트 (다중 이미지 지원)
      const uploads = payload.uploads;
      if (uploads) {
        const result = await updateAllPageImages(eventId, {
          outline: uploads.imgPost || [],     // 대회요강
          notice: uploads.imgNotice || [],    // 유의사항
          meeting: uploads.imgConfirm || [],  // 집결출발
          course: uploads.imgCourse || [],    // 코스
          souvenir: uploads.imgGift || [],    // 기념품
        });

        // 페이지별 이미지 업데이트 실패 시 경고 (대회는 이미 생성됨)
        if (!result.success) {
          console.warn('페이지별 이미지 업데이트 실패:', result.errors);
          setLoadingModalOpen(false);
          setErrorMessage(
            `대회는 이미 생성되었습니다. 일부 페이지 이미지 업데이트에 실패했습니다:\n\n${result.errors.join('\n')}\n\n추가 수정은 수정 페이지에서 진행해주세요.`
          );
          setIsPartialSuccessError(true);
          setErrorModalOpen(true);
          userNotified = true;
          throw new Error('PAGE_IMAGE_UPDATE_FAILED');
        }
      }

      // 기념품과 종목은 대회 생성 후 대회 수정 페이지에서 관리하므로 여기서는 호출하지 않음

      // 성공 시 로딩 모달 닫고 저장된 폼 상태 삭제 후 성공 모달 표시
      setLoadingModalOpen(false);
      FormStateStorage.clear();
      setSuccessModalOpen(true);
    } catch (error) {
      // 오류 발생 시 로딩 모달 닫기
      setLoadingModalOpen(false);
      if (!userNotified) {
        const errorMsg = error instanceof Error ? error.message : '대회 생성 중 오류가 발생했습니다.';
        setErrorMessage(errorMsg);
        setIsPartialSuccessError(false);
        setErrorModalOpen(true);
      }
      // mutate 실패 등 생성 전 오류는 ref 초기화하여 재시도 허용
      if (!createdEventIdRef.current) {
        setCreatedEventId(null);
      }
      throw error;
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleSetupSouvenirs = () => {
    if (createdEventId) {
      setSuccessModalOpen(false);
      router.replace(`/admin/events/${createdEventId}/edit?step=souvenirs`);
    }
  };

  const handleViewDetail = () => {
    if (createdEventId) {
      setSuccessModalOpen(false);
      router.replace(`/admin/events/${createdEventId}`);
    }
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setIsPartialSuccessError(false);
  };

  const handleContinueToEdit = () => {
    const eventId = createdEventIdRef.current ?? createdEventId;
    closeErrorModal();
    if (eventId) {
      router.replace(`/admin/events/${eventId}/edit`);
    }
  };

  return (
    <main className="mx-auto max-w-[1320px] px-3 py-4">
      <CreateForm
        prefill={{ applyStatus: '접수중', visibility: '공개' }}
        onRegister={handleRegister}
        onBack={() => router.back()}
      />
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={closeErrorModal}
        title={isPartialSuccessError ? '일부 작업 실패' : '오류'}
        message={errorMessage}
        confirmText={isPartialSuccessError ? '수정 페이지에서 이어하기' : '확인'}
        onConfirm={isPartialSuccessError ? handleContinueToEdit : undefined}
        cancelText={isPartialSuccessError ? '닫기' : undefined}
      />
      <SuccessModal
        isOpen={successModalOpen}
        onSetupSouvenirs={handleSetupSouvenirs}
        onViewDetail={handleViewDetail}
      />
      <LoadingModal
        isOpen={loadingModalOpen}
        message="대회 생성 중..."
      />
    </main>
  );
}
