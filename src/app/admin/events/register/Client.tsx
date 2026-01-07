// app/admin/events/register/Client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateForm from './components/CreateForm';
import { EventDataTransformer } from './api/eventDataTransformer';
import { FormDataBuilder } from './api/formDataBuilder';
import type { EventCreatePayload } from './api/types';
import { createImageUploadErrorMessage } from '@/utils/errorHandler';
import { useCreateEvent, updateSouvenirs, updateEventCategories, transformSouvenirsToApi, transformCategoriesToApi } from './api';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import SuccessModal from './components/parts/SuccessModal';
import LoadingModal from './components/parts/LoadingModal';
import { FormStateStorage } from './utils/formStateStorage';

export default function Client() {
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  /**
   * 대회 등록 처리 함수
   */
  const handleRegister = async (payload: EventCreatePayload) => {
    try {
      // 1. 데이터 변환 및 검증
      const { eventCreateRequest, imageFiles } =
        EventDataTransformer.transformToServerFormat(payload);

      // 2. 이미지 유효성 검증
      const validation = EventDataTransformer.validateImages(imageFiles);
      if (!validation.isValid) {
        const errorMsg = createImageUploadErrorMessage(validation.errors);
        setErrorMessage(`이미지 업로드 오류\n\n누락된 이미지:\n${errorMsg}\n\n위 이미지들을 모두 업로드해주세요.`);
        setErrorModalOpen(true);
        // 에러를 throw하지 않고 return하여 catch 블록에서 덮어쓰지 않도록 함
        return;
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

      // 기념품과 종목은 대회 생성 후 대회 수정 페이지에서 관리하므로 여기서는 호출하지 않음

      // 성공 시 로딩 모달 닫고 저장된 폼 상태 삭제 후 성공 모달 표시
      setLoadingModalOpen(false);
      FormStateStorage.clear();
      setCreatedEventId(eventId);
      setSuccessModalOpen(true);
    } catch (error) {
      // 오류 발생 시 로딩 모달 닫기
      setLoadingModalOpen(false);
      // 오류 상세 로그
      const errorMsg = error instanceof Error ? error.message : '대회 생성 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
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

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <CreateForm
        prefill={{ applyStatus: '접수중', visibility: '공개' }}
        onRegister={handleRegister}
        onBack={() => router.back()}
      />
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="오류"
        message={errorMessage}
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
