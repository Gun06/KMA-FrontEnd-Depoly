/**
 * 강화된 에러 처리 유틸리티
 * 네트워크 오류와 인증 오류를 구분하여 처리
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  status?: number;
  code?: string;
  shouldRetry: boolean;
  shouldLogout: boolean;
}

/**
 * 에러 타입 분류
 */
export const classifyError = (error: unknown): ErrorInfo => {
  // HttpError인 경우
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as {
      status: number;
      message?: string;
      code?: string;
    };

    switch (httpError.status) {
      case 0:
        return {
          type: ErrorType.NETWORK,
          message: '네트워크 연결을 확인해주세요.',
          status: 0,
          shouldRetry: true,
          shouldLogout: false,
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: '로그인이 필요합니다.',
          status: 401,
          code: httpError.code,
          shouldRetry: false,
          shouldLogout: true,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: '접근 권한이 없습니다.',
          status: 403,
          code: httpError.code,
          shouldRetry: false,
          shouldLogout: false,
        };

      case 400:
      case 422:
        return {
          type: ErrorType.VALIDATION,
          message: httpError.message || '입력값을 확인해주세요.',
          status: httpError.status,
          code: httpError.code,
          shouldRetry: false,
          shouldLogout: false,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: httpError.status,
          shouldRetry: true,
          shouldLogout: false,
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          message: httpError.message || '알 수 없는 오류가 발생했습니다.',
          status: httpError.status,
          shouldRetry: false,
          shouldLogout: false,
        };
    }
  }

  // 일반 Error인 경우
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      shouldRetry: false,
      shouldLogout: false,
    };
  }

  // 알 수 없는 에러
  return {
    type: ErrorType.UNKNOWN,
    message: '알 수 없는 오류가 발생했습니다.',
    shouldRetry: false,
    shouldLogout: false,
  };
};

/**
 * 에러 로깅
 */
export const logError = (error: unknown, context?: string) => {
  const errorInfo = classifyError(error);

  const logData = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    type: errorInfo.type,
    message: errorInfo.message,
    status: errorInfo.status,
    code: errorInfo.code,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
  }

  // 프로덕션에서는 에러 추적 서비스로 전송 (예: Sentry)
  // TODO: 실제 에러 추적 서비스 연동
};

/**
 * 사용자 친화적 에러 메시지 생성
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const errorInfo = classifyError(error);

  switch (errorInfo.type) {
    case ErrorType.NETWORK:
      return '네트워크 연결을 확인하고 다시 시도해주세요.';

    case ErrorType.AUTHENTICATION:
      return '로그인이 필요합니다. 로그인 페이지로 이동합니다.';

    case ErrorType.AUTHORIZATION:
      return '이 작업을 수행할 권한이 없습니다.';

    case ErrorType.VALIDATION:
      return errorInfo.message;

    case ErrorType.SERVER:
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

    default:
      return '예상치 못한 오류가 발생했습니다. 관리자에게 문의해주세요.';
  }
};

/**
 * 이미지 업로드 오류 메시지 생성기
 * - 배열을 사람이 읽기 쉬운 멀티라인 문자열로 변환
 */
export const createImageUploadErrorMessage = (errors: string[]): string => {
  if (!Array.isArray(errors) || errors.length === 0) return '필수 이미지가 누락되었습니다.';
  return errors.map((e, idx) => `- ${e || `항목 ${idx + 1} 오류`}`).join('\n');
};

/**
 * API 에러 메시지 추출 (shape-agnostic)
 * - HttpError 스타일(response.data/message/code)과 일반 Error 모두 지원
 */
export const extractApiErrorMessage = (error: unknown): string => {
  try {
    // 1) HttpError 스타일 (response.message 우선)
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { message?: unknown; data?: unknown; status?: unknown } }).response;
      const msg = typeof resp?.message === 'string' ? resp.message : undefined;
      if (msg && msg.trim()) return msg;

      // data.message 형태
      const data = resp?.data as unknown;
      if (data && typeof data === 'object' && 'message' in data) {
        const dm = (data as { message?: unknown }).message;
        if (typeof dm === 'string' && dm.trim()) return dm;
      }
    }

    // 2) 일반 Error(message)
    if (error instanceof Error && error.message) return error.message;

    // 3) 공용 사용자 메시지 fallback
    return getUserFriendlyMessage(error);
  } catch {
    return '요청 처리 중 오류가 발생했습니다.';
  }
};

/**
 * 재시도 로직
 */
export const shouldRetry = (error: unknown, attemptCount: number): boolean => {
  const errorInfo = classifyError(error);
  const maxRetries = 3;

  if (!errorInfo.shouldRetry || attemptCount >= maxRetries) {
    return false;
  }

  // 네트워크 오류는 즉시 재시도
  if (errorInfo.type === ErrorType.NETWORK) {
    return true;
  }

  // 서버 오류는 지수 백오프로 재시도
  if (errorInfo.type === ErrorType.SERVER) {
    const delay = Math.pow(2, attemptCount) * 1000; // 1초, 2초, 4초
    setTimeout(() => {
      // 재시도 로직은 호출하는 곳에서 구현
    }, delay);
    return true;
  }

  return false;
};

/**
 * 토큰 탈취 의심 시 처리
 */
export const handleSuspiciousActivity = (error: unknown) => {
  const errorInfo = classifyError(error);

  // 특정 에러 코드나 패턴이 토큰 탈취를 시사하는 경우
  const suspiciousPatterns = [
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'TOKEN_REVOKED',
    'SUSPICIOUS_ACTIVITY',
  ];

  const isSuspicious = suspiciousPatterns.some(
    pattern =>
      errorInfo.code?.includes(pattern) || errorInfo.message?.includes(pattern)
  );

  if (isSuspicious) {
    // 모든 토큰 즉시 삭제
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // 로그아웃 브로드캐스트
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmaSecurityAlert', String(Date.now()));
    }

    // 보안 로그 기록
    logError(error, 'Suspicious activity detected');

    return true;
  }

  return false;
};

/**
 * 에러 처리 훅
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    const errorInfo = classifyError(error);

    // 에러 로깅
    logError(error, context);

    // 토큰 탈취 의심 시 처리
    if (handleSuspiciousActivity(error)) {
      // 보안 알림 표시
      if (typeof window !== 'undefined') {
        alert('보안상의 이유로 로그아웃됩니다. 다시 로그인해주세요.');
        (window as any).location.href = '/login';
      }
      return;
    }

    // 사용자에게 알림
    const message = getUserFriendlyMessage(error);

    // 토스트 알림 또는 모달로 표시
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.toast && typeof w.toast.error === 'function') {
        w.toast.error(message);
      } else {
      }
    }
  };

  return { handleError };
};
