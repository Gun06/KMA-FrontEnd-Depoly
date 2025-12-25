// 메인 배너 관리자용 API 함수들
export {
  getMainBannersForAdmin,
  getMainBannerByIdForAdmin,
  createOrUpdateMainBanners,
  updateMainBanner,
} from './mainBanner';

export type {
  MainBannerListResponse,
  MainBannerDetailResponse,
} from '@/types/mainBanner';

