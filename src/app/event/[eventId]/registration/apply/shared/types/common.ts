// 공통 타입 정의

// 이벤트 등록 기본 정보 인터페이스
export interface EventRegistrationInfo {
  categorySouvenirList: CategorySouvenir[];
  paymentTypeList: string[];
}

// 카테고리 및 기념품 인터페이스
export interface CategorySouvenir {
  categoryName: string;
  categoryId: string;
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
      siDo: string;
      siGunGu: string;
      roadAddress: string;
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
  eventCategoryName: string;
  souvenir: {
    souvenirName: string;
    souvenirSize: string;
  }[];
  amount: number;
  paymentType: "CARD" | "ACCOUNT_TRANSFER";
  paymenterName: string;
  paymentStatus: "UNPAID" | "PAID";
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
