export type Gallery = {
    eventId: string;
    date: string;           // 등록일 yyyy.MM.dd
    tagName: string;        // 대회 태그명
    title: string;          // 대회명
    googlePhotosUrl: string;
    thumbnailImageUrl?: string; // 썸네일 이미지 URL
    visible: boolean;       // 공개여부
    views: number;
    periodFrom: string;     // YYYY-MM-DD
    periodTo: string;       // YYYY-MM-DD
  };
  
  export type GalleryFilter = {
    sort?: "no" | "date" | "title";
    visible?: "on" | "off";
    q?: string;
  };
  
  export type Paged<T> = {
    rows: T[];
    total: number;
  };
  