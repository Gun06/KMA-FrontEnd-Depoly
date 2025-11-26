/**
 * 이미지 업로드 서비스
 */

export interface ImageUploadResponse {
  imgSrc: string;
}

/**
 * 이미지 업로드 API
 * POST /api/v0/public/image
 */
export const uploadImage = async (
  imageFile: File,
  domainType: 'QUESTION' | 'EVENT' | 'NOTICE' | 'COURSE' | 'ANSWER' | 'MAIN_BANNER' | 'MAIN_SPONSOR' = 'QUESTION'
): Promise<ImageUploadResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/image?domainType=${domainType}`;

  // FormData 구성
  const formData = new FormData();
  formData.append('imageFile', imageFile);

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`이미지 업로드 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

