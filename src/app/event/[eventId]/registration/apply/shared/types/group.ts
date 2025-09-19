// 단체신청 관련 타입 정의

// 참가자 정보 타입
export interface ParticipantData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  category: string;
  souvenir: string;
  size: string;
  email1: string;
  email2: string;
  emailDomain: string;
  phone1: string;
  phone2: string;
  phone3: string;
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
  
  // 개인 정보 (연락처, 이메일만)
  phone1: string;
  phone2: string;
  phone3: string;
  email1: string;
  email2: string;
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
        siDo: string;
        siGunGu: string;
        roadAddress: string;
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
    souvenir_json: string;
    souvenirJson: string;
    souvenir: string;
  };
  registrationInfoPerUserList: Array<{
    mustRegistrationInfo: {
      personalInfo: {
        birth: string;
        name: string;
        phNum: string;
        email: string;
        gender: string;
      };
      registrationInfo: {
        eventCategoryId: string;
        souvenir: Array<{
          souvenirId: string;
          selectedSize: string;
        }>;
      };
    };
  }>;
}

// 단체신청 드롭다운 열림 상태 타입
export type OpenDropdown = 'phone1' | 'emailDomain' | null;
