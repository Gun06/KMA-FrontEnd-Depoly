'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import EventDetailView, {
  EventDetailData,
} from '@/components/admin/events/EventDetailView';
import Button from '@/components/common/Button/Button';
import { useAdminEventsActions } from '@/components/providers/AdminEventsContext';
import { useEventDetail } from '@/hooks/useEventDetail';
import { transformApiDataToEventDetail } from '@/utils/eventDataTransform';
import { useEventCategoryDropdown } from '@/app/admin/events/register/api';
import { usePhoneAuthPolicy } from '@/services/admin/phoneAuth';

export default function DetailClient({
  eventId,
}: {
  eventId: string;
}) {
  const router = useRouter();
  const { removeOne } = useAdminEventsActions();
  const queryClient = useQueryClient();

  // API에서 대회 상세 정보 조회 (refetchOnMount: 'always'로 페이지 진입 시 항상 최신 데이터 가져옴)
  const { data: apiData, isLoading, error, refetch } = useEventDetail(eventId);
  const { data: phoneAuthPolicyData } = usePhoneAuthPolicy();

  // 페이지 진입 시 캐시 무효화하여 항상 최신 데이터 가져오기
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['eventDetail', eventId] });
    refetch();
  }, [eventId, queryClient, refetch]);

  // 드롭다운 API에서 기념품과 종목 데이터 조회 (데이터 보강용)
  const { data: dropdownData, refetch: refetchDropdown } = useEventCategoryDropdown(eventId);

  // 페이지 진입 시 기념품/종목 드롭다운 캐시도 무효화하여 항상 최신 데이터 가져오기
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['eventCategoryDropdown', eventId] });
    queryClient.invalidateQueries({ queryKey: ['souvenirDropdown', eventId] });
    refetchDropdown();
  }, [eventId, queryClient, refetchDropdown]);

  const goList = () => router.replace('/admin/events/management');

  const handleDelete = async () => {
    if (
      !window.confirm('정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')
    )
      return;
    // TODO(API): 여기서 DELETE /api/admin/events/:id 호출 후 아래 로컬 갱신 유지
    removeOne(eventId);
    goList();
  };

  const handleEdit = () => {
    router.push(`/admin/events/${eventId}/edit`);
  };

  // 이벤트 데이터 변환 (API 데이터를 EventDetailView 형식으로 변환)
  const eventData = useMemo(() => {
    // API 데이터가 있으면 변환 함수를 사용하여 변환
    if (apiData) {
      const transformed = transformApiDataToEventDetail(apiData);
      
      // 드롭다운 데이터가 있고 eventCategories가 비어있거나 부족하면 보강
      if (dropdownData && dropdownData.length > 0) {
        // 드롭다운 데이터로 eventCategories 보강
        if (!transformed.eventCategories || transformed.eventCategories.length === 0) {
          transformed.eventCategories = dropdownData.map(category => ({
            id: category.id,
            name: category.name,
            amount: category.amount,
            isActive: category.isActive !== false, // 기본값은 true
            souvenirs: category.souvenirs.map(s => ({
              id: s.id,
              name: s.name,
              sizes: s.sizes,
              eventCategoryId: category.id,
              isActive: s.isActive !== false, // 기본값은 true
            })),
          }));
        } else {
          // 기존 데이터와 드롭다운 데이터 병합 (드롭다운 데이터 우선)
          const dropdownMap = new Map(dropdownData.map(c => [c.id, c]));
          transformed.eventCategories = transformed.eventCategories.map(cat => {
            const dropdownCat = dropdownMap.get(cat.id);
            if (dropdownCat) {
              return {
                ...cat,
                amount: dropdownCat.amount,
                isActive: dropdownCat.isActive !== false, // 기본값은 true
                souvenirs: dropdownCat.souvenirs.map(s => ({
                  id: s.id,
                  name: s.name,
                  sizes: s.sizes,
                  eventCategoryId: cat.id,
                  isActive: s.isActive !== false, // 기본값은 true
                })),
              };
            }
            return cat;
          });
        }
      }
      
      return transformed;
    }

    // API 데이터가 없으면 null 반환 (로딩 상태에서 처리)
    return null;
  }, [apiData, dropdownData]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-pretendard">
              대회 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때 처리
  if (!eventData) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-pretendard font-semibold text-gray-900 mb-4">
              대회 정보가 없습니다
            </h2>
            <p className="text-gray-600 font-pretendard mb-6">
              해당 대회의 정보를 찾을 수 없습니다.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                tone="neutral"
                size="md"
                onClick={goList}
              >
                목록으로 돌아가기
              </Button>
            </div>
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
            <h2 className="text-2xl font-pretendard font-semibold text-gray-900 mb-4">
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
                onClick={goList}
              >
                목록으로 돌아가기
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
    <EventDetailView
      eventData={eventData as EventDetailData}
      phoneAuthGlobalPolicy={phoneAuthPolicyData?.policy}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBack={goList}
    />
  );
}

