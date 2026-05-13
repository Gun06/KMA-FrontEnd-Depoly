import { request } from '@/hooks/useFetch';
import { tokenService } from '@/utils/tokenService';
import type {
  CashReceiptSearchParams,
  CashReceiptSearchResponse,
  CashReceiptDetail,
  CashReceiptUpdateRequest,
  CashReceiptBulkStatusRequest,
} from '../types/cashReceiptAdmin';

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

/** 처리 대기 건 엑셀 다운로드 (GET /api/v1/cash-receipt/download) */
export async function downloadRequestedCashReceiptsExcel(): Promise<void> {
  const token = tokenService.getAdminAccessToken();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || 'http://localhost:8080';
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}/api/v1/cash-receipt/download`;

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*',
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
