// src/utils/errorHandler.ts

/**
 * 에러 처리를 위한 유틸리티 함수들
 */

/**
 * 사용자 친화적인 에러 메시지 생성
 */
export const createUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * API 에러 메시지 추출
 */
export const extractApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    // API 응답 에러 객체에서 메시지 추출
    if ('data' in error && error.data && typeof error.data === 'object') {
      const data = error.data as Record<string, unknown>;
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      if ('error' in data && typeof data.error === 'string') {
        return data.error;
      }
    }
    
    // 일반 에러 객체에서 메시지 추출
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  
  return '서버와의 통신 중 오류가 발생했습니다.';
};

/**
 * 이미지 업로드 관련 에러 메시지 생성
 */
export const createImageUploadErrorMessage = (errors: string[]): string => {
  if (errors.length === 0) return '';
  
  const prefix = '다음 이미지들을 업로드해주세요:';
  const errorList = errors.map(error => `• ${error}`).join('\n');
  
  return `${prefix}\n${errorList}`;
};

/**
 * 네트워크 에러인지 확인
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'TypeError' && error.message.includes('fetch');
  }
  return false;
};

/**
 * 서버 에러인지 확인
 */
export const isServerError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: unknown }).status;
    return typeof status === 'number' && status >= 500;
  }
  return false;
};
