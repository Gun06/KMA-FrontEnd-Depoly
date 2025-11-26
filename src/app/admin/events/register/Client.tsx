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
import { useQueryClient } from '@tanstack/react-query';

// 유틸리티 import
// 위 배럴에서 일괄 import
import {
  createImageUploadErrorMessage,
  extractApiErrorMessage,
} from '@/utils/errorHandler';

export default function Client() {
  const router = useRouter();
  const { addOne, saveForm } = useEventsActions();
  const queryClient = useQueryClient();

  // 대회 생성 API 호출 훅
  const createEventMutation = useApiMutation<{ id: number } | string, FormData>(
    '/api/v1/event',
    'admin',
    'POST',
    true, // 인증 필요
    {
      onSuccess: async (data) => {
        if (data == null) return;

        // 서버가 문자열(UUID 등) 또는 숫자로 응답하는 경우 모두 대비
        const idMaybe = typeof data === 'string' ? data : data.id;
        const stringId = String(idMaybe);

        // 관리자 이벤트 목록 캐시 무효화하여 최신 데이터 가져오기
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'events', 'list'],
        });

        // 추가로 일반 이벤트 목록 캐시도 무효화 (다른 페이지에서 사용할 수 있음)
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'events'],
        });

        // 원본 id(문자열/숫자)를 문자열로 통일하여 스냅샷에 저장
        saveForm(stringId, {
          __serverId: idMaybe,
        } as unknown as EventCreatePayload);
        
        // 대회 상세 페이지로 이동
        router.replace(`/admin/events/${idMaybe}`);
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
