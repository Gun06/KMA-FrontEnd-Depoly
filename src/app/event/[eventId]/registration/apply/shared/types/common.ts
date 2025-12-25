// 공통 타입 정의

// 이벤트 등록 기본 정보 인터페이스
export interface EventRegistrationInfo {
  distances?: string[]; // 거리 목록 (API 응답에 포함될 수 있음)
  categorySouvenirList: CategorySouvenir[];
  paymentTypeList: string[];
}

// 카테고리 및 기념품 인터페이스
export interface CategorySouvenir {
  categoryName: string;
  categoryId: string;
  distance: string; // 거리 정보 (예: "10km", "21km")
  amount: number;
  categorySouvenirPair: SouvenirPair[];
}

// 기념품 쌍 인터페이스
export interface SouvenirPair {
  souvenirName: string;
  souvenirId: string;
  souvenirSize: string[];
}

// API 스키마에 맞는 인터페이스 정의
export interface ApiSubmitData {
  registrationPersonalInfo: {
    registerMustInfo: {
      personalInfo: {
        birth: string;
        name: string;
        phNum: string;
        email: string;
        gender: string;
      };
                  registrationInfo: {
                    eventCategoryId: string;
                    souvenir: {
                      souvenirId: string;
                      selectedSize: string;
                    }[];
                  };
    };
    address: {
      address: string;
      zipCode: string;
      addressDetail: string;
    };
    paymentDefaultInfo: {
      paymentType: string;
      paymenterName: string;
    };
  };
  registrationPw: string;
}

// 약관 데이터 인터페이스
export interface AgreementData {
  eventName: string;
  organizationName: string;
}

// 개인신청 조회 응답 인터페이스
export interface IndividualRegistrationResponse {
  registrationId: string;
  registrationDate: string;
  personalAccount: string;
  name: string;
  gender: "M" | "F";
  birth: string;
  phNum: string;
  email: string;
  address: string;
  zipCode: string;
  addressDetail: string;
  eventCategoryId: string;
  eventCategoryName: string;
  souvenir: {
    souvenirId: string;
    souvenirName: string;
    souvenirSize: string;
  }[];
  amount: number;
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED";
  note?: string;
  paymenterBank?: string;         // 환불 은행명
  accountNumber?: string;         // 환불 계좌번호
  accountHolderName?: string;     // 예금주명
  refundRequestedAt?: string;     // 환불요청시각 (ISO 8601 형식)
}

// 단체신청 조회 응답 인터페이스 (업데이트된 스키마)
export interface GroupRegistrationResponse {
  registrationDate: string;
  organizationName: string;
  organizationAccount: string;
  leaderName: string;
  leaderBirth: string;
  leaderPhNum: string;
  email: string;
  address: string;
  zipCode: string;
  sumAmount: number;
  organizationHeadCount: number;
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED";
  innerUserRegistrationList: GroupParticipant[];
}

// 단체신청 참가자 인터페이스
export interface GroupParticipant {
  registrationId: string;
  personalAccount: string;
  name: string;
  gender: "M" | "F";
  birth: string;
  phNum: string;
  email: string;
  eventCategoryId: string;
  eventCategoryName: string;
  souvenir: {
    souvenirId: string;
    souvenirName: string;
    souvenirSize: string;
  }[];
  amount: number;
  note?: string;
  checkLeader?: boolean;
}

// 공통 옵션 타입
export interface Option {
  value: string;
  label: string;
}

// 기념품 옵션 타입
export interface SouvenirOption extends Option {
  price: number;
}
