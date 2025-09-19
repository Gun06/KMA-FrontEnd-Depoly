export interface AttachmentInfo {
  url: string;
  originName: string;
  originMb: number;
}

export interface AnswerHeader {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  content?: string; // 답변 내용이 포함될 수 있음
}

// 문의사항 상세보기 API 응답 인터페이스 (API 문서에 맞춤)
export interface InquiryDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  attachmentInfoList: AttachmentInfo[];
  secret: boolean;
  // answerHeader는 목록 API에서만 제공됨
}

// 답변 상세 정보 인터페이스 (API 문서에 맞춤)
export interface AnswerDetail {
  id: string;
  title: string;
  content: string;
  admin_id: string;
  question_id: string;
  created_at: string; // cre 대신 created_at 사용
  isSecret?: boolean;
  attachmentDetailList?: Array<{
    url: string;
    originName: string;
    originMb: number;
  }>;
}
