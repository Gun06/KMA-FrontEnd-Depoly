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

// 관리자용 API 함수들은 src/components/admin/banners/main/api/mainBanner.ts로 이동됨
