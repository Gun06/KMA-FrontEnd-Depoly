/**
 * 배치 예외처리 유틸리티
 * 서버에서 반환하는 오류 메시지를 사용자 친화적인 형식으로 변환
 */

interface BatchError {
  row?: number;
  field?: string;
  target?: string;
  code?: string;
  message?: string;
  rejectedValue?: any;
}

interface ErrorResponse {
  httpStatus?: string;
  code?: string;
  message?: string;
  error?: string;
  errors?: BatchError[];
}

/**
 * API 오류 메시지에서 서버 메시지 추출
 */
export function extractServerMessage(errorMessage: string): string {
  // "API 오류: 400 Bad Request - 서버메시지" 형식에서 서버 메시지만 추출
  const apiErrorMatch = errorMessage.match(/API 오류:.*? - (.+)/);
  if (apiErrorMatch && apiErrorMatch[1]) {
    return apiErrorMatch[1];
  }
  
  // "API 호출 실패: 400 - 서버메시지" 형식에서 서버 메시지만 추출
  const apiCallErrorMatch = errorMessage.match(/API 호출 실패:.*? - (.+)/);
  if (apiCallErrorMatch && apiCallErrorMatch[1]) {
    return apiCallErrorMatch[1];
  }
  
  // "수정 실패: 400 - 서버메시지" 형식에서 서버 메시지만 추출
  if (errorMessage.includes('수정 실패:')) {
    const updateErrorMatch = errorMessage.match(/수정 실패:.*? - (.+)/);
    if (updateErrorMatch && updateErrorMatch[1]) {
      return updateErrorMatch[1];
    }
  }
  
  // 기타 에러는 원본 메시지 사용
  return errorMessage;
}

/**
 * JSON 형식의 오류 메시지 파싱
 */
export function parseErrorJson(serverMessage: string): ErrorResponse | null {
  try {
    // 먼저 전체 문자열이 JSON인지 확인
    if (serverMessage.trim().startsWith('{')) {
      try {
        return JSON.parse(serverMessage) as ErrorResponse;
      } catch {
        // 전체 문자열 파싱 실패 시 중괄호로 감싸진 부분만 추출
      }
    }
    
    // 중괄호로 감싸진 JSON 부분 추출
    const jsonMatch = serverMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ErrorResponse;
    }
  } catch {
    // JSON 파싱 실패 시 null 반환
  }
  return null;
}

/**
 * 배치 오류 메시지 포맷팅
 */
export function formatBatchError(error: BatchError): string {
  const message = error.message || error.code || '오류가 발생했습니다.';
  let errorText = message;
  
  // rejectedValue가 있으면 함께 표시
  if (error.rejectedValue) {
    const rejectedValue = Array.isArray(error.rejectedValue) 
      ? error.rejectedValue.join(', ')
      : String(error.rejectedValue);
    errorText = `${message}\n(입력값: ${rejectedValue})`;
  }
  
  // row 정보가 있으면 함께 표시
  if (error.row !== undefined) {
    errorText = `${errorText}${error.rejectedValue ? '' : '\n'}(참가자 ${error.row}번째 행)`;
  }
  
  return errorText;
}

/**
 * 배치 오류 메시지들을 사용자 친화적인 형식으로 변환
 */
export function formatBatchErrors(errorJson: ErrorResponse): string {
  const mainMessage = errorJson.message || errorJson.error || '오류가 발생했습니다.';
  
  // errors 배열이 있고 비어있지 않으면 상세 오류 메시지 추출
  if (errorJson.errors && Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
    const formattedErrors = errorJson.errors.map(formatBatchError);
    
    if (formattedErrors.length > 0) {
      // 메인 메시지와 상세 오류 메시지를 함께 표시
      return formattedErrors.length === 1 
        ? formattedErrors[0]
        : `${mainMessage}\n\n${formattedErrors.map((msg: string, idx: number) => `${idx + 1}. ${msg}`).join('\n\n')}`;
    }
  }
  
  // errors가 null이거나 빈 배열이면 메인 메시지만 반환
  return mainMessage;
}

/**
 * 에러 객체를 사용자 친화적인 메시지로 변환
 */
export function formatError(error: unknown): string {
  if (!(error instanceof Error)) {
    return '오류가 발생했습니다.';
  }
  
  const errorMsg = error.message;
  const serverMessage = extractServerMessage(errorMsg);
  
  // JSON 형식의 오류 메시지 파싱 및 정제
  const errorJson = parseErrorJson(serverMessage);
  
  if (errorJson) {
    return formatBatchErrors(errorJson);
  }
  
  // JSON이 아닌 경우 원본 서버 메시지 사용
  return serverMessage;
}
