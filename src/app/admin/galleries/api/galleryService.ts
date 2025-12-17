import { request } from '@/hooks/useFetch';

// 관리자 갤러리 API 타입들
// 스웨거 스펙 기준:
// POST /api/v1/gallery
// PUT  /api/v1/gallery/{galleryId}
// DELETE /api/v1/gallery/{galleryId}
// - galleryCreateRequest (object)
// - thumbnail (file)

export interface GalleryCreateRequest {
  eventName: string;
  eventStartDate: string; // YYYY-MM-DD
  googlePhotoUrl: string;
  tagName: string;
}

export interface GalleryCreateResponse {
  id: string;
}

/**
 * 관리자 갤러리 생성
 * POST /api/v1/gallery
 */
export async function createAdminGallery(
  payload: GalleryCreateRequest,
  thumbnail: File
): Promise<GalleryCreateResponse> {
  const formData = new FormData();

  // 백엔드 스펙에서 요구하는 키 이름 그대로 사용
  formData.append('galleryCreateRequest', JSON.stringify(payload));
  formData.append('thumbnail', thumbnail);

  return request<GalleryCreateResponse>(
    'admin',
    '/api/v1/gallery',
    'POST',
    formData,
    true
  ) as Promise<GalleryCreateResponse>;
}

/**
 * 관리자 갤러리 수정
 * PUT /api/v1/gallery/{galleryId}
 * 썸네일은 선택(있으면 교체, 없으면 그대로 유지)
 */
export async function updateAdminGallery(
  galleryId: string,
  payload: GalleryCreateRequest,
  thumbnail?: File
): Promise<GalleryCreateResponse> {
  const formData = new FormData();
  formData.append('galleryCreateRequest', JSON.stringify(payload));
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  }

  return request<GalleryCreateResponse>(
    'admin',
    `/api/v1/gallery/${galleryId}`,
    'PUT',
    formData,
    true
  ) as Promise<GalleryCreateResponse>;
}

/**
 * 관리자 갤러리 삭제
 * DELETE /api/v1/gallery/{galleryId}
 */
export async function deleteAdminGallery(galleryId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/gallery/${galleryId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}
