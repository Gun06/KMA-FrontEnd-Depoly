/**
 * 이미지 업로드 서비스
 */

import { tokenService } from '@/utils/tokenService';

export interface ImageUploadResponse {
  imgSrc?: string;  // 유저 서버 응답
  url?: string;     // 관리자 서버 응답
}

export type ServerType = 'admin' | 'user';

/**
 * 이미지 업로드 API
 * - admin: POST /api/v1/image (인증 필요)
 * - user: POST /api/v0/public/image (public)
 */
export const uploadImage = async (
  imageFile: File,
  domainType: 'QUESTION' | 'EVENT' | 'NOTICE' | 'COURSE' | 'ANSWER' | 'MAIN_BANNER' | 'MAIN_SPONSOR' = 'QUESTION',
  serverType: ServerType = 'admin'
): Promise<ImageUploadResponse> => {
  // 서버 타입에 따라 다른 API 엔드포인트 사용
  const API_BASE_URL = serverType === 'admin' 
    ? process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN 
    : process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  
  const API_ENDPOINT = serverType === 'admin'
    ? `${API_BASE_URL}/api/v1/image?domainType=${domainType}`
    : `${API_BASE_URL}/api/v0/public/image?domainType=${domainType}`;

  console.log(`🔄 이미지 업로드 시작 (${serverType} 서버):`, {
    fileName: imageFile.name,
    fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
    endpoint: API_ENDPOINT
  });

  // FormData 구성
  const formData = new FormData();
  formData.append('imageFile', imageFile);

  // 헤더 구성 (관리자는 인증 필요)
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // 관리자 서버일 경우 Authorization 헤더 추가
  if (serverType === 'admin') {
    const adminToken = tokenService.getAdminAccessToken();
    if (!adminToken) {
      throw new Error('관리자 인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ 이미지 업로드 실패:', {
      serverType,
      status: response.status,
      error: errorText,
      endpoint: API_ENDPOINT
    });
    throw new Error(`이미지 업로드 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ 이미지 업로드 성공:', data);
  return data;
};

