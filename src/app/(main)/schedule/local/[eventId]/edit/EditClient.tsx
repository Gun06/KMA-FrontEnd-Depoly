'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import LocalEventBanner from '../../components/LocalEventBanner';
import { LOCAL_EVENT_PAGE_GUTTER } from '../../layoutGutter';
import LocalEventUserForm from '../../components/LocalEventUserForm';
import { useLocalEventUserDetail, useUpdateLocalEventUser } from '../../hooks/useLocalEvents';
import { buildUserLocalEventUpdateFormData } from '../../api/formDataBuilder';
import type { LocalEventUserUpdateJson, ScheduleLocalEventFormPayload } from '../../types/localEvent';
import { isoToDateParts } from '../../utils/isoDatePrefill';
import type { ScheduleLocalEventFormPrefill } from '../../hooks/useScheduleLocalEventForm';

function toUpdateJson(
  p: ScheduleLocalEventFormPayload,
  existingBannerUrl?: string
): LocalEventUserUpdateJson {
  return {
    eventName: p.eventName,
    eventUrl: p.eventUrl,
    eventStatus: p.eventStatus,
    eventStartDate: p.eventStartDate,
    registStartDate: p.registStartDate,
    registDeadline: p.registDeadline,
    visibleStatus: p.visibleStatus,
    eventCategoryCsv: p.eventCategoryCsv,
    lowestAmount: p.lowestAmount,
    applicantCompany: p.applicantCompany,
    promotionBanner: p.promotionBanner ? undefined : existingBannerUrl,
  };
}

export default function EditClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useLocalEventUserDetail(eventId);
  const updateMutation = useUpdateLocalEventUser(eventId);

  const prefill: ScheduleLocalEventFormPrefill | undefined = data
    ? (() => {
        const es = isoToDateParts(data.eventStartDate);
        const rs = isoToDateParts(data.registStartDate);
        const rd = isoToDateParts(data.registDeadline);
        return {
          eventName: data.eventName,
          eventUrl: data.eventUrl,
          eventStatus: data.eventStatus || 'PENDING',
          visibleStatus:
            data.visibleStatus === 'OPEN' || data.visibleStatus === 'TEST' || data.visibleStatus === 'CLOSE'
              ? data.visibleStatus
              : 'OPEN',
          eventStartDate: es.date,
          eventStartHh: es.hh,
          eventStartMm: es.mm,
          registStartDate: rs.date,
          registStartHh: rs.hh,
          registStartMm: rs.mm,
          registDeadline: rd.date,
          registDeadlineHh: rd.hh,
          registDeadlineMm: rd.mm,
          eventCategoryCsv: data.eventCategoryCsv || '',
          lowestAmount: typeof data.lowestAmount === 'number' ? data.lowestAmount : 0,
          applicantCompany: data.applicantCompany || '',
        };
      })()
    : undefined;

  const handleSubmit = async (payload: ScheduleLocalEventFormPayload) => {
    const json = toUpdateJson(payload, data?.promotionBanner);
    const fd = buildUserLocalEventUpdateFormData(json, payload.promotionBanner);
    await updateMutation.mutateAsync(fd);
    toast.success('수정되었습니다.');
    router.replace('/schedule/local?tab=mine');
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-white">
        <LocalEventBanner />
        <div className={`w-full py-16 text-center text-gray-600 ${LOCAL_EVENT_PAGE_GUTTER}`}>
          {isError ? (error instanceof Error ? error.message : '불러오기 실패') : '불러오는 중...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LocalEventBanner />
      <div className={`flex-1 w-full py-4 sm:py-8 md:py-10 ${LOCAL_EVENT_PAGE_GUTTER}`}>
        <LocalEventUserForm
          key={data.id}
          mode="edit"
          prefill={prefill}
          existingPromotionBannerUrl={data.promotionBanner}
          onSubmit={handleSubmit}
          onBack={() => router.push('/schedule/local?tab=mine')}
        />
      </div>
    </div>
  );
}
