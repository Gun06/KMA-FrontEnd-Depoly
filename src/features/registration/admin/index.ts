// 중앙 배럴: 관리자 대회 등록 관련 모듈 집약

export { EventDataTransformer } from '@/utils/eventDataTransformer';
export { FormDataBuilder } from '@/utils/formDataBuilder';
export { useCompetitionForm } from '@/hooks/useCompetitionForm';
export type { HydrateSnapshotInput } from '@/hooks/useCompetitionForm';
export { default as CompetitionCreateForm } from '@/components/admin/Form/competition/CompetitionCreateForm';
export { payloadToEventPatch } from '@/utils/eventPatch';

export type {
  EventCreatePayload,
  EventFormState,
  ApplyType,
  Visibility,
  Shuttle,
  DeliveryMethod,
  EventTheme,
} from '@/types/Admin';
