// 단체신청 관련 타입 정의

// 참가자 정보 타입
export interface ParticipantData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  category: string;
  souvenir: string; // 기존 호환성을 위해 유지
  size: string; // 기존 호환성을 위해 유지
  selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>; // 여러 기념품 선택 지원
  // email1: string; // API 구조 변경으로 제거
  // email2: string; // API 구조 변경으로 제거
  // emailDomain: string; // API 구조 변경으로 제거
  phone1: string;
  phone2: string;
  phone3: string;
  // 사용자 비고 (클라이언트 입력)
  note?: string;
  // 관리자 메모 (관리자 전용)
  memo?: string;
  // 결제 상태 (수정 모드에서 사용)
  paymentStatus?: 'UNPAID' | 'PAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
  registrationId?: string; // 수정 모드에서 사용
  // 참가 대표자 여부
  isLeader?: boolean;
  // 원본 금액 (결제완료 상태에서 동일 금액 체크용)
  originalAmount?: number;
}

// 단체신청 폼 데이터 타입
export interface GroupFormData {
  // 단체 정보
  groupName: string;
  groupId: string;
  representativeBirthDate: string;
  groupPassword: string;
  confirmGroupPassword: string;
  leaderName: string;
  postalCode: string;
  address: string;
  detailedAddress: string;
  
  // 개인 정보 (연락처만)
  phone1: string;
  phone2: string;
  phone3: string;
  email1: string;
  emailDomain: string;
  
  // 참가인원 정보
  participants: ParticipantData[];
  
  // 결제 정보
  paymentMethod: string;
  depositorName: string;
}

// 단체 API 요청 데이터 타입
export interface GroupApiRequestData {
  organizationCreateRequest: {
    organizationAccount: {
      organizationName: string;
      organizationAccount: string;
      organizationPassword: string;
    };
    organizationProfile: {
      address: {
        address: string; // 단일 문자열 주소 (개인신청과 동일)
        zipCode: string;
        addressDetail: string;
      };
      birth: string;
      phNum: string;
      email: string;
      leaderName: string;
    };
    paymentDefaultInfo: {
      paymentType: string;
      paymenterName: string;
    };
  };
  registrationInfoPerUserList: Array<{
    mustRegistrationInfo: {
      personalInfo: {
        birth: string;
        name: string;
        phNum: string;
        gender: string;
      };
      registrationInfo: {
        eventCategoryId: string;
        souvenir: Array<{
          souvenirId: string;
          selectedSize: string;
        }>;
        note?: string;
      };
    };
    checkLeader?: boolean;
    note?: string;
  }>;
}

// 단체신청 드롭다운 열림 상태 타입
export type OpenDropdown = 'phone1' | 'emailDomain' | null;
