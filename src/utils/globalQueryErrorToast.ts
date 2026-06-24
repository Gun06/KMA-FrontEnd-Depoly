import { toast } from 'react-toastify';
import { HttpError } from '@/hooks/useFetch';
import { extractCanRefresh } from '@/utils/authErrorResponse';

const DEDUPE_MS = 2500;
const recentToastAt = new Map<string, number>();

const isEnglishAuthNoise = (message: string): boolean =>
  /unauthorized|forbidden|access denied/i.test(message);

/** 401·인증 실패 403(canRefresh 있음) → logout 경로, 전역 토스트 생략 */
const shouldSuppressAuthToast = (error: unknown): boolean => {
  if (!(error instanceof HttpError)) return false;

  if (error.status === 401) return true;

  if (error.status === 403) {
    const canRefresh = extractCanRefresh(error.data);
    return canRefresh !== undefined;
  }

  return false;
};

const resolveDisplayMessage = (error: unknown, message: string): string => {
  if (error instanceof HttpError && error.status === 403) {
    const canRefresh = extractCanRefresh(error.data);
    if (canRefresh === undefined && (isEnglishAuthNoise(message) || !message.trim())) {
      return '이 작업을 수행할 권한이 없습니다.';
    }
  }

  if (isEnglishAuthNoise(message)) {
    return '요청을 처리할 수 없습니다. 다시 시도해 주세요.';
  }

  return message;
};

const showOnce = (message: string): void => {
  const now = Date.now();
  const last = recentToastAt.get(message);
  if (last != null && now - last < DEDUPE_MS) return;

  recentToastAt.set(message, now);
  toast.error(message);
};

/** React Query 전역 onError용 토스트 (쿼리/뮤테이션 공통) */
export const showGlobalQueryErrorToast = (error: unknown): void => {
  const rawMessage = (() => {
    if (error instanceof HttpError) return error.message;
    if (error instanceof Error) return error.message;
    return '요청 중 오류가 발생했습니다.';
  })();

  if (shouldSuppressAuthToast(error)) return;

  showOnce(resolveDisplayMessage(error, rawMessage));
};
