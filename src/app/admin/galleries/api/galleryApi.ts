import { createAdminGallery, updateAdminGallery, deleteAdminGallery } from './galleryService';
import type { GalleryCreatePayload } from '../types/gallery';

// 갤러리 관련 Admin API 래퍼

// BirthDateInput 등에서 들어오는 값이 'YYYY.MM.DD' 형식일 수도 있으니
// 백엔드 스펙인 'YYYY-MM-DD'로 한 번 정규화해준다.
const normalizeDateForApi = (value: string) => value.replace(/\./g, '-');

export async function createGalleryByAdmin(payload: GalleryCreatePayload) {
  const { title, tagName, eventStartDate, googlePhotoUrl, thumbnailFile } = payload;

  // 실제 백엔드에 전송하는 DTO는 galleryService.ts 의 스펙을 따른다
  return createAdminGallery(
    {
      eventName: title.trim(),
      eventStartDate: normalizeDateForApi(eventStartDate),
      googlePhotoUrl: googlePhotoUrl.trim(),
      tagName: tagName.trim(),
    },
    thumbnailFile
  );
}

export async function updateGalleryByAdmin(
  galleryId: string,
  payload: Omit<GalleryCreatePayload, 'thumbnailFile'>,
  thumbnailFile?: File
) {
  const { title, eventStartDate, googlePhotoUrl, tagName } = payload;
  return updateAdminGallery(
    galleryId,
    {
      eventName: title.trim(),
      eventStartDate: normalizeDateForApi(eventStartDate),
      googlePhotoUrl: googlePhotoUrl.trim(),
      tagName: tagName.trim(),
    },
    thumbnailFile
  );
}

export async function deleteGalleryByAdmin(galleryId: string) {
  return deleteAdminGallery(galleryId);
}

