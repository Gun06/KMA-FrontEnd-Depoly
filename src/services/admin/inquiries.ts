// src/services/admin/inquiries.ts
// 문의사항 API 서비스 (메인 + 이벤트)

import { request } from '@/hooks/useFetch';

// 문의사항 검색 파라미터 타입
export interface InquirySearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  questionSortKey?: 'LATEST' | 'TITLE';
  questionSearchKey?: 'TITLE' | 'AUTHOR';
}

// 문의사항 타입 정의
export interface InquiryItem {
  no: number;
  id: string;
  title: string;
  author: string;
  eventName?: string;
  createdAt: string;
  answer?: {
    id: string;
    title: string;
    author: string;
    createdAt: string;
    attachmentUrls?: string[];
  };
  secret: boolean;
  answered: boolean;
}

export interface InquiryDetail {
  questionDetail: {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    attachmentUrls: string[];
    secret: boolean;
    answered: boolean;
  };
  answerDetail?: {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    attachmentUrls: string[];
  } | null;
}

export interface AnswerCreateRequest {
  title: string;
  content: string;
}

export interface AnswerUpdateRequest {
  title: string;
  content: string;
  deleteFileUrls: string[];
}

export interface AnswerCreateResponse {
  id: string;
}

export interface InquiryListResponse {
  content: InquiryItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 1) 홈페이지 문의 목록 조회
export async function getHomepageInquiries(_page: number = 1, _size: number = 20): Promise<InquiryListResponse> {
  return request<InquiryListResponse>(
    'admin',
    '/api/v1/homepage/question',
    'GET',
    undefined,
    true
  ) as Promise<InquiryListResponse>;
}

// 2) 대회별 문의 목록 조회
export async function getEventInquiries(eventId: string, _page: number = 1, _size: number = 20): Promise<InquiryListResponse> {
  return request<InquiryListResponse>(
    'admin',
    `/api/v1/${eventId}/question`,
    'GET',
    undefined,
    true
  ) as Promise<InquiryListResponse>;
}

// 3) 문의 상세 조회
export async function getInquiryDetail(inquiryId: string): Promise<InquiryDetail> {
  return request<InquiryDetail>(
    'admin',
    `/api/v1/question/${inquiryId}`,
    'GET',
    undefined,
    true
  ) as Promise<InquiryDetail>;
}

// 4) 답변 생성
export async function createAnswer(
  inquiryId: string,
  data: AnswerCreateRequest,
  attachments?: File[]
): Promise<AnswerCreateResponse> {
  const formData = new FormData();
  formData.append('answerRequest', JSON.stringify(data));
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }

  return request<AnswerCreateResponse>(
    'admin',
    `/api/v1/${inquiryId}/answer`,
    'POST',
    formData,
    true
  ) as Promise<AnswerCreateResponse>;
}

// 5) 답변 수정
export async function updateAnswer(
  answerId: string,
  data: AnswerUpdateRequest,
  attachments?: File[]
): Promise<string> {
  const formData = new FormData();
  formData.append('answerUpdate', JSON.stringify(data));
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }

  return request<string>(
    'admin',
    `/api/v1/answer/${answerId}`,
    'PUT',
    formData,
    true
  ) as Promise<string>;
}

// 6) 문의사항 삭제
export async function deleteInquiry(inquiryId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/question/${inquiryId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}

// 7) 답변 삭제
export async function deleteAnswer(answerId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/answer/${answerId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}
