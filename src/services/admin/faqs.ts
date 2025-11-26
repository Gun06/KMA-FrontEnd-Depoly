// src/services/admin/faqs.ts
// FAQ API 서비스 (메인 + 이벤트)

import { request } from '@/hooks/useFetch';
import type {
  FaqDetail,
  FaqCreateRequest,
  FaqUpdateRequest,
  FaqSearchParams,
  FaqListResponse,
  FaqCreateResponse,
  FaqUpdateResponse,
  EventFaqResponse,
  HomepageFaqResponse
} from '@/types/faq';

// 타입 재export
export type { FaqSearchParams } from '@/types/faq';

// 메인 FAQ 목록 조회
export async function getHomepageFaqs(params: FaqSearchParams = {}): Promise<FaqListResponse> {
  const { page = 1, size = 20, keyword, FAQSearchKey } = params;
  
  // 검색 조건이 없으면 일반 조회 API 사용
  if (!keyword && !FAQSearchKey) {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString()); // 1부터 시작
    queryParams.append('size', size.toString());
    
    const result = await request<HomepageFaqResponse>('admin', `/api/v1/homepage/FAQ?${queryParams.toString()}`, 'GET', undefined, true);
    if (!result) throw new Error('FAQ 목록을 불러올 수 없습니다.');
    return result.faqList;
  }
  
  // 검색 조건이 있으면 검색 API 사용
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  if (keyword) queryParams.append('keyword', keyword);
  if (FAQSearchKey) queryParams.append('FAQSearchKey', FAQSearchKey);
  
  const result = await request<HomepageFaqResponse>('admin', `/api/v1/homepage/FAQ/search?${queryParams.toString()}`, 'GET', undefined, true);
  if (!result) throw new Error('FAQ 목록을 불러올 수 없습니다.');
  return result.faqList;
}

// 대회별 FAQ 목록 조회 (eventName 포함)
export async function getEventFaqs(eventId: string, params: FaqSearchParams = {}): Promise<{ faqList: FaqListResponse; eventName: string }> {
  const { page = 1, size = 20, keyword, FAQSearchKey } = params;
  
  // 검색 조건이 없으면 일반 조회 API 사용
  if (!keyword && !FAQSearchKey) {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString()); // 1부터 시작
    queryParams.append('size', size.toString());
    
    const result = await request<EventFaqResponse>('admin', `/api/v1/${eventId}/FAQ?${queryParams.toString()}`, 'GET', undefined, true);
    if (!result) throw new Error('FAQ 목록을 불러올 수 없습니다.');
    return { faqList: result.faqList, eventName: result.eventName };
  }
  
  // 검색 조건이 있으면 검색 API 사용
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  if (keyword) queryParams.append('keyword', keyword);
  if (FAQSearchKey) queryParams.append('FAQSearchKey', FAQSearchKey);
  
  const result = await request<EventFaqResponse>('admin', `/api/v1/${eventId}/FAQ/search?${queryParams.toString()}`, 'GET', undefined, true);
  if (!result) throw new Error('FAQ 목록을 불러올 수 없습니다.');
  return { faqList: result.faqList, eventName: result.eventName };
}

// FAQ 상세 조회
export async function getFaqDetail(faqId: string): Promise<FaqDetail> {
  const result = await request<FaqDetail>('admin', `/api/v1/FAQ/${faqId}`, 'GET', undefined, true);
  if (!result) throw new Error('FAQ 상세를 불러올 수 없습니다.');
  return result;
}

// 메인 FAQ 생성
export async function createHomepageFaq(data: FaqCreateRequest, files?: File[]): Promise<FaqCreateResponse> {
  const formData = new FormData();
  formData.append('faqRequest', JSON.stringify(data));
  
  if (files) {
    files.forEach(file => {
      formData.append('attachments', file);
    });
  }
  
  const result = await request<FaqCreateResponse>('admin', '/api/v1/homepage/faq', 'POST', formData, true);
  if (!result) throw new Error('FAQ 생성에 실패했습니다.');
  return result;
}

// 대회별 FAQ 생성
export async function createEventFaq(eventId: string, data: FaqCreateRequest, files?: File[]): Promise<FaqCreateResponse> {
  const formData = new FormData();
  formData.append('faqRequest', JSON.stringify(data));
  
  if (files) {
    files.forEach(file => {
      formData.append('attachments', file);
    });
  }
  
  const result = await request<FaqCreateResponse>('admin', `/api/v1/${eventId}/faq`, 'POST', formData, true);
  if (!result) throw new Error('FAQ 생성에 실패했습니다.');
  return result;
}

// FAQ 수정
export async function updateFaq(faqId: string, data: FaqUpdateRequest, files?: File[]): Promise<FaqUpdateResponse> {
  const formData = new FormData();
  formData.append('faqRequest', JSON.stringify(data));
  
  if (files) {
    files.forEach(file => {
      formData.append('attachments', file);
    });
  }
  
  const result = await request<FaqUpdateResponse>('admin', `/api/v1/faq/${faqId}`, 'PUT', formData, true);
  if (!result) throw new Error('FAQ 수정에 실패했습니다.');
  return result;
}

// FAQ 삭제
export async function deleteFaq(faqId: string): Promise<FaqUpdateResponse> {
  const result = await request<FaqUpdateResponse>('admin', `/api/v1/faq/${faqId}`, 'DELETE', undefined, true);
  if (!result) throw new Error('FAQ 삭제에 실패했습니다.');
  return result;
}