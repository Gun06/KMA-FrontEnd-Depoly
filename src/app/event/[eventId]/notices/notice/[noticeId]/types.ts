// API 응답용 인터페이스
export interface NoticeDetailResponse {
  id: string;
  title: string;
  content: string;
  author: string;
  noticeCategoryId: string;
  viewCount: number;
  createdAt: string;
  attachmentUrls: string[];
}

// 첨부파일 인터페이스
export interface AttachmentFile {
  url: string;
  filename: string;
  index: number;
}

// Notice 상세 상태 인터페이스
export interface NoticeDetailState {
  noticeDetail: NoticeDetailResponse | null;
  isLoading: boolean;
  error: string | null;
}
