import { request } from '@/hooks/useFetch';
import { tokenService } from '@/utils/tokenService';
import type {
  CashReceiptSearchParams,
  CashReceiptSearchResponse,
  CashReceiptDetail,
  CashReceiptUpdateRequest,
  CashReceiptBulkStatusRequest,
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

/** POST /api/v1/cash-receipt/download — cashReceiptIds 비어 있으면 전체(대기 등, 서버 정책), 있으면 해당 건만 */
async function postCashReceiptDownloadExcel(cashReceiptIds: string[]): Promise<void> {
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
      'Content-Type': 'application/json',
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*',
    },
    body: JSON.stringify({ cashReceiptIds }),
  });

  if (!response.ok) {
    throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition');
  let filename: string | undefined;

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    if (utf8Match?.[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
  }

  if (!filename) {
    filename = 'cash-receipt-pending.xlsx';
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

/** 처리 대기 건 전체 엑셀 다운로드 */
export async function downloadRequestedCashReceiptsExcel(): Promise<void> {
  return postCashReceiptDownloadExcel([]);
}

/** 선택한 현금영수증 건만 엑셀 다운로드 */
export async function downloadSelectedCashReceiptsExcel(cashReceiptIds: string[]): Promise<void> {
  if (cashReceiptIds.length === 0) {
    throw new Error('다운로드할 항목을 선택해주세요.');
  }
  return postCashReceiptDownloadExcel(cashReceiptIds);
}

/** 현금영수증 기본 양식 다운로드 (GET /api/v1/cash-receipt/template) */
export async function downloadCashReceiptTemplate(): Promise<void> {
  const token = tokenService.getAdminAccessToken();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || 'http://localhost:8080';
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}/api/v1/cash-receipt/template`;

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: '*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition');
  let filename: string | undefined;

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    if (utf8Match?.[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
  }

  if (!filename) {
    filename = 'cash-receipt-template.xlsx';
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

/** 다운로드 양식 그대로 업로드 시 일괄 완료 (POST multipart file) */
export async function bulkCompleteCashReceiptsFromFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  return request<string>(
    'admin',
    '/api/v1/cash-receipt/bulk-complete',
    'POST',
    fd,
    true
  ) as Promise<string>;
}
