/** JwtFilter 인증 실패 응답 (403) */
export type AuthErrorResponse = {
  canRefresh?: boolean;
  message?: string;
  code?: string;
  httpStatus?: string;
};

/** 401/403 응답 본문에서 canRefresh 추출. 없으면 undefined */
export const extractCanRefresh = (data: unknown): boolean | undefined => {
  if (typeof data !== 'object' || data === null || !('canRefresh' in data)) {
    return undefined;
  }
  const value = (data as AuthErrorResponse).canRefresh;
  return typeof value === 'boolean' ? value : undefined;
};
