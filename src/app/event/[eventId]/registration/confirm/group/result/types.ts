// 단체신청 확인 페이지 타입 정의

// 기념품 정보 타입
export interface SouvenirInfo {
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
  eventCategoryName: string;
  souvenir: SouvenirInfo[];
  amount: number;
}

// 단체신청 확인 데이터 타입
export interface GroupRegistrationConfirmData {
  registrationDate: string;
  organizationName: string;
  organizationAccount: string;
  birth: string;
  address: string;
  zipCode: string;
  phNum: string;
  email: string;
  sumAmount: number;
  organizationHeadCount: number;
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID";
  innerUserRegistrationList: InnerUserRegistration[];
}

// API 응답 타입
export interface GroupRegistrationConfirmResponse {
  data: GroupRegistrationConfirmData;
  message?: string;
  status?: string;
}
