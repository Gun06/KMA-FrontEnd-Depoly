import type { UploadItem } from '@/components/common/Upload/types';

// 메인 배너 로컬 상태 타입
export type MainBannerRowType = {
  id: string | number;
  title: string;
  subtitle: string;
  date: string;
  eventId?: string;
  image: UploadItem | null;
  visible: boolean;
  draft?: boolean;
  orderNo: number;
};

// 메인 배너 폼 데이터 타입
export type MainBannerFormData = {
  title: string;
  subtitle: string;
  date: string;
  eventId?: string;
  visible: boolean;
};

// 이벤트 드롭다운 옵션 타입
export type Opt = { key: string; label: string };

