// app/admin/events/register/Client.tsx
'use client';

import { useRouter } from 'next/navigation';
import {
  CompetitionCreateForm,
  EventDataTransformer,
  FormDataBuilder,
} from '@/features/registration/admin';
import type { EventCreatePayload } from '@/features/registration/admin';
import type { EventRow } from '@/components/admin/events/EventTable';
import { useEventsActions } from '@/contexts/EventsContext';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import { useApiMutation } from '@/hooks/useFetch';

// 유틸리티 import
// 위 배럴에서 일괄 import
import {
  createImageUploadErrorMessage,
  extractApiErrorMessage,
} from '@/utils/errorHandler';

export default function Client() {
  const router = useRouter();
  const { addOne, saveForm } = useEventsActions();

  // 대회 생성 API 호출 훅
  const createEventMutation = useApiMutation<{ id: number } | string, FormData>(
    '/api/v1/event',
    'admin',
    'POST',
    true, // 인증 필요
    {
      onSuccess: data => {
        if (data == null) return;

        // 서버가 문자열(UUID 등)로 응답하는 경우 대비
        const idMaybe = typeof data === 'string' ? data : data.id;

        // 숫자 id를 요구하는 기존 테이블과 일단 호환시키기 위해 임시 음수 id 매핑
        const numericId =
          typeof idMaybe === 'number' ? idMaybe : Date.now() * -1;

        // 테이블 표시용 임시 Row 추가
        const newRow: EventRow = {
          id: numericId,
          date: new Date().toISOString().slice(0, 10),
          title: '새 대회',
          titleEn: '',
          place: '',
          host: '',
          applyStatus: '접수중' as RegStatus,
          isPublic: true,
        };

        addOne(newRow);
        // 원본 id(문자열/숫자)와 임시 numericId를 form 스냅샷에 함께 저장
        saveForm(numericId, {
          __serverId: idMaybe,
        } as unknown as EventCreatePayload);
        router.replace(`/event/${idMaybe}`);
      },
      onError: (error: Error) => {
        const errorMessage = extractApiErrorMessage(error);
        alert(`대회 생성에 실패했습니다:\n${errorMessage}`);
      },
    }
  );

  /**
   * 대회 등록 처리 함수
   */
  const handleRegister = async (payload: EventCreatePayload) => {
    try {
      // 1. 데이터 변환 및 검증
      const { eventCreateRequest, imageFiles } =
        EventDataTransformer.transformToServerFormat(payload);

      // 2. 비즈니스 로직 검증
      if (eventCreateRequest.eventCategoryInfoList.length === 0) {
        alert('최소 하나의 참가부문이 필요합니다.');
        return;
      }

      // 3. 이미지 유효성 검증
      const validation = EventDataTransformer.validateImages(imageFiles);
      if (!validation.isValid) {
        const errorMessage = createImageUploadErrorMessage(validation.errors);
        alert(
          `이미지 업로드 오류:\n\n${errorMessage}\n\n모든 필수 이미지를 업로드해주세요.`
        );
        return;
      }

      // 4. FormData 생성
      const formData = FormDataBuilder.buildEventCreateFormData(
        eventCreateRequest,
        imageFiles
      );

      // 5. API 호출
      createEventMutation.mutate(formData);
    } catch (error) {
      // 오류 상세 로그
      alert('대회 생성 중 오류가 발생했습니다.');
      console.error('대회 등록 오류:', error);
    }
  };

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <CompetitionCreateForm
        mode="create"
        prefill={{ applyStatus: '접수중', visibility: '공개' }}
        onRegister={handleRegister}
        onBack={() => router.back()}
      />
    </main>
  );
}
