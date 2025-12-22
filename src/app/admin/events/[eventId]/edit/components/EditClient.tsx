// app/admin/events/[eventId]/edit/components/EditClient.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EditForm from './EditForm';
import type { EventCreatePayload } from '@/types/Admin';
import type { EventRow } from '@/components/admin/events/EventTable';
import type { UseCompetitionPrefill } from '@/app/admin/events/register/hooks/useCompetitionForm';
import { useAdminEventsActions, useAdminEventsState } from '@/components/providers/AdminEventsContext';
import { payloadToEventPatch } from '@/utils/eventPatch';
import { rowToPrefill } from '@/data/eventPrefill';
import { useEventDetail } from '@/hooks/useEventDetail';
import { transformApiResponseToFormPrefill, extractGroupsFromApiResponse, useEventCategoryDropdown } from '@/app/admin/events/register/api';
import { useApiMutation } from '@/hooks/useFetch';
import { FormDataBuilder } from '@/app/admin/events/register/api/formDataBuilder';
import { updateSouvenirs, updateEventCategories, transformSouvenirsToApi, transformCategoriesToApi } from '@/app/admin/events/register/api';
import Button from '@/components/common/Button/Button';
import InfoModal from '@/app/admin/events/register/components/parts/InfoModal';

export default function EditClient({
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
  const { rows, forms } = useAdminEventsState();
  const { upsertOne, saveForm } = useAdminEventsActions();

  // 커스텀 모달 상태
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'success' | 'error' | 'warning'>('success');
  const [infoModalMessage, setInfoModalMessage] = useState('');

  // API에서 대회 상세 정보 조회
  const { data: apiData, isLoading, error, refetch } = useEventDetail(String(eventId));

  // 드롭다운 API에서 기념품과 종목 데이터 조회
  const { data: dropdownData, isLoading: isLoadingDropdown } = useEventCategoryDropdown(String(eventId));

  // 드롭다운 데이터를 기념품과 종목으로 변환
  // 저장된 모든 기념품 사용 (apiData와 dropdownData 모두에서 가져옴)
  const initialGifts = useMemo(() => {
    const allSouvenirsMap = new Map<string, { name: string; size: string; id?: string }>();

    // 1. apiData에서 기념품 추출 (종목에 연결되지 않은 기념품도 포함)
    if (apiData?.souvenirs && apiData.souvenirs.length > 0) {
      apiData.souvenirs.forEach(souvenir => {
        const key = `${souvenir.name}_${souvenir.sizes}`;
        if (!allSouvenirsMap.has(key) && souvenir.name?.trim()) {
          allSouvenirsMap.set(key, {
            name: souvenir.name.trim(),
            size: souvenir.sizes || '',
            id: souvenir.id,
          });
        }
      });
    }

    // 2. apiData의 eventCategories에서 기념품 추출
    if (apiData?.eventCategories && apiData.eventCategories.length > 0) {
      apiData.eventCategories.forEach(cat => {
        if (cat.souvenirs) {
          cat.souvenirs.forEach(souvenir => {
            const key = `${souvenir.name}_${souvenir.sizes}`;
            if (!allSouvenirsMap.has(key) && souvenir.name?.trim()) {
              allSouvenirsMap.set(key, {
                name: souvenir.name.trim(),
                size: souvenir.sizes || '',
                id: souvenir.id,
              });
            }
          });
        }
      });
    }

    // 3. dropdownData에서 기념품 추출 (보강)
    if (dropdownData && dropdownData.length > 0) {
      dropdownData.forEach(cat => {
        if (cat.souvenirs) {
          cat.souvenirs.forEach(souvenir => {
            const key = `${souvenir.name}_${souvenir.sizes}`;
            if (!allSouvenirsMap.has(key) && souvenir.name?.trim()) {
              allSouvenirsMap.set(key, {
                name: souvenir.name.trim(),
                size: souvenir.sizes || '',
                id: souvenir.id,
              });
            }
          });
        }
      });
    }

    // Map에서 배열로 변환 (id 제거)
    return Array.from(allSouvenirsMap.values()).map(s => ({
      name: s.name,
      size: s.size,
    }));
  }, [apiData, dropdownData]);

  // 저장된 종목만 사용 (dropdownData에서만 가져옴)
  const initialCourses = useMemo(() => {
    // 드롭다운 데이터가 없으면 빈 배열 반환 (저장된 종목이 없음)
    if (!dropdownData || dropdownData.length === 0) {
      return [];
    }

    // 드롭다운 데이터에서 종목 추출
    // 드롭다운 API는 저장된 종목과 기념품만 반환하므로 안전하게 사용 가능
    const allSouvenirs = dropdownData.flatMap(cat => cat.souvenirs || []);
    const uniqueSouvenirs = Array.from(
      new Map(allSouvenirs.map(s => [s.id, s])).values()
    );

    return dropdownData.map(category => {
      // 기념품 인덱스 찾기
      const selectedGifts = category.souvenirs
        .map(souvenir => {
          const index = uniqueSouvenirs.findIndex(s => s.id === souvenir.id);
          return index >= 0 ? index : -1;
        })
        .filter(idx => idx >= 0);
      
      return {
        name: category.name || '',
        price: String(category.amount || 0),
        selectedGifts,
      };
    });
  }, [dropdownData]);

  // 결제정보(은행/가상계좌) 별도 API 연동
  const [bankName, setBankName] = React.useState<string>('');
  const [virtualAccount, setVirtualAccount] = React.useState<string>('');
  const [paymentInfoKey, setPaymentInfoKey] = React.useState(0);
  
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
  }, [eventId, paymentInfoKey]);

  // 대회 수정 API 훅
  const updateEventMutation = useApiMutation<unknown, FormData>(
    `/api/v1/event/${eventId}`,
    'admin',
    'PUT',
    true,
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
      const result = transformApiResponseToFormPrefill(apiData);
      const groups = extractGroupsFromApiResponse(apiData);
      return {
        ...result,
        bank: apiData.eventInfo.bank ?? bankName,
        virtualAccount: apiData.eventInfo.virtualAccount ?? virtualAccount,
        groups: groups.map(g => ({
          course: {
            name: g.course.name,
            price: String(g.course.price),
          },
          gifts: g.gifts.map(gift => ({
            label: gift.label || '',
            size: gift.size || '',
          })),
        })),
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

  // STEP 1: 대회 기본 정보 및 배너만 저장
  const handleSubmit = async (payload: EventCreatePayload) => {
    try {
      const formData = FormDataBuilder.buildEventUpdateFormData(
        eventId,
        payload,
        apiData?.eventCategories as any,
        apiData?.eventBanners as any,
        apiData?.eventInfo?.eventStatus
      );

      await updateEventMutation.mutateAsync(formData);

      // 성공 시 로컬 상태도 업데이트
      const patch = payloadToEventPatch(payload, currentRow);
      const nextRow: EventRow = { ...currentRow, ...patch };
      upsertOne(nextRow);

      saveForm(eventId, payload);

      // 관련 쿼리 무효화 및 재조회 (기념품/종목 데이터도 함께 무효화)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['eventDetail', String(eventId)] }),
        queryClient.refetchQueries({ queryKey: ['eventDetail', String(eventId)] }),
        queryClient.invalidateQueries({ queryKey: ['eventCategoryDropdown', String(eventId)] }), // 기념품/종목 드롭다운 무효화
        queryClient.invalidateQueries({ queryKey: ['souvenirDropdown', String(eventId)] }), // 기념품 드롭다운 무효화
        queryClient.invalidateQueries({ queryKey: ['adminEventList'] }), // 대회 목록도 무효화
      ]);

      if (payload.bank || payload.virtualAccount) {
        setBankName(payload.bank || '');
        setVirtualAccount(payload.virtualAccount || '');
      }
      setPaymentInfoKey(prev => prev + 1);

      // 성공 모달 표시
      setInfoModalType('success');
      setInfoModalMessage('대회 기본 정보가 성공적으로 수정되었습니다.');
      setInfoModalOpen(true);
    } catch (error) {
      // 에러 모달 표시
      setInfoModalType('error');
      setInfoModalMessage('대회 수정에 실패했습니다. 다시 시도해주세요.');
      setInfoModalOpen(true);
    }
  };

  // STEP 2: 기념품만 저장
  const handleSaveSouvenirs = async (gifts: Array<{ name: string; size: string }>) => {
    if (!apiData) return;
    if (!gifts || gifts.length === 0) {
      setInfoModalType('warning');
      setInfoModalMessage('저장할 기념품이 없습니다.');
      setInfoModalOpen(true);
      return;
    }

    try {
      const allSouvenirs =
        apiData.souvenirs && apiData.souvenirs.length > 0
          ? apiData.souvenirs
          : (apiData.eventCategories?.flatMap(cat => cat.souvenirs) || []);

      // 빈 payload로 변환 함수 호출 (gifts 배열 직접 전달)
      const emptyPayload = { groups: [] } as unknown as EventCreatePayload;
      const souvenirRequests = transformSouvenirsToApi(emptyPayload, allSouvenirs, gifts);
      
      if (souvenirRequests.length > 0) {
        await updateSouvenirs(eventId, souvenirRequests);
        
        // 기념품 저장 후 관련 쿼리 무효화 및 재조회
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['eventDetail', String(eventId)] }),
          queryClient.refetchQueries({ queryKey: ['eventDetail', String(eventId)] }),
          queryClient.invalidateQueries({ queryKey: ['eventCategoryDropdown', String(eventId)] }),
          queryClient.invalidateQueries({ queryKey: ['souvenirDropdown', String(eventId)] }),
        ]);
        
        await refetch();
        setInfoModalType('success');
        setInfoModalMessage('기념품이 성공적으로 저장되었습니다.');
        setInfoModalOpen(true);
      } else {
        setInfoModalType('warning');
        setInfoModalMessage('저장할 기념품이 없습니다.');
        setInfoModalOpen(true);
      }
    } catch {
      setInfoModalType('error');
      setInfoModalMessage('기념품 저장에 실패했습니다. 다시 시도해주세요.');
      setInfoModalOpen(true);
    }
  };

  // STEP 3: 종목만 저장
  const handleSaveCategories = async (
    courses: Array<{ name: string; price: string; selectedGifts: number[] }>,
    gifts: Array<{ name: string; size: string }>
  ) => {
    if (!apiData) return;
    if (!courses || courses.length === 0) {
      setInfoModalType('warning');
      setInfoModalMessage('저장할 종목이 없습니다.');
      setInfoModalOpen(true);
      return;
    }

    try {
      const allSouvenirs =
        apiData.souvenirs && apiData.souvenirs.length > 0
          ? apiData.souvenirs
          : (apiData.eventCategories?.flatMap(cat => cat.souvenirs) || []);

      // 빈 payload로 변환 함수 호출 (courses와 gifts 배열 직접 전달)
      const emptyPayload = { groups: [] } as unknown as EventCreatePayload;
      const categoryRequests = transformCategoriesToApi(
        emptyPayload,
        apiData.eventCategories,
        allSouvenirs,
        courses,
        gifts
      );
      
      if (categoryRequests.length > 0) {
        await updateEventCategories(eventId, categoryRequests);
        await refetch();
        setInfoModalType('success');
        setInfoModalMessage('종목이 성공적으로 저장되었습니다.');
        setInfoModalOpen(true);
      } else {
        setInfoModalType('warning');
        setInfoModalMessage('저장할 종목이 없습니다.');
        setInfoModalOpen(true);
      }
    } catch {
      setInfoModalType('error');
      setInfoModalMessage('종목 저장에 실패했습니다. 다시 시도해주세요.');
      setInfoModalOpen(true);
    }
  };

  // 로딩 상태 처리
  if (isLoading || isLoadingDropdown || updateEventMutation.isPending) {
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

  // 에러 상태 처리 - SQL 오류 등은 치명적이지 않으므로 폼은 보여줌
  const errorMessage = error 
    ? (error as any)?.message || (error as any)?.data?.message || String(error) 
    : '';
  const isCriticalError = error && !apiData && isLoading === false;
  const isSouvenirError = error && (
    errorMessage.includes('souvenir') || 
    errorMessage.includes('event_id') || 
    errorMessage.includes('Unknown column') ||
    errorMessage.includes('JDBC exception')
  );
  
  // 치명적 오류(404 등)가 아니면 폼을 보여줌
  if (isCriticalError && !isSouvenirError) {
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
    <>
      {/* 기념품 관련 SQL 오류 경고 메시지 */}
      {isSouvenirError && (
        <div className="mx-auto max-w-[1300px] px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  기념품 정보를 불러올 수 없습니다
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  대회 기본 정보는 수정할 수 있으며, 기념품과 종목은 새로 추가할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <EditForm
        prefill={formPrefill}
        initialEditing
        onBack={goDetail}
        onCancel={goDetail}
        onSubmit={handleSubmit}
        onSaveSouvenirs={handleSaveSouvenirs}
        onSaveCourses={handleSaveCategories}
        existingEventBanners={apiData?.eventBanners as any}
        initialGifts={initialGifts}
        initialCourses={initialCourses}
      />

      {/* 커스텀 정보 모달 */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        type={infoModalType}
        message={infoModalMessage}
      />
    </>
  );
}

