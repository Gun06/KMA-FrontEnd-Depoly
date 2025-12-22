import { request } from '@/hooks/useFetch';
import { tokenService } from '@/utils/tokenService';
import { normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';
import type { RegistrationListResponse, RegistrationListRequest, RegistrationSearchRequest, RegistrationItem } from '@/types/registration';

// 대회별 신청자 목록 조회
export async function getRegistrationList(params: RegistrationListRequest): Promise<RegistrationListResponse> {
  const { eventId, page = 1, size = 20 } = params;
  
  // URL에 쿼리 파라미터 추가
  const url = `/api/v1/${eventId}/registration?page=${page}&size=${size}`;
  
  return request<RegistrationListResponse>(
    'admin',
    url,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<RegistrationListResponse>;
}

// 대회별 신청자 검색
export async function searchRegistrationList(params: RegistrationSearchRequest): Promise<RegistrationListResponse> {
  const { eventId, page = 1, size = 20, registrationSearchKey, direction, paymentStatus, keyword } = params;
  
  // URL에 쿼리 파라미터 추가
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());
  
  if (registrationSearchKey) searchParams.set('registrationSearchKey', registrationSearchKey);
  if (direction) searchParams.set('direction', direction);
  if (paymentStatus) searchParams.set('paymentStatus', paymentStatus);
  if (keyword) searchParams.set('keyword', keyword);
  
  const url = `/api/v1/${eventId}/registration/search?${searchParams.toString()}`;
  
  return request<RegistrationListResponse>(
    'admin',
    url,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<RegistrationListResponse>;
}

// 신청자 목록 Excel 다운로드
export async function downloadRegistrationList(eventId: string): Promise<void> {
  const url = `/api/v1/${eventId}/registration/download`;
  
  
  try {
    // tokenService를 사용하여 토큰 가져오기
    const token = tokenService.getAdminAccessToken();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    // baseUrl을 직접 구성하여 전체 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || 'http://localhost:8080';
    const fullUrl = `${baseUrl}${url}`;
    
    
    // Authorization 헤더를 추가하여 fetch로 요청
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*',
      },
    });
    
    
    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }
    
    // Blob으로 변환 후 다운로드 (새 창 없이)
    const blob = await response.blob();
    
    // Content-Disposition 헤더에서 파일명 추출 (하드코딩 없음)
    const contentDisposition = response.headers.get('content-disposition');
    let filename: string | undefined;
    
    if (contentDisposition) {
      
      // UTF-8 인코딩된 파일명을 우선적으로 찾기
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else {
        // UTF-8 파일명이 없으면 일반 filename 사용
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        } else {
        }
      }
    } else {
    }
    
    // 파일명이 없으면 다운로드하지 않음
    if (!filename) {
      throw new Error('백엔드에서 파일명을 제공하지 않았습니다.');
    }
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename; // 백엔드에서 제공한 파일명 사용
    // target 제거하여 새 창이 뜨지 않도록 함
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    throw new Error('다운로드에 실패했습니다.');
  }
}

// 입금 내역 Excel 업로드 (기존 - 호환성 유지)
export async function uploadPaymentHistory(
  eventId: string,
  file: File,
  options?: { signal?: AbortSignal }
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `/api/v1/registration/event/${eventId}/excel`;
  
  
  try {
    const response = await request('admin', url, 'POST', formData, true, {
      signal: options?.signal,
    });
    return response as string;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error instanceof Error ? error : new Error('업로드에 실패했습니다.');
  }
}

// 입금 내역 Excel 체크 (매칭 결과 확인)
export async function checkPaymentUpload(
  eventId: string,
  file: File,
  options?: { signal?: AbortSignal }
) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `/api/v1/registration/event/${eventId}/excel/check`;
  
  try {
    const response = await request('admin', url, 'POST', formData, true, {
      signal: options?.signal,
    });
    return response as import('@/types/paymentUpload').PaymentUploadCheckResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error instanceof Error ? error : new Error('체크에 실패했습니다.');
  }
}

// 입금 내역 Excel 최종 업로드 (수정 후 최종 반영)
export async function finalizePaymentUpload(
  eventId: string,
  data: import('@/types/paymentUpload').PaymentUploadFinalRequest
): Promise<string> {
  const url = `/api/v1/registration/event/${eventId}/excel/final`;
  
  try {
    const response = await request('admin', url, 'POST', data, true);
    return response as string;
  } catch (error) {
    throw error instanceof Error ? error : new Error('최종 업로드에 실패했습니다.');
  }
}

// 신청자 입금여부 및 메모 일괄 수정
export async function updatePaymentStatus(updates: Array<{
  id: string;
  name: string;
  gender: string;
  birth: string;
  phNum: string;
  paymentStatus: 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
  memo?: string;
}>): Promise<string> {
  
  try {
    const response = await request('admin', '/api/v1/registration', 'PATCH', updates, true);
    return response as string;
  } catch (error) {
    throw new Error('입금여부 수정에 실패했습니다.');
  }
}

// 신청자 상세 조회
export async function getRegistrationDetail(registrationId: string): Promise<RegistrationItem> {
  const url = `/api/v1/registration/detail/${registrationId}`;
  
  const response = await request<any>(
    'admin',
    url,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  );
  
  const data = await response;
  
  // (로그 제거) 단체 상세 응답 디버깅 로그 삭제
  
  // 단체 ID 찾기: 여러 가능한 필드명 확인
  // 주의: 첫 번째 스키마(GET /api/v1/organization)에서 `account`가 조직 코드(organizationAccount)입니다
  const findOrganizationId = (rawData: any): string | undefined => {
    // 우선순위: organizationId (API 응답에서 직접 제공) > organizationAccount > account (조직 코드) > 기타
    return rawData.organizationId // API 응답에서 직접 제공되는 organizationId 우선 사용
      || rawData.organizationAccount 
      || rawData.account // 첫 번째 스키마에서 조직 코드로 사용되는 필드
      || rawData.organizationAccountId
      || rawData.orgId
      || rawData.orgAccount
      || rawData.organization?.id
      || rawData.organization?.account
      || rawData.organization?.organizationAccount;
  };
  
  // 새 API 응답 구조를 RegistrationItem 타입으로 매핑
  const orgId = findOrganizationId(data);
  
  // (로그 제거) 단체 ID 미존재 경고 로그 삭제
  return {
    registrationId: data.id, // 서버에서 내려주는 registrationId
    id: data.id,
    name: data.name, // 새 구조
    userName: data.name, // 호환성
    paymenterName: data.paymenterName, // 입금자명
    organizationName: data.organizationName || '개인',
    organizationId: orgId,
    organizationAccount: data.organizationAccount || orgId, // 백엔드가 organizationAccount를 별도로 반환하지 않으면 organizationId 사용
    eventCategory: data.eventCategory, // 새 구조
    categoryName: data.eventCategory, // 호환성
    birth: data.birth,
    gender: data.gender,
    phNum: data.phNum,
    registrationDate: data.registrationDate,
    amount: data.amount,
    paymentStatus: data.paymentStatus,
    address: data.address,
    addressDetail: data.addressDetail, // 상세주소 추가
    note: data.note,
    memo: data.memo,
    detailMemo: data.detailMemo,
    matchingLog: data.matchingLog,
    paymenterBank: data.paymenterBank, // 환불 은행명
    accountNumber: data.accountNumber, // 환불 계좌번호
    accountHolderName: data.accountHolderName, // 예금주명
    refundRequestedAt: data.refundRequestedAt, // 환불요청시각
    // 대회 ID 추출: 여러 가능한 필드 확인
    eventId: data.eventId 
      || data.event?.id 
      || data.eventCategory?.eventId
      || data.eventCategoryId?.eventId,
    // 새 구조의 souvenirList를 souvenirListDetail로 매핑
    souvenirListDetail: Array.isArray(data.souvenirList)
      ? data.souvenirList.map((s: any) => ({
          id: s.id,
          name: s.name,
          size: s.size,
          eventCategoryId: s.eventCategoryId,
          eventCategoryName: s.eventCategoryName,
        }))
      : [],
  };
}

// 신청 개별 수정 (상세 편집 저장)
export type RegistrationUpdatePayload = {
  eventCategoryId?: string;
  organizationId?: string | null; // 단체 ID (null 가능)
  userName?: string;
  paymenterName?: string;
  birth?: string;
  gender?: 'M' | 'F';
  phNum?: string;
  paymentStatus?: 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
  address?: string;
  addressDetail?: string; // 상세주소 추가
  memo?: string;
  detailMemo?: string;
  souvenirJsonList?: Array<{ souvenirId: string; selectedSize: string }>; // 백엔드 스펙 명칭 기준
  amount?: number;
};

export async function updateRegistrationDetail(
  registrationId: string,
  payload: RegistrationUpdatePayload
): Promise<string> {
  // 백엔드 스펙: 개별 수정 API(PATCH /api/v1/registration/{registrationId})
  const url = `/api/v1/registration/${registrationId}`;
  try {
    if (!registrationId || registrationId.trim() === '') {
      throw new Error('Registration ID is required');
    }
    // 값 정규화: 공통 유틸 함수 사용 (신청하기, 관리자 수정, 신청확인 모두 동일)

    const requestBody = {
      ...(payload.eventCategoryId && { eventCategoryId: payload.eventCategoryId }),
      ...(payload.organizationId !== undefined && { organizationId: payload.organizationId }), // null도 포함하여 전송 가능
      ...(payload.userName && { userName: payload.userName }),
      ...(payload.paymenterName && { paymenterName: payload.paymenterName }),
      ...(payload.birth && { birth: normalizeBirthDate(payload.birth) }),
      ...(payload.gender && { gender: payload.gender }),
      ...(payload.phNum && { phNum: normalizePhoneNumber(payload.phNum) }),
      ...(payload.paymentStatus && { paymentStatus: payload.paymentStatus }),
      ...(payload.address && { address: payload.address }),
      ...(payload.addressDetail !== undefined && { addressDetail: payload.addressDetail }),
      ...(payload.memo !== undefined && { memo: payload.memo }),
      ...(payload.detailMemo !== undefined && { detailMemo: payload.detailMemo }),
      ...(payload.souvenirJsonList && { souvenirJsonList: payload.souvenirJsonList }),
      ...(typeof payload.amount === 'number' && { amount: payload.amount }),
    };

    const res = await request('admin', url, 'PATCH', requestBody, true);
    return res as string;
  } catch (e) {
    throw new Error('신청 정보 수정에 실패했습니다.');
  }
}

// 신청 비밀번호 초기화
export async function resetRegistrationPassword(
  registrationId: string,
  password: string
): Promise<string> {
  const url = `/api/v1/registration/${registrationId}/password`;
  try {
    if (!registrationId || registrationId.trim() === '') {
      throw new Error('Registration ID is required');
    }
    if (!password || password.trim().length < 6 || /\s/.test(password)) {
      throw new Error('비밀번호는 최소 6자리, 공백 없이 입력해야 합니다.');
    }

    const body = { password } as { password: string };
    const res = await request('admin', url, 'PATCH', body, true);
    return res as string;
  } catch (e) {
    throw new Error('비밀번호 초기화에 실패했습니다.');
  }
}

// 단체 비밀번호 초기화
export async function resetOrganizationPassword(
  organizationId: string,
  password: string
): Promise<string> {
  if (!organizationId || !password) throw new Error('organizationId와 password가 필요합니다.');
  const url = `/api/v1/registration/organization/${organizationId}/password`;
  const body = { password };
  return await request('admin', url, 'PATCH', body, true) as string;
}

export async function deleteRegistration(registrationId: string): Promise<string> {
  if (!registrationId || registrationId.trim() === '') {
    throw new Error('Registration ID is required');
  }
  const url = `/api/v1/registration/${registrationId}`;
  try {
    const res = await request('admin', url, 'DELETE', undefined, true);
    return res as string;
  } catch (e) {
    throw new Error('신청 정보 삭제에 실패했습니다.');
  }
}

// 대회별 단체 목록 검색 (관리자용 - 드롭다운용)
export interface OrganizationSearchItem {
  id: string;
  name: string;
}

export async function searchOrganizationsByEventAdmin(
  eventId: string,
  keyword?: string
): Promise<OrganizationSearchItem[]> {
  const searchParams = new URLSearchParams();
  if (keyword && keyword.trim()) {
    searchParams.set('keyword', keyword.trim());
  }
  
  const url = `/api/v1/organization/search/event/${eventId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  try {
    const result = await request<OrganizationSearchItem[]>(
      'admin',
      url,
      'GET',
      undefined,
      true // 관리자 API이므로 인증 필요
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    throw error;
  }
}