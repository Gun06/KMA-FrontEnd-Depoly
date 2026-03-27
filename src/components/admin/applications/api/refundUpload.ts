// 환불내역 업로드 관련 타입 정의

export type RefundUploadMatchingRegistration = {
  registrationId: string;
  paymenterBank: string;
  accountNumber: string;
  accountHolderName: string;
  name: string;
  birth: string;
  phNum: string;
  paymentStatus: string;
  amount: number;
};

export type RefundUploadItem = {
  paymenterBank: string;
  accountNumber: string;
  accountHolderName: string;
  name: string;
  birth: string;
  phNum: string;
  amount: number;
  matchingLog: string;
  matchingRegistration: RefundUploadMatchingRegistration | null;
  check: boolean;
};

export type RefundUploadCheckResponse = RefundUploadItem[];
export type RefundUploadFinalRequest = RefundUploadItem[];
