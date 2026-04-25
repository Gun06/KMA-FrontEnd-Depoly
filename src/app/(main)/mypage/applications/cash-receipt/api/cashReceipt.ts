import { CashReceiptRequest, CashReceiptResponse } from '../types/cashReceipt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export async function fetchCashReceipt(
  eventId: string,
  targetId: string,
  targetType: 'registration' | 'organization'
): Promise<CashReceiptResponse> {
  const segment = targetType === 'registration'
    ? `registration/${targetId}`
    : `organization/${targetId}`;

  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/event/${eventId}/${segment}/cash-receipt`,
    {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`현금영수증 조회 실패: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function submitCashReceipt(
  eventId: string,
  targetId: string,
  targetType: 'registration' | 'organization',
  request: CashReceiptRequest
): Promise<string> {
  const segment = targetType === 'registration'
    ? `registration/${targetId}`
    : `organization/${targetId}`;

  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/event/${eventId}/${segment}/cash-receipt`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `현금영수증 신청 실패 (${response.status})`);
  }

  return response.text();
}
