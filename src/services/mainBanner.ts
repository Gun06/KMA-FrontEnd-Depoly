import { request } from '@/hooks/useFetch';
import type {
  MainBannerBatchRequest,
  MainBannerListResponse,
  MainBannerDetailResponse,
  MainBannerUpdateInfo,
} from '@/types/mainBanner';

// 메인 배너 전체 조회 (공개용)
export async function getMainBanners(): Promise<MainBannerListResponse> {
  return request<MainBannerListResponse>(
    'admin',
    '/api/v1/homepage/main-banner',
    'GET',
    undefined,
    false
  ) as Promise<MainBannerListResponse>;
}

// 메인 배너 전체 조회 (관리자용)
export async function getMainBannersForAdmin(): Promise<MainBannerListResponse> {
  return request<MainBannerListResponse>(
    'admin',
    '/api/v1/homepage/main-banner',
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<MainBannerListResponse>;
}

// 메인 배너 상세 조회 (공개용)
export async function getMainBannerById(mainBannerId: string): Promise<MainBannerDetailResponse> {
  return request<MainBannerDetailResponse>(
    'admin',
    `/api/v1/homepage/main-banner/${mainBannerId}`,
    'GET',
    undefined,
    false
  ) as Promise<MainBannerDetailResponse>;
}

// 메인 배너 상세 조회 (관리자용)
export async function getMainBannerByIdForAdmin(mainBannerId: string): Promise<MainBannerDetailResponse> {
  return request<MainBannerDetailResponse>(
    'admin',
    `/api/v1/homepage/main-banner/${mainBannerId}`,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<MainBannerDetailResponse>;
}

// 메인 배너 일괄 처리 (생성/수정/삭제/순서변경)
export async function createOrUpdateMainBanners(
  mainBannerBatchRequest: MainBannerBatchRequest,
  images: File[]
): Promise<MainBannerListResponse> {
  const formData = new FormData();

  // 백엔드 스펙 키 이름 유지
  formData.append('MainBannerUpdateRequest', JSON.stringify(mainBannerBatchRequest));

  // 이미지 파일들 추가 (새로 생성된 배너의 개수와 정확히 일치해야 함)
  images.forEach((image) => {
    formData.append('images', image);
  });

  try {
    return (await request<MainBannerListResponse>(
      'admin',
      '/api/v1/homepage/main-banner',
      'POST',
      formData,
      true
    )) as MainBannerListResponse;
  } catch (error) {
    throw error;
  }
}

// 메인 배너 단건 수정
export async function updateMainBanner(
  mainBannerId: string,
  mainBannerUpdateInfo: MainBannerUpdateInfo,
  image?: File
): Promise<MainBannerDetailResponse> {
  const formData = new FormData();

  // 백엔드 스펙 키 이름 유지(단건은 소문자 시작)
  formData.append('mainBannerUpdateInfo', JSON.stringify(mainBannerUpdateInfo));
  if (image) formData.append('images', image);

  return (await request<MainBannerDetailResponse>(
    'admin',
    `/api/v1/homepage/main-banner/${mainBannerId}`,
    'PATCH',
    formData,
    true
  )) as MainBannerDetailResponse;
}
