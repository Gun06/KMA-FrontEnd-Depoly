// 개인 Excel 업로드/다운로드 관련 API 함수

import { request } from '@/hooks/useFetch';
import { tokenService } from '@/utils/tokenService';

/**
 * 개인 신청 양식 다운로드
 * @param eventId 이벤트 ID
 */
export async function downloadPersonalForm(eventId: string): Promise<void> {
  const url = `/api/v1/${eventId}/personal/download`;
  
  try {
    // tokenService를 사용하여 토큰 가져오기
    const token = tokenService.getAdminAccessToken();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    // baseUrl을 직접 구성하여 전체 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN;
    if (!baseUrl) {
      throw new Error('API base URL이 설정되지 않았습니다.');
    }
    const fullUrl = `${baseUrl}${url}`;
    
    // Authorization 헤더를 추가하여 fetch로 요청
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }
    
    // Blob으로 변환 후 다운로드
    const blob = await response.blob();
    
    // Content-Disposition 헤더에서 파일명 추출
    const contentDisposition = response.headers.get('content-disposition');
    let filename: string | undefined;
    
    if (contentDisposition) {
      // UTF-8 인코딩된 파일명을 우선적으로 찾기
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else {
        // UTF-8 파일명이 없으면 일반 filename 사용
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
    }
    
    // 파일명이 없으면 기본 파일명 사용
    if (!filename) {
      filename = `개인신청양식_${eventId}.xlsx`;
    }
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    throw new Error('다운로드에 실패했습니다.');
  }
}

/**
 * 개인 Excel 파일 업로드
 * @param eventId 이벤트 ID
 * @param file Excel 파일
 * @param options 업로드 옵션 (signal 등)
 */
export async function uploadPersonalForm(
  eventId: string,
  file: File,
  options?: { signal?: AbortSignal }
): Promise<string> {
  const formData = new FormData();
  formData.append('excelFile', file);
  
  const url = `/api/v1/registration/event/${eventId}/personal/excel-upload`;
  
  try {
    const response = await request('admin', url, 'POST', formData, true, {
      signal: options?.signal,
    });
    return response as string;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error instanceof Error ? error : new Error('업로드에 실패했습니다.');
  }
}
