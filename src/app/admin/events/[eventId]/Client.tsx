'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EventDetailView, {
  EventDetailData,
} from '@/components/admin/events/EventDetailView';
import Button from '@/components/common/Button/Button';
import { useEventsActions } from '@/contexts/EventsContext';
import { useEventDetail } from '@/hooks/useEventDetail';
import { transformApiDataToEventDetail } from '@/utils/eventDataTransform';

export default function Client({
  eventId,
}: {
  eventId: string; // number에서 string으로 변경 (UUID 지원)
}) {
  const router = useRouter();
  const { removeOne } = useEventsActions();

  // API에서 대회 상세 정보 조회
  const { data: apiData, isLoading, error, refetch } = useEventDetail(eventId);

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
      return transformApiDataToEventDetail(apiData);
    }

    // API 데이터가 없으면 null 반환 (로딩 상태에서 처리)
    return null;
  }, [apiData]);

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
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBack={goList}
    />
  );
}
