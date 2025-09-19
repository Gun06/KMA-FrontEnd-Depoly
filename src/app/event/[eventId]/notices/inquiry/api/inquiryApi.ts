import { getAccessToken, isTokenValid } from '@/utils/jwt';

// API 응답용 인터페이스
export interface QuestionHeader {
  no: number;
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  secret: boolean;
  answered: boolean;
}

export interface AnswerHeader {
  no: number;
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
}

export interface InquiryItem {
  questionHeader: QuestionHeader;
  answerHeader?: AnswerHeader;
}

export interface InquiryResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    pageNumber: number;
    paged: boolean;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: InquiryItem[];
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 문의사항 목록 조회 API
 */
export const fetchInquiryList = async (eventId: string, page: number, size: number): Promise<InquiryResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/question?page=${page}&size=${size}`;

  // 인증 토큰 가져오기 및 유효성 검사
  const token = getAccessToken();

  // 토큰이 없거나 유효하지 않은 경우
  if (!token || !isTokenValid(token)) {
    console.error('❌ 유효하지 않은 토큰');
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  
  if (response.ok) {
    const data: InquiryResponse = await response.json();
    
    
    return data;
  } else {
    const errorText = await response.text();
    console.error('❌ 목록 API 호출 실패:', {
      status: response.status,
      statusText: response.statusText,
      errorText,
      endpoint: API_ENDPOINT
    });
    
    if (response.status === 401) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    } else if (response.status === 403) {
      throw new Error('해당 이벤트의 문의사항에 접근할 권한이 없습니다.');
    } else {
      throw new Error(`API 요청 실패 (${response.status}): ${response.statusText}`);
    }
  }
};
