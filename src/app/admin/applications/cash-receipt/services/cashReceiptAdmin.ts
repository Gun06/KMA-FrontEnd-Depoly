import { request } from '@/hooks/useFetch';
import type {
  CashReceiptSearchParams,
  CashReceiptSearchResponse,
  CashReceiptDetail,
  CashReceiptUpdateRequest,
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
