// src/components/ui/Table/types.ts
export type Category = "필독" | "공지" | "이벤트" | "문의" | "답변" | "일반";

export interface NoticeItem {
  id: string; // 작업한 내용: string으로 통일
  category?: Category;   // 일반행 제목 앞 칩에 쓰임. pinned면 1열 뱃지에도 사용
  title: string;
  author: string;
  authorId?: string;     // 작성자 ID (비밀글 권한 체크용)
  date: string;          // YYYY-MM-DD
  attachments: number;   // 첨부파일 개수
  views: number;
  pinned?: boolean;      // 고정 공지
  secret?: boolean;      // 비밀글 여부 (문의사항용)
  answered?: boolean;    // 답변 완료 여부 (문의사항용)
  canViewContent?: boolean; // 내용 조회 권한 여부 (JWT 기반)
  isAuthor?: boolean;    // 현재 사용자가 작성자인지 여부
  originalQuestionId?: string; // 원본 문의 ID (답변용) - 작업한 내용: string으로 통일
  answerHeaderId?: string;     // 답변 헤더 ID (답변용)
  __displayNo?: number | '필독' | undefined; // 표시할 번호 (문의사항용)
  answer?: {           // 답변 정보 (질문과 답변을 하나로 통합할 때 사용)
    title: string;
    content: string;
    author: string;
    date: string;
    files: any[];
  };
}
