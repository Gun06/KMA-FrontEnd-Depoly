// 중앙 배럴: 관리자 대회 등록 관련 모듈 집약

export { EventDataTransformer } from '@/app/admin/events/register/api/eventDataTransformer';
export { FormDataBuilder } from '@/app/admin/events/register/api/formDataBuilder';
export { useCompetitionForm } from '@/app/admin/events/register/hooks/useCompetitionForm';
export type { HydrateSnapshotInput } from '@/app/admin/events/register/hooks/useCompetitionForm';
export { default as CreateForm } from '@/app/admin/events/register/components/CreateForm';
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
