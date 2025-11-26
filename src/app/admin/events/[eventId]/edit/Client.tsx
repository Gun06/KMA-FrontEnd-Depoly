// app/admin/events/[eventId]/edit/Client.tsx
'use client';

import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CompetitionCreateForm } from '@/features/registration/admin';
import type { EventCreatePayload } from '@/features/registration/admin';
import type { EventRow } from '@/components/admin/events/EventTable';
import type { UseCompetitionPrefill } from '@/hooks/useCompetitionForm';
import { useEventsActions, useEventsState } from '@/contexts/EventsContext';
import { payloadToEventPatch } from '@/utils/eventPatch';
import { rowToPrefill } from '@/data/eventPrefill';
import { useEventDetail } from '@/hooks/useEventDetail';
import { transformApiToFormPrefill } from '@/utils/apiToFormPrefill';
import { useApiMutation } from '@/hooks/useFetch';
import { FormDataBuilder } from '@/utils/formDataBuilder';
import Button from '@/components/common/Button/Button';

export default function Client({
  eventId,
  prefillForm,
  prefillRow,
}: {
  eventId: string;
  prefillForm: UseCompetitionPrefill;
  prefillRow: EventRow;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { rows, forms } = useEventsState();
  const { upsertOne, saveForm } = useEventsActions(); // ✅ 변경: updateOne -> upsertOne

  // API에서 대회 상세 정보 조회
  const { data: apiData, isLoading, error, refetch } = useEventDetail(String(eventId));

  // 결제정보(은행/가상계좌) 별도 API 연동
  const [bankName, setBankName] = React.useState<string>('');
  const [virtualAccount, setVirtualAccount] = React.useState<string>('');
  const [paymentInfoKey, setPaymentInfoKey] = React.useState(0); // 재로드를 위한 키
  
  React.useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const res = await fetch(`${base}/api/v1/public/event/${eventId}/payment-info`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setBankName(String(data?.bankName || ''));
          setVirtualAccount(String(data?.virtualAccount || ''));
        }
      } catch {}
    };
    if (eventId) load();
    return () => { ignore = true; };
  }, [eventId, paymentInfoKey]); // paymentInfoKey 추가

  // 대회 수정 API 훅
  const updateEventMutation = useApiMutation<unknown, FormData>(
    `/api/v1/event/${eventId}`,
    'admin',
    'PUT',
    true, // 인증 필요
    undefined,
    (formData: FormData) => ({
      body: formData,
    })
  );

  const currentRow = useMemo(
    () => rows.find(r => String(r.id) === String(eventId)) ?? prefillRow,
    [rows, eventId, prefillRow]
  );

  // 폼 프리필 데이터 구성 (API 데이터 우선, 폴백으로 기존 로직)
  const formPrefill = useMemo(() => {
    // API 데이터가 있으면 변환하여 사용
    if (apiData) {
      const result = transformApiToFormPrefill(apiData);
      return {
        ...result,
        // API 응답에서 bank와 virtualAccount를 우선적으로 사용, 없으면 별도 API에서 가져온 값 사용
        bank: apiData.eventInfo.bank ?? bankName,
        virtualAccount: apiData.eventInfo.virtualAccount ?? virtualAccount,
      } as any;
    }

    // API 데이터가 없으면 기존 로직 사용 (폴백)
    return (
      (forms[eventId] as any) ??
      (rowToPrefill(currentRow) as any) ??
      prefillForm
    );
  }, [apiData, forms, eventId, currentRow, prefillForm, bankName, virtualAccount]);

  const goDetail = () => router.replace(`/admin/events/${eventId}`);

  const handleSubmit = async (payload: EventCreatePayload) => {
    try {

      // API 요청을 위한 FormData 생성 (기존 카테고리 및 배너 정보 포함)
      const formData = FormDataBuilder.buildEventUpdateFormData(
        eventId,
        payload,
        apiData?.eventCategories, // 기존 카테고리 정보 전달
        apiData?.eventBanners, // 기존 배너 정보 전달
        apiData?.eventInfo?.eventStatus // 기존 eventStatus 전달 (applyStatus가 없을 때 유지)
      );


      // 대회 수정 API 호출
      await updateEventMutation.mutateAsync(formData);


      // 성공 시 로컬 상태도 업데이트
      const patch = payloadToEventPatch(payload, currentRow);
      const nextRow: EventRow = { ...currentRow, ...patch };
      upsertOne(nextRow);

      // 상세 프리필 스냅샷도 저장(상세 화면에서 바로 반영)
      saveForm(eventId, payload);

      // 상세 캐시 무효화하여 상세 페이지가 최신 데이터로 재조회되도록 함
      await queryClient.invalidateQueries({ queryKey: ['eventDetail', String(eventId)] });

      // 결제 정보 재로드 트리거 (저장된 값으로 업데이트)
      if (payload.bank || payload.virtualAccount) {
        setBankName(payload.bank || '');
        setVirtualAccount(payload.virtualAccount || '');
      }
      // API 재조회를 통해 최신 결제 정보 가져오기
      setPaymentInfoKey(prev => prev + 1);

      // 성공 메시지 표시
      alert('대회 정보가 성공적으로 수정되었습니다.');

      // 상세 페이지로 이동
      goDetail();
    } catch (error) {
      alert('대회 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로딩 상태 처리
  if (isLoading || updateEventMutation.isPending) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-pretendard">
              {updateEventMutation.isPending
                ? '대회 정보를 수정하는 중...'
                : '대회 정보를 불러오는 중...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-giants text-gray-900 mb-4">
              데이터를 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 font-pretendard mb-6">
              대회 정보를 불러오는 중 오류가 발생했습니다.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                tone="neutral"
                size="md"
                onClick={goDetail}
              >
                상세보기로 돌아가기
              </Button>
              <Button
                variant="solid"
                tone="primary"
                size="md"
                onClick={() => refetch()}
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CompetitionCreateForm
      mode="edit"
      prefill={formPrefill}
      initialEditing
      onBack={goDetail}
      onCancel={goDetail}
      onSubmit={handleSubmit}
      hideBottomPrimary
      existingEventBanners={apiData?.eventBanners}
    />
  );
}
