import { request } from '@/hooks/useFetch';
import { tokenService } from '@/utils/tokenService';
import type {
  CashReceiptSearchParams,
  CashReceiptSearchResponse,
  CashReceiptDetail,
  CashReceiptUpdateRequest,
  CashReceiptBulkStatusRequest,
  CashReceiptBatch,
} from '../types/cashReceiptAdmin';
import type { RegistrationCashReceiptRequest } from '@/types/registration';
import { parseCashReceiptRequest } from '@/services/registration';

export function mapCashReceiptDetailToRequest(
  detail: CashReceiptDetail
): RegistrationCashReceiptRequest {
  return {
    purpose: detail.purpose,
    requesterType: detail.requesterType,
    type: detail.identifierType,
    value: detail.cashReceiptRequestValue,
    adminAnswer: detail.adminAnswer,
    status: detail.status,
  };
}

/** 신청 ID로 연결된 현금영수증 조회 (상세 API에 없을 때 보조) */
export async function getCashReceiptForRegistration(
  registrationId: string,
  options?: { eventId?: string; requesterName?: string }
): Promise<{ cashReceiptId: string; request: RegistrationCashReceiptRequest } | null> {
  try {
    const byRegistration = await request<Record<string, unknown>>(
      'admin',
      `/api/v1/cash-receipt/registration/${registrationId}`,
      'GET',
      undefined,
      true
    );
    if (byRegistration && typeof byRegistration === 'object') {
      const parsed = parseCashReceiptRequest(byRegistration);
      const id = String(byRegistration.id ?? '');
      if (parsed && id) {
        return { cashReceiptId: id, request: parsed };
      }
    }
  } catch {
    // 전용 API 미제공 시 검색으로 fallback
  }

  const keywords = [registrationId];
  const name = options?.requesterName?.trim();
  if (name) keywords.push(name);

  for (const keyword of keywords) {
    try {
      const res = await searchCashReceiptList({
        eventId: options?.eventId || 'ALL',
        keyword,
        page: 1,
        size: 10,
      });
      if (!res.content.length) continue;

      const candidates =
        name && keyword === name
          ? res.content.filter((row) => row.requesterName === name)
          : res.content;

      for (const row of candidates.slice(0, 3)) {
        const detail = await getCashReceiptDetail(row.id);
        return {
          cashReceiptId: detail.id,
          request: mapCashReceiptDetailToRequest(detail),
        };
      }
    } catch {
      // 다음 키워드 시도
    }
  }

  return null;
}

export async function searchCashReceiptList(
  params: CashReceiptSearchParams
): Promise<CashReceiptSearchResponse> {
  const {
    eventId = 'ALL',
    status = '',
    keyword = '',
    sort = 'desc',
    page = 1,
    size = 20,
  } = params;

  const query = new URLSearchParams();
  query.set('eventId', eventId);
  query.set('sort', sort);
  query.set('page', String(page));
  query.set('size', String(size));
  if (status) query.set('status', status);
  if (keyword.trim()) query.set('keyword', keyword.trim());

  return request<CashReceiptSearchResponse>(
    'admin',
    `/api/v1/cash-receipt/search?${query.toString()}`,
    'GET',
    undefined,
    true
  ) as Promise<CashReceiptSearchResponse>;
}

export async function getCashReceiptDetail(cashReceiptId: string): Promise<CashReceiptDetail> {
  return request<CashReceiptDetail>(
    'admin',
    `/api/v1/cash-receipt/detail/${cashReceiptId}`,
    'GET',
    undefined,
    true
  ) as Promise<CashReceiptDetail>;
}

export async function updateCashReceipt(
  cashReceiptId: string,
  body: CashReceiptUpdateRequest
): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/cash-receipt/${cashReceiptId}`,
    'PATCH',
    body,
    true
  ) as Promise<string>;
}

export async function updateCashReceiptsStatusBulk(
  body: CashReceiptBulkStatusRequest
): Promise<string> {
  return request<string>(
    'admin',
    '/api/v1/cash-receipt/list',
    'PATCH',
    body,
    true
  ) as Promise<string>;
}

async function parseFetchErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  } catch {
    // JSON 파싱 실패 시 fallback 사용
  }
  return fallback;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

function extractFilenameFromDisposition(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (filenameMatch?.[1]) {
    return filenameMatch[1].replace(/['"]/g, '');
  }

  return fallback;
}

/** POST /api/v1/cash-receipt/download — 대기 중(미다운로드) 건 전체 엑셀 다운로드 + 배치 생성 */
export async function downloadRequestedCashReceiptsExcel(): Promise<void> {
  const token = tokenService.getAdminAccessToken();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || 'http://localhost:8080';
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}/api/v1/cash-receipt/download`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*',
    },
  });

  if (!response.ok) {
    const message = await parseFetchErrorMessage(
      response,
      `다운로드 실패: ${response.status} ${response.statusText}`
    );
    throw new Error(message);
  }

  const blob = await response.blob();
  const filename = extractFilenameFromDisposition(
    response.headers.get('content-disposition'),
    'cash-receipt-pending.xlsx'
  );
  triggerBlobDownload(blob, filename);
}

/** GET /api/v1/cash-receipt/batches — 미완료 배치(영수증 처리 대기 큐) 목록 */
export async function getCashReceiptBatches(): Promise<CashReceiptBatch[]> {
  return request<CashReceiptBatch[]>(
    'admin',
    '/api/v1/cash-receipt/batches',
    'GET',
    undefined,
    true
  ) as Promise<CashReceiptBatch[]>;
}

/** PATCH /api/v1/cash-receipt/batches/{batchId}/complete — 배치 발급 완료 */
export async function completeCashReceiptBatch(batchId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/cash-receipt/batches/${batchId}/complete`,
    'PATCH',
    undefined,
    true
  ) as Promise<string>;
}

/** DELETE /api/v1/cash-receipt/batches/{batchId} — 배치 취소(되돌리기) */
export async function cancelCashReceiptBatch(batchId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/cash-receipt/batches/${batchId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}
