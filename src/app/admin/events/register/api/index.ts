// src/app/admin/events/register/api/index.ts
export { useCreateEvent } from './eventApi';
export { useUpdateSouvenirs, updateSouvenirs } from './souvenirApi';
export { useUpdateEventCategories, updateEventCategories } from './categoryApi';
export { EventDataTransformer } from './eventDataTransformer';
export { FormDataBuilder } from './formDataBuilder';
export { transformSouvenirsToApi } from './souvenirTransformer';
export { transformCategoriesToApi } from './categoryTransformer';
export { transformApiResponseToFormPrefill, extractGroupsFromApiResponse } from './apiResponseTransformer';
export { useSouvenirDropdown, useEventCategoryDropdown } from './dropdownApi';
export type { SouvenirDropdownItem, EventCategoryDropdownItem } from './dropdownApi';

// 페이지별 이미지 관리 API
export { 
  buildPageImageFormData,
  updatePageImages,
  updateAllPageImages,
} from './pageImageApi';

// 대회등록 관련 타입 export
export type {
  BannerType,
  EventInfo,
  SouvenirInfo,
  EventCategoryCombination,
  EventCategoryInfo,
  EventBannerInfo,
  EventCreateRequest,
  EventUpdateRequest,
  EventCategoryUpdateInfo,
  EventBannerUpdateInfo,
  SouvenirUpdateRequest,
  EventCategoryUpdateRequest,
  EventImageFiles,
  ApplyType,
  Visibility,
  DeliveryMethod,
  Shuttle,
  EventTheme,
  EventFormState,
  EventCreatePayload,
  EventStatus,
  // 페이지별 이미지 타입
  EventPageImage,
  EventDetailPageImages,
  EventPageImageRequest,
  EventPageImageUpdateRequest,
  PageImageApiPayload,
} from './types';
