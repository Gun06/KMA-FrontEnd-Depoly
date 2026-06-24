// 개인신청 확인 API 함수들
import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

function normalizeIndividualRegistrationItem(item: unknown): IndividualRegistrationResponse {
  if (!item || typeof item !== 'object') {
    throw new Error('신청 내역을 찾을 수 없습니다.');
  }

  const raw = item as Record<string, unknown>;
  const refund =
    raw.refundRequestInfo && typeof raw.refundRequestInfo === 'object'
      ? (raw.refundRequestInfo as Record<string, unknown>)
      : null;
  const guardian =
    raw.guardianInfo && typeof raw.guardianInfo === 'object'
      ? (raw.guardianInfo as Record<string, unknown>)
      : null;

  return {
    ...(raw as unknown as IndividualRegistrationResponse),
    paymenterBank: (refund?.paymenterBank ?? raw.paymenterBank) as string | undefined,
    accountNumber: (refund?.accountNumber ?? raw.accountNumber) as string | undefined,
    accountHolderName: (refund?.accountHolderName ?? raw.accountHolderName) as string | undefined,
    refundRequestedAt: (refund?.refundRequestedAt ?? raw.refundRequestedAt) as string | undefined,
    guardianPhNum: (guardian?.guardianPhNum ?? raw.guardianPhNum) as string | null | undefined,
    guardianRelationship: (guardian?.guardianRelationship ??
      guardian?.guardianRelationShip ??
      raw.guardianRelationship ??
      raw.guardianRelationShip) as string | null | undefined,
    guardianRelationShip: (guardian?.guardianRelationShip ??
      guardian?.guardianRelationship ??
      raw.guardianRelationShip ??
      raw.guardianRelationship) as string | null | undefined,
  };
}

/** 통합 응답(registrationList)과 레거시(단일 객체) 모두 지원 */
export function normalizeIndividualRegistrationListResponse(
  result: unknown
): IndividualRegistrationResponse[] {
  if (!result || typeof result !== 'object') {
    throw new Error('신청 조회 응답을 확인할 수 없습니다.');
  }

  const body = result as Record<string, unknown>;

  if (Array.isArray(body.registrationList)) {
    if (body.registrationList.length === 0) {
      throw new Error('신청 내역을 찾을 수 없습니다.');
    }
    return body.registrationList.map(normalizeIndividualRegistrationItem);
  }

  return [normalizeIndividualRegistrationItem(body)];
}

/** 통합 응답(registrationList)과 레거시(단일 객체) 모두 지원 — 첫 번째(루트) 항목만 반환 */
export function normalizeIndividualRegistrationConfirmResponse(
  result: unknown
): IndividualRegistrationResponse {
  return normalizeIndividualRegistrationListResponse(result)[0];
}

// 개인신청 확인 데이터 조회
export const fetchIndividualRegistrationConfirm = async (
  eventId: string,
  name: string,
  phNum: string,
  birth: string,
  eventPw: string
): Promise<IndividualRegistrationResponse[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/event/${eventId}/view-registration-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phNum: phNum,
          birth: birth,
          eventPw: eventPw,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return normalizeIndividualRegistrationListResponse(result);
  } catch (error) {
    throw error;
  }
};
