import type { UploadItem } from '@/components/common/Upload/types';

export type PopupRow = {
  id: string;
  url: string;
  image: UploadItem | null;
  visible: boolean;
  device: 'PC' | 'MOBILE' | 'BOTH';
  startAt?: string;
  endAt?: string;
  orderNo: number;
  eventId?: string;
  draft?: boolean;
};

export interface PopupListManagerRef {
  addNewPopup: () => void;
  handleSave: () => void;
}

