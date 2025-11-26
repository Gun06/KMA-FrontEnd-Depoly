// 메인 문의사항 API 함수들

// API 응답 타입 정의 (새로운 구조에 맞게 수정)
export interface HomepageQuestionItem {
  questionHeader: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    authorId?: string; // 작성자 ID 추가
    createdAt: string;
    secret: boolean;
    answered: boolean;
  };
  answerHeader?: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    authorId?: string; // 답변 작성자 ID 추가
    createdAt: string;
    // content 필드 제거 (실제 API 응답에 없음)
    isSecret?: boolean;
    attachmentDetailList?: Array<{
      url: string;
      originName: string;
      originMb: number;
    }>;
  };
}

export interface HomepageQuestionResponse {
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
      empty: boolean;
      unsorted: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: HomepageQuestionItem[];
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 홈페이지 문의사항 목록 조회 API
 */
export const fetchHomepageQuestions = async (
  page: number = 1, 
  size: number = 20,
  keyword?: string,
  questionSearchKey?: 'TITLE' | 'AUTHOR'
): Promise<HomepageQuestionResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  
  // 검색 조건이 있으면 검색 API 사용, 없으면 일반 목록 API 사용
  let API_ENDPOINT;
  if (keyword && questionSearchKey) {
    API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/question/search?page=${page}&size=${size}&keyword=${encodeURIComponent(keyword)}&questionSearchKey=${questionSearchKey}`;
  } else {
    API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/question?page=${page}&size=${size}`;
  }

  // JWT 토큰 가져오기
  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  // 헤더 구성 (토큰이 있으면 Authorization 헤더 포함)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token && isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data: HomepageQuestionResponse = await response.json();
  return data;
};

// 공용 API 에러 타입
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** 상세 조회 타입 */
export interface HomepageQuestionDetail {
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
  answerHeader?: {
    id: string;
    title: string;
    authorName: string;
    authorId?: string;
    createdAt: string;
    content?: string;
    isSecret?: boolean;
    attachmentDetailList?: Array<{
      url: string;
      originName: string;
      originMb: number;
    }>;
  };
}

/**
 * 홈페이지 문의사항 상세 조회 API
 * GET /api/v1/public/question/{questionId}
 */
export const fetchHomepageQuestionDetail = async (questionId: string | number): Promise<HomepageQuestionDetail> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/question/${questionId}`;

  // JWT 토큰 가져오기
  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  // 헤더 구성 (토큰이 있으면 Authorization 헤더 포함)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token && isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    // 상태 코드에 따른 사용자 친화적 메시지
    if (response.status === 401) {
      throw new ApiError('로그인이 필요합니다.', 401);
    }
    if (response.status === 403) {
      throw new ApiError('비밀글입니다. 작성자 본인만 열람할 수 있습니다.', 403);
    }
    if (response.status === 404) {
      throw new ApiError('해당 문의를 찾을 수 없습니다.', 404);
    }
    throw new ApiError(`상세 조회 실패(${response.status}): ${errorText}`, response.status);
  }

  const data: HomepageQuestionDetail = await response.json();
  return data;
};

/**
 * 메인 문의사항 작성 API
 * POST /api/v1/homepage/question
 */
export const createHomepageQuestion = async (formData: FormData): Promise<{ id: string; result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/homepage/question`;

  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  if (!token || !isTokenValid(token)) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 홈페이지 문의사항 생성 API (JSON)
 * POST /api/v1/homepage/question
 */
export const createHomepageQuestionJSON = async (requestData: {
  title: string;
  content: string;
  secret: boolean;
  attachmentList?: Array<{
    originName: string;
    originMb: number;
    base64Data: string;
  }>;
}): Promise<{ id: string; result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/homepage/question`;

  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  if (!token || !isTokenValid(token)) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 홈페이지 문의사항 수정 API
 * PATCH /api/v1/homepage/question/{questionId}
 */
export const updateHomepageQuestion = async (
  questionId: string,
  formData: FormData
): Promise<{ result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/homepage/question/${questionId}`;

  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  if (!token || !isTokenValid(token)) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 홈페이지 문의사항 삭제 API
 * DELETE /api/v1/homepage/question/{questionId}
 */
export const deleteHomepageQuestion = async (
  questionId: string
): Promise<{ result: string }> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/homepage/question/${questionId}`;

  const { getAccessToken, isTokenValid } = await import('@/utils/jwt');
  const token = getAccessToken();
  
  if (!token || !isTokenValid(token)) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
};

