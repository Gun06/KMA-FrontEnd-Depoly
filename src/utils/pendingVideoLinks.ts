import type { UploadItem } from '@/components/common/Upload/types';

export type PageMediaKey =
  | 'notice'
  | 'outline'
  | 'course'
  | 'souvenir'
  | 'meeting';

type FlushHandler = () => void;

type PageMediaRegistryEntry = {
  flush: () => void;
  getItems: () => UploadItem[];
};

const flushHandlers = new Set<FlushHandler>();
const pageMediaRegistry = new Map<PageMediaKey, PageMediaRegistryEntry>();

export function registerPendingVideoFlush(handler: FlushHandler): () => void {
  flushHandlers.add(handler);
  return () => {
    flushHandlers.delete(handler);
  };
}

export function registerPageMedia(
  key: PageMediaKey,
  entry: PageMediaRegistryEntry
): () => void {
  pageMediaRegistry.set(key, entry);
  return () => {
    if (pageMediaRegistry.get(key) === entry) {
      pageMediaRegistry.delete(key);
    }
  };
}

/** 저장 직전 입력 중인 영상 링크를 업로드 목록에 반영 */
export function flushPendingVideoLinks(): void {
  pageMediaRegistry.forEach(entry => entry.flush());
  flushHandlers.forEach(handler => handler());
}

export function getRegisteredPageMedia(
  key: PageMediaKey,
  fallback: UploadItem[] = []
): UploadItem[] {
  return pageMediaRegistry.get(key)?.getItems() ?? fallback;
}
