export type PageMediaType = 'IMAGE' | 'VIDEO_LINK';

export type PageMediaItem = {
  imageUrl: string;
  mediaType?: PageMediaType | string;
  orderNumber: number;
};
