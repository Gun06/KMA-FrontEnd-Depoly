// src/components/ui/Table/types.ts
export type Category = "공지" | "이벤트" | "대회" | "문의" | "답변";

export interface NoticeItem {
  id: number;
  category?: Category;   // 일반행 제목 앞 칩에 쓰임. pinned면 1열 뱃지에도 사용
  title: string;
  author: string;
  date: string;          // YYYY-MM-DD
  attachments: number;   // 첨부파일 개수
  views: number;
  pinned?: boolean;      // 고정 공지
}
