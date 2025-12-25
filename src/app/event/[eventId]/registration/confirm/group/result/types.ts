// 단체신청 확인 페이지 타입 정의

// 기념품 정보 타입
export interface SouvenirInfo {
  souvenirId?: string;
  souvenirName: string;
  souvenirSize: string;
}

// 참가자 정보 타입
export interface InnerUserRegistration {
  registrationId: string;
  personalAccount: string;
  name: string;
  gender: "M" | "F";
  birth: string;
  phNum: string;
  email?: string; // 새로운 스키마에서 추가된 필드
  eventCategoryName: string;
  souvenir: SouvenirInfo[];
  amount: number;
  paymentStatus?: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED"; // 개인별 결제 상태
  checkLeader?: boolean; // 단체장 여부
}

// 단체신청 확인 데이터 타입
export interface GroupRegistrationConfirmData {
  registrationDate: string;
  organizationName: string;
  organizationAccount: string;
  organizationId?: string; // DB PK 값 (환불 요청 시 사용)
  birth: string;
  address: string;
  zipCode: string;
  addressDetail?: string; // 상세주소 추가
  phNum: string;
  email: string;
  sumAmount: number;
  organizationHeadCount: number;
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED";
  innerUserRegistrationList: InnerUserRegistration[];
}

// API 응답 타입
export interface GroupRegistrationConfirmResponse {
  data: GroupRegistrationConfirmData;
  message?: string;
  status?: string;
}
