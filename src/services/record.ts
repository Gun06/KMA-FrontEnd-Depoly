/**
 * 기록 조회 API 서비스
 */

// 개인 기록 조회 요청 타입
export interface IndividualRecordRequest {
  name: string;
  phNum: string;
  birth: string; // YYYY-MM-DD 형식
  eventPw: string;
}

// 단체 기록 조회 요청 타입
export interface OrganizationRecordRequest {
  id: string;
  orgPw: string;
}

// 기록 조회 응답 타입
export interface RecordResponse {
  name: string;
  birth: string;
  course: string;
  number: number;
  resultTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  orgName: string;
  resultId: string;
  eventId: string;
}

/**
 * 개인 사용자 대회 결과 조회
 * POST /api/v1/public/event/{eventId}/record
 */
export async function getIndividualRecord(
  eventId: string,
  requestData: IndividualRecordRequest
): Promise<RecordResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/record`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`기록 조회 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * 단체 사용자 대회 결과 조회
 * POST /api/v1/public/event/{eventId}/record/organization
 */
export async function getOrganizationRecord(
  eventId: string,
  requestData: OrganizationRecordRequest
): Promise<RecordResponse[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/record/organization`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`단체 기록 조회 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}
