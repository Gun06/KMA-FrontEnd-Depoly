import { request } from '@/hooks/useFetch';
import type { 
  SponsorUpdateInfo, 
  SponsorBatchRequest, 
  SponsorListResponse, 
  SponsorDetailResponse,
} from '@/types/sponsor';

// 스폰서 목록 조회 (관리자용)
export async function getSponsors(): Promise<SponsorListResponse> {
  return request<SponsorListResponse>(
    'admin',
    '/api/v1/homepage/sponsor',
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<SponsorListResponse>;
}

// 스폰서 목록 조회 (공개용)
export async function getPublicSponsors(): Promise<SponsorListResponse> {
  return request<SponsorListResponse>(
    'admin', // Admin 서버로 변경 (User 서버에는 해당 API가 없음)
    '/api/v1/homepage/sponsor',
    'GET',
    undefined,
    true // Admin 서버이므로 인증 필요
  ) as Promise<SponsorListResponse>;
}

// 스폰서 상세 조회
export async function getSponsorById(sponsorId: string): Promise<SponsorDetailResponse> {
  return request<SponsorDetailResponse>(
    'admin',
    `/api/v1/homepage/sponsor/${sponsorId}`,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<SponsorDetailResponse>;
}

// 스폰서 일괄 처리 (생성/수정/삭제/순서변경)
export async function createOrUpdateSponsors(
  sponsorBatchRequest: SponsorBatchRequest,
  images: File[]
): Promise<SponsorListResponse> {
  const formData = new FormData();
  
  // JSON 데이터 추가
  formData.append('sponsorBatchRequest', JSON.stringify(sponsorBatchRequest));
  
  // 이미지 파일들 추가 (새로 생성된 스폰서의 개수와 정확히 일치해야 함)
  images.forEach((image) => {
    formData.append('images', image);
  });

  return request<SponsorListResponse>(
    'admin',
    '/api/v1/homepage/sponsor',
    'POST',
    formData,
    true // 관리자 API이므로 인증 필요
  ) as Promise<SponsorListResponse>;
}

// 스폰서 수정
export async function updateSponsor(
  sponsorId: string,
  sponsorUpdateInfo: SponsorUpdateInfo,
  image?: File
): Promise<SponsorDetailResponse> {
  const formData = new FormData();
  
  // JSON 데이터 추가
  formData.append('sponsorUpdateInfo', JSON.stringify(sponsorUpdateInfo));
  
  // 이미지 파일 추가 (있는 경우)
  if (image) {
    formData.append('image', image);
  }

  return request<SponsorDetailResponse>(
    'admin',
    `/api/v1/homepage/sponsor/${sponsorId}`,
    'PATCH',
    formData,
    true // 관리자 API이므로 인증 필요
  ) as Promise<SponsorDetailResponse>;
}

// 스폰서 삭제 (일괄 처리에서 처리)
export async function deleteSponsor(): Promise<void> {
  // 실제로는 일괄 처리 API를 사용하므로 여기서는 빈 함수
  // 필요시 별도 DELETE 엔드포인트가 있다면 구현
  throw new Error('스폰서 삭제는 일괄 처리 API를 사용하세요');
}


