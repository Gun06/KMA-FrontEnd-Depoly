// 입금내역 업로드 관련 타입 정의

export type PaymentUploadRegistration = {
  registrationId: string;
  name: string;
  phNum: string;
  organizationName: string;
  eventCategoryName: string;
  amount: number;
  paymenterName?: string; // 입금자명
  registrationDate: string;
  checked: boolean; // 각 신청자별 체크 상태
};

export type PaymentUploadDeal = {
  // 기본 거래 정보
  dealDate: string;
  dealTime: string;
  type: string;
  description: string;
  branch: string;
  
  // 금액 정보
  depositAmt: number;
  withdrawAmt: number;
  balance: number;
  
  // 상태 및 로그
  organization: boolean;
  checked: boolean; // 수정 가능
  matchingLog: string; // 수정 가능
  
  // 매칭된 신청 목록
  registrationList: PaymentUploadRegistration[];
};

export type PaymentUploadCheckResponse = PaymentUploadDeal[];
export type PaymentUploadFinalRequest = PaymentUploadDeal[];

