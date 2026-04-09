export type CashReceiptAdminStatus = 'REQUESTED' | 'COMPLETED' | 'CANCELED';

export interface CashReceiptSearchItem {
  no: number;
  id: string;
  eventId: string;
  eventName: string;
  requesterName: string;
  status: CashReceiptAdminStatus;
  memo?: string;
}

export interface CashReceiptSearchResponse {
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  content: CashReceiptSearchItem[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CashReceiptSearchParams {
  eventId?: string;
  status?: CashReceiptAdminStatus | '';
  keyword?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export type CashReceiptPurpose = 'INCOME_DEDUCTION' | 'EXPENSE_PROOF';
export type CashReceiptRequesterType = 'INDIVIDUAL' | 'BUSINESS';
export type CashReceiptIdentifierType = 'PHONE_NUMBER' | 'BUSINESS_REG_NO' | 'CASH_RECEIPT_CARD_NO';

export interface CashReceiptDetail {
  id: string;
  requesterName: string;
  organizationName: string | null;
  createdAt: string;
  purpose: CashReceiptPurpose;
  requesterType: CashReceiptRequesterType;
  identifierType: CashReceiptIdentifierType;
  cashReceiptRequestValue: string;
  status: CashReceiptAdminStatus;
  adminAnswer: string | null;
  completedTime: string | null;
  memo?: string;
}

export interface CashReceiptUpdateRequest {
  adminAnswer: string;
  updateStatus: CashReceiptAdminStatus;
}
