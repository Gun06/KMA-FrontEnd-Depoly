// app/admin/local-events/register/Client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateForm from './components/CreateForm';
import { LocalEventDataTransformer } from './api/localEventDataTransformer';
import { FormDataBuilder } from './api/formDataBuilder';
import type { LocalEventCreatePayload } from './api/types';
import { useCreateLocalEvent } from './api';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import SuccessModal from './components/parts/SuccessModal';
import LoadingModal from './components/parts/LoadingModal';

export default function Client() {
  const router = useRouter();
  const createLocalEventMutation = useCreateLocalEvent();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  /**
   * 지역대회 등록 처리 함수
   */
  const handleRegister = async (payload: LocalEventCreatePayload) => {
    try {
      // 1. 데이터 변환
      const { localEventCreateRequest, promotionBanner } =
        LocalEventDataTransformer.transformToServerFormat(payload);

      // 2. 이미지 유효성 검증 (홍보 배너는 선택사항)
      const validation = LocalEventDataTransformer.validateImages(promotionBanner);
      if (!validation.isValid) {
        setErrorMessage(`이미지 업로드 오류\n\n${validation.errors.join('\n')}`);
        setErrorModalOpen(true);
        return;
      }

      // 3. FormData 생성
      const formData = FormDataBuilder.buildLocalEventCreateFormData(
        localEventCreateRequest,
        promotionBanner
      );

      // 4. 로딩 모달 표시
      setLoadingModalOpen(true);

      // 5. 지역대회 생성 API 호출
      const eventId = await new Promise<string>((resolve, reject) => {
        createLocalEventMutation.mutate(formData, {
          onSuccess: async (data) => {
            if (data == null) {
              reject(new Error('지역대회 생성에 실패했습니다.'));
              return;
            }

            // 서버가 문자열(UUID 등) 또는 객체로 응답하는 경우 모두 대비
            const idMaybe = typeof data === 'string' ? data : data.id;
            const stringId = String(idMaybe);

            resolve(stringId);
          },
          onError: (error: Error) => {
            reject(error);
          },
        });
      });

      // 성공 시 로딩 모달 닫고 성공 모달 표시
      setLoadingModalOpen(false);
      setCreatedEventId(eventId);
      setSuccessModalOpen(true);
    } catch (error) {
      // 오류 발생 시 로딩 모달 닫기
      setLoadingModalOpen(false);
      // 오류 상세 로그
      const errorMsg = error instanceof Error ? error.message : '지역대회 생성 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    }
  };

  const handleViewDetail = () => {
    if (createdEventId) {
      setSuccessModalOpen(false);
      // TODO: 지역대회 상세 페이지로 이동 (구현 후)
      router.replace(`/admin/local-events/${createdEventId}`);
    }
  };

  const handleBackToList = () => {
    setSuccessModalOpen(false);
    router.replace('/admin/local-events/management');
  };

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-3">
      <CreateForm
        prefill={{ eventStatus: 'PENDING', visibleStatus: 'OPEN' }}
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
        onViewDetail={handleViewDetail}
        onBackToList={handleBackToList}
      />
      <LoadingModal
        isOpen={loadingModalOpen}
        message="지역대회 생성 중..."
      />
    </main>
  );
}

