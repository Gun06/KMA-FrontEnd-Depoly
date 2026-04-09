export type CashReceiptPurpose = 'INCOME_DEDUCTION' | 'EXPENSE_PROOF';
export type CashReceiptRequesterType = 'INDIVIDUAL' | 'BUSINESS';
export type CashReceiptIdentifierType = 'PHONE_NUMBER' | 'BUSINESS_REG_NO' | 'CASH_RECEIPT_CARD_NO';
export type CashReceiptStatus = 'REQUESTED' | 'COMPLETED' | 'CANCELED';

export const CASH_RECEIPT_PURPOSE_LABEL: Record<CashReceiptPurpose, string> = {
  INCOME_DEDUCTION: '소득공제',
  EXPENSE_PROOF: '지출증빙',
};

export const CASH_RECEIPT_REQUESTER_TYPE_LABEL: Record<CashReceiptRequesterType, string> = {
  INDIVIDUAL: '개인',
  BUSINESS: '사업자',
};

export const CASH_RECEIPT_IDENTIFIER_TYPE_LABEL: Record<CashReceiptIdentifierType, string> = {
  PHONE_NUMBER: '휴대전화 번호',
  BUSINESS_REG_NO: '사업자 등록번호',
  CASH_RECEIPT_CARD_NO: '현금영수증 카드번호',
};

export const CASH_RECEIPT_STATUS_LABEL: Record<CashReceiptStatus, string> = {
  REQUESTED: '처리 대기',
  COMPLETED: '발급 완료',
  CANCELED: '발급 취소',
};

export const CASH_RECEIPT_STATUS_COLOR: Record<CashReceiptStatus, string> = {
  REQUESTED: 'text-yellow-500',
  COMPLETED: 'text-blue-600',
  CANCELED: 'text-red-500',
};

export interface CashReceiptInfo {
  requestedTime: string;
  purpose: CashReceiptPurpose;
  requesterType: CashReceiptRequesterType;
  type: CashReceiptIdentifierType;
  status: CashReceiptStatus;
  value: string;
  memo: string;
  adminAnswer: string;
  completedTime: string | null;
}

export interface CashReceiptResponse {
  isCashReceiptExist: boolean;
  cashReceiptInfo: CashReceiptInfo[];
}

export interface CashReceiptRequest {
  purpose: CashReceiptPurpose;
  requesterType: CashReceiptRequesterType;
  type: CashReceiptIdentifierType;
  value: string;
  memo?: string;
  rawPassword: string;
}

/**
 * 허용 조합:
 * 1. INCOME_DEDUCTION + INDIVIDUAL + PHONE_NUMBER
 * 2. INCOME_DEDUCTION + INDIVIDUAL + CASH_RECEIPT_CARD_NO
 * 3. EXPENSE_PROOF + BUSINESS + BUSINESS_REG_NO
 */
export type CashReceiptPreset = 'individual_income' | 'business_expense';

export const CASH_RECEIPT_PRESETS: Record<CashReceiptPreset, {
  purpose: CashReceiptPurpose;
  requesterType: CashReceiptRequesterType;
  identifierTypes: CashReceiptIdentifierType[];
  label: string;
}> = {
  individual_income: {
    purpose: 'INCOME_DEDUCTION',
    requesterType: 'INDIVIDUAL',
    identifierTypes: ['PHONE_NUMBER', 'CASH_RECEIPT_CARD_NO'],
    label: '개인 (소득공제)',
  },
  business_expense: {
    purpose: 'EXPENSE_PROOF',
    requesterType: 'BUSINESS',
    identifierTypes: ['BUSINESS_REG_NO'],
    label: '사업자 (지출증빙)',
  },
};

export function validateCashReceiptValue(type: CashReceiptIdentifierType, value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits !== value) {
    return '숫자만 입력해주세요. (하이픈 없이)';
  }

  switch (type) {
    case 'PHONE_NUMBER':
      if (digits.length < 10 || digits.length > 11) {
        return '휴대전화 번호는 10~11자리여야 합니다.';
      }
      return null;
    case 'BUSINESS_REG_NO':
      if (digits.length !== 10) {
        return '사업자등록번호는 10자리여야 합니다.';
      }
      return null;
    case 'CASH_RECEIPT_CARD_NO':
      if (digits.length < 13 || digits.length > 19) {
        return '현금영수증카드번호는 13~19자리여야 합니다.';
      }
      return null;
  }
}
