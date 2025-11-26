// 메인 문의사항 타입 정의

export interface InquiryDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // 작성자 ID 추가
  createdAt: string;
  attachmentInfoList: Array<{
    url: string;
    originName: string;
    originMb: number;
  }>;
  secret: boolean;
  answerHeader?: AnswerHeader;
}

export interface AnswerHeader {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  content?: string;
  isSecret?: boolean;
  attachmentDetailList?: Array<{
    url: string;
    originName: string;
    originMb: number;
  }>;
}

export interface AnswerDetail {
  id: string;
  title: string;
  content: string;
  admin_id: string;
  question_id: string;
  created_at: string;
  isSecret?: boolean;
  attachmentDetailList?: Array<{
    url: string;
    originName: string;
    originMb: number;
  }>;
}
