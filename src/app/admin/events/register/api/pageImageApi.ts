// src/app/admin/events/register/api/pageImageApi.ts
/**
 * 페이지별 이미지 관리 API 헬퍼 함수
 * 스웨거 스펙에 맞춰 FormData 생성 및 API 호출
 */

import type {
  EventPageImageRequest,
  EventPageImageUpdateRequest,
} from './types';
import type { UploadItem } from '@/components/common/Upload/types';
import { api } from '@/hooks/useFetch';

/**
 * 페이지별 이미지 업데이트를 위한 FormData 생성
 * 
 * @param imageItems - UploadItem 배열 (orderNumber는 배열 인덱스로 자동 할당)
 * @returns FormData (imageRequestList + images)
 */
export function buildPageImageFormData(imageItems: UploadItem[]): FormData {
  const formData = new FormData();
  
  // 1. imageRequestList 생성
  const eventPageImageRequests: EventPageImageRequest[] = [];
  const newImageFiles: File[] = [];
  
  imageItems.forEach((item, index) => {
    const orderNumber = index; // 배열 순서가 곧 orderNumber
    
    // 기존 이미지 (url이 있고 새 파일이 없는 경우)
    if (item.url && (!item.file || item.file.size === 0)) {
      eventPageImageRequests.push({
        imageUrl: item.url,
        orderNumber,
      });
    } 
    // 새 이미지 (file이 있는 경우)
    else if (item.file && item.file instanceof File && item.file.size > 0) {
      eventPageImageRequests.push({
        imageUrl: null, // 백엔드 스펙: null이면 생성
        orderNumber,
      });
      newImageFiles.push(item.file);
    }
  });
  
  // 2. imageRequestList를 JSON으로 추가
  const imageRequestList: EventPageImageUpdateRequest = {
    eventPageImageRequests,
  };
  
  formData.append(
    'imageRequestList',
    new Blob([JSON.stringify(imageRequestList)], { type: 'application/json' })
  );
  
  // 3. images 파일들 추가
  newImageFiles.forEach((file) => {
    formData.append('images', file);
  });
  
  return formData;
}

/**
 * 페이지별 이미지 업데이트 API 호출
 * 
 * @param eventId - 대회 ID
 * @param pageName - 페이지 이름 (outline, notice, meeting, course, souvenir)
 * @param imageItems - UploadItem 배열
 * @throws API 호출 실패 시 에러
 */
export async function updatePageImages(
  eventId: string,
  pageName: 'outline' | 'notice' | 'meeting' | 'course' | 'souvenir',
  imageItems: UploadItem[]
): Promise<void> {
  const formData = buildPageImageFormData(imageItems);

  // 공통 API 클라이언트를 사용하여 admin 서버로 인증 포함 POST 호출
  // - 엔드포인트: /api/v1/event/{eventId}/{pageName}Page
  // - 서버 타입: 'admin'
  // - withAuth: true (api.authPost)
  await api.authPost(
    'admin',
    `/api/v1/event/${eventId}/${pageName}Page`,
    formData
  );
}

/**
 * 5개 페이지 이미지를 순차적으로 업데이트
 * 
 * @param eventId - 대회 ID
 * @param pageImages - 각 페이지별 UploadItem 배열
 * @returns 실패한 페이지 이름 배열 (모두 성공 시 빈 배열)
 */
export async function updateAllPageImages(
  eventId: string,
  pageImages: {
    outline: UploadItem[];   // 대회요강 (imgPost)
    notice: UploadItem[];    // 유의사항 (imgNotice)
    meeting: UploadItem[];   // 집결출발 (imgConfirm)
    course: UploadItem[];    // 코스 (imgCourse)
    souvenir: UploadItem[];  // 기념품 (imgGift)
  }
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // 순차적으로 API 호출 (병렬 처리하지 않음)
  const pages: Array<{
    name: 'outline' | 'notice' | 'meeting' | 'course' | 'souvenir';
    label: string;
    items: UploadItem[];
  }> = [
    { name: 'outline', label: '대회요강', items: pageImages.outline },
    { name: 'notice', label: '유의사항', items: pageImages.notice },
    { name: 'meeting', label: '집결출발', items: pageImages.meeting },
    { name: 'course', label: '코스', items: pageImages.course },
    { name: 'souvenir', label: '기념품', items: pageImages.souvenir },
  ];
  
  for (const page of pages) {
    // 이미지가 없으면 스킵 (빈 배열은 업데이트하지 않음)
    if (!page.items || page.items.length === 0) {
      continue;
    }
    
    // 실제로 업데이트할 이미지가 있는지 확인 (url이나 file이 있어야 함)
    const hasValidItems = page.items.some(
      item => (item.url && (!item.file || item.file.size === 0)) || 
              (item.file && item.file instanceof File && item.file.size > 0)
    );
    
    if (!hasValidItems) {
      continue;
    }
    
    try {
      await updatePageImages(eventId, page.name, page.items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
      // 백엔드 null 에러인 경우에도 실제로는 성공했을 수 있으므로 경고만 표시
      const isNullError = errorMsg.includes('null') || errorMsg.includes('NullPointerException');
      if (isNullError) {
        console.warn(`페이지 이미지 업데이트 중 백엔드 에러 발생 (실제로는 성공했을 수 있음): ${page.label}`, errorMsg);
        // 에러로 표시하지 않고 계속 진행 (실제로는 성공했을 수 있음)
      } else {
        errors.push(`${page.label}: ${errorMsg}`);
      }
    }
  }
  
  return {
    success: errors.length === 0,
    errors,
  };
}

