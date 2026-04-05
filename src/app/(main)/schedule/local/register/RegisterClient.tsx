'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import LocalEventBanner from '../components/LocalEventBanner';
import { LOCAL_EVENT_PAGE_GUTTER } from '../layoutGutter';
import LocalEventUserForm from '../components/LocalEventUserForm';
import { useCreateLocalEventUser } from '../hooks/useLocalEvents';
import { buildUserLocalEventCreateFormData } from '../api/formDataBuilder';
import { parseCreatedLocalEventId } from '../api/parseCreateResponse';
import type {
  LocalEventUserCreateJson,
  LocalEventUserEventStatus,
  ScheduleLocalEventFormPayload,
} from '../types/localEvent';

function toCreateJson(p: ScheduleLocalEventFormPayload): LocalEventUserCreateJson {
  return {
    eventName: p.eventName,
    eventUrl: p.eventUrl,
    eventStatus: p.eventStatus as LocalEventUserEventStatus,
    eventStartDate: p.eventStartDate,
    registStartDate: p.registStartDate,
    registDeadline: p.registDeadline,
    visibleStatus: p.visibleStatus,
    eventCategoryCsv: p.eventCategoryCsv,
    lowestAmount: p.lowestAmount,
    applicantCompany: p.applicantCompany,
  };
}

export default function RegisterClient() {
  const router = useRouter();
  const createMutation = useCreateLocalEventUser();

  const handleSubmit = async (payload: ScheduleLocalEventFormPayload) => {
    const json = toCreateJson(payload);
    const fd = buildUserLocalEventCreateFormData(json, payload.promotionBanner);
    const data = await createMutation.mutateAsync(fd);
    parseCreatedLocalEventId(data);
    toast.success('지역대회가 등록되었습니다.');
    router.replace('/schedule/local?tab=mine');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LocalEventBanner />
      <div className={`flex-1 w-full py-4 sm:py-8 md:py-10 ${LOCAL_EVENT_PAGE_GUTTER}`}>
        <LocalEventUserForm
          mode="create"
          prefill={{ visibleStatus: 'OPEN' }}
          onSubmit={handleSubmit}
          onBack={() => router.push('/schedule/local')}
        />
      </div>
    </div>
  );
}
