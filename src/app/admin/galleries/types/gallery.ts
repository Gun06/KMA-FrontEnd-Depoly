import type { Gallery } from '../data/types';

// 갤러리 관리자 화면에서만 사용하는 추가 타입/뷰 모델 정의용

export type GalleryFormState = Gallery;

export interface GalleryCreatePayload {
  title: string;
  tagName: string;
  eventStartDate: string; // YYYY-MM-DD
  googlePhotoUrl: string;
  thumbnailFile: File;
}

