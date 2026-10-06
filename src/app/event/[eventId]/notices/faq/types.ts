// FAQ API 응답용 인터페이스
export interface FaqItem {
  problem: string;
  solution: string;
}

export interface FaqResponse {
  faqResponseList: FaqItem[];
  empty: boolean;
}

export type { DisplayFaqItem } from '@/components/common/faq/types';

// FAQ 상태 인터페이스
export interface FaqState {
  faqData: FaqResponse | null;
  isLoading: boolean;
  error: string | null;
  openSet: Set<number>;
}
