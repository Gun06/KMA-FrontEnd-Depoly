// 단체 신청 개별 확인 관련 타입 정의

// 개별 확인 인증 요청 타입
export interface IndividualGroupVerifyRequest {
  orgAccount: string;
  name: string;
  phNum: string;
  birth: string;
}

// 개별 확인 응답 타입
export interface IndividualGroupRegistrationData {
  registrationId: string;
  personalAccount: string;
  name: string;
  gender: "M" | "F";
  birth: string;
  phNum: string;
  email: string;
  eventCategoryId: string;
  eventCategoryName: string;
  souvenir: Array<{
    souvenirId: string;
    souvenirName: string;
    souvenirSize: string;
  }>;
  amount: number;
  filteredAddress: {
    address: string;
    zipCode: string;
    addressDetail: string;
  };
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED";
  note?: string;
}


