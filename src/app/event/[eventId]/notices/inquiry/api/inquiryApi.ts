import { getAccessToken, getAdminAccessToken, isTokenValid } from '@/utils/jwt';

// 문의사항 목록 조회 API 응답 인터페이스
export interface InquiryItem {
  questionHeader: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    createdAt: string;
    secret: boolean;
    answered: boolean;
  };
  answerHeader?: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    createdAt: string;
  };
}

export interface InquiryResponse {
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  content: InquiryItem[];
  number: number;
  sort: {
    unsorted: boolean;
    empty: boolean;
    sorted: boolean;
  };
  pageable: {
    unpaged: boolean;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      empty: boolean;
      sorted: boolean;
    };
    paged: boolean;
    pageSize: number;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 검색 타입 정의
export type SearchTarget = 'ALL' | 'AUTHOR' | 'TITLE';

// 검색 파라미터 인터페이스
export interface SearchParams {
  eventId: string;
  page: number;
  size: number;
  target?: SearchTarget;
  keyword?: string;
}

/**
 * 문의사항 목록 조회 API (검색 기능 포함)
 */
export const fetchInquiryList = async (
  eventId: string,
  page: number,
  size: number,
  target?: SearchTarget,
  keyword?: string
): Promise<InquiryResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

  // 쿼리 파라미터 구성
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  // 검색 파라미터 추가 (검색어가 있을 때만)
  if (keyword && keyword.trim()) {
    if (target) {
      params.append('target', target);
    }
    params.append('keyword', keyword.trim());
  }

  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/event/${eventId}/question?${params.toString()}`;


  // 인증 토큰 가져오기
  let token = getAccessToken();
  if ((!token || !isTokenValid(token)) && typeof window !== 'undefined') {
    // 사용자 토큰이 없거나 무효이면 관리자 토큰 폴백
    const adminToken = getAdminAccessToken();
    if (adminToken && isTokenValid(adminToken)) token = adminToken;
  }

  // 헤더 구성 (토큰이 있으면 Authorization 헤더 포함)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // 토큰이 유효한 경우에만 Authorization 헤더 추가
  if (token && isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  
  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers,
  });


  if (response.ok) {
    const data: InquiryResponse = await response.json();
    

    return data;
  } else {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    } else if (response.status === 403) {
      throw new Error('해당 이벤트의 문의사항에 접근할 권한이 없습니다.');
    } else {
      throw new Error(
        `API 요청 실패 (${response.status}): ${response.statusText}`
      );
    }
  }
};

export interface InquiryDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  attachmentInfoList?: {
    url: string;
    originName: string;
    originMb: number;
  }[];
  secret: boolean;
  answered: boolean;
  answer?: {
    content: string;
    author: string;
    createdAt: string;
  };
}

export interface AnswerDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isSecret: boolean;
  attachmentDetailList?: {
    url: string;
    originName: string;
    originMb: number;
  }[];
}

/**
 * 문의사항 상세 조회 API
 */
export const fetchInquiryDetail = async (
  eventId: string,
  inquiryId: string
): Promise<InquiryDetail> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/event/${eventId}/question/${inquiryId}`;

  // 인증 토큰 가져오기
  let token = getAccessToken();
  if ((!token || !isTokenValid(token)) && typeof window !== 'undefined') {
    const adminToken = getAdminAccessToken();
    if (adminToken && isTokenValid(adminToken)) token = adminToken;
  }

  // 헤더 구성 (토큰이 있으면 Authorization 헤더 포함)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // 토큰이 유효한 경우에만 Authorization 헤더 추가
  if (token && isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers,
  });

  if (response.ok) {
    const data: InquiryDetail = await response.json();
    return data;
  } else {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    } else if (response.status === 403) {
      throw new Error('해당 문의사항에 접근할 권한이 없습니다.');
    } else {
      throw new Error(
        `API 요청 실패 (${response.status}): ${response.statusText}`
      );
    }
  }
};

/**
 * 문의사항 상세 조회 API (수정용)
 */
export const fetchInquiryForEdit = async (
  questionId: string,
  password: string
): Promise<{ 
  title: string; 
  content: string; 
  authorName: string; 
  secret: boolean;
  attachmentInfoList?: Array<{
    url: string;
    originName: string;
    originMb: number;
  }>;
}> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${questionId}`;

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  
  return {
    title: data.title || '',
    content: data.content || '',
    authorName: data.author || data.authorName || data.nickName || '',
    secret: data.isSecret || data.secret || false,
    attachmentInfoList: data.attachmentInfoList || data.attachmentDetailList || []
  };
};

/**
 * 비회원 문의사항 수정 API
 */
export const updateEventInquiryPublic = async (
  questionId: string,
  formData: FormData
): Promise<{ result: string } | string> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${questionId}`;


  const response = await fetch(API_ENDPOINT, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 답변 상세 조회 API
 */
export const fetchAnswerDetail = async (
  answerId: string,
  password: string = ''
): Promise<AnswerDetail> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/answer/${answerId}`;

  // 헤더 구성
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      password: password 
    }),
  });

  if (response.ok) {
    const data = await response.json();

    // API 응답에서 답변 정보 추출 (직접 답변 객체 반환)
    if (data && data.content) {
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        author: data.author || '',
        admin_id: data.author || '',
        question_id: answerId,
        createdAt: data.createdAt,
        created_at: data.createdAt,
        isSecret: data.isSecret,
        attachmentDetailList: data.attachmentDetailList || [],
      } as AnswerDetail;
    } else {
      throw new Error('답변을 찾을 수 없습니다.');
    }
  } else {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    } else if (response.status === 403) {
      throw new Error('해당 답변에 접근할 권한이 없습니다.');
    } else {
      throw new Error(
        `API 요청 실패 (${response.status}): ${response.statusText}`
      );
    }
  }
};

/**
 * 대회 문의사항 생성 API (비회원/비밀번호 버전)
 * POST /api/v0/public/event/{eventId}/question
 */
export const createEventInquiry = async (
  eventId: string,
  formData: FormData
): Promise<{ id: string; result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/event/${eventId}/question`;

  // 비회원 공개 API: 인증 헤더 없이 전송
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 대회 문의사항 수정 API
 * PATCH /api/v1/question/{questionId}
 */
export const updateEventInquiry = async (
  questionId: string,
  formData: FormData
): Promise<{ result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/question/${questionId}`;

  let token = getAccessToken();
  if ((!token || !isTokenValid(token)) && typeof window !== 'undefined') {
    const adminToken = getAdminAccessToken();
    if (adminToken && isTokenValid(adminToken)) token = adminToken;
  }
  if (!token || !isTokenValid(token)) {
    throw new Error('로그인이 필요합니다.');
  }

  // FormData 내용 확인을 위한 디버깅

  const response = await fetch(API_ENDPOINT, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 대회 문의사항 삭제 API
 * DELETE /api/v0/public/question/{questionId}
 */
export const deleteEventInquiry = async (
  questionId: string,
  password: string
): Promise<{ result: string } | string> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${questionId}`;


  const response = await fetch(API_ENDPOINT, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};