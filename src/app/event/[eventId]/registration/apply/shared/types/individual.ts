// 개인신청 관련 타입 정의

export interface IndividualFormData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female';
  postalCode: string;
  address: string;
  detailedAddress: string;
  extraAddress: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email1: string;
  email2: string;
  emailDomain: string;
  selectedDistance?: string; // 선택된 거리 (예: "10km")
  category: string;
  souvenir: string; // 기존 호환성을 위해 유지
  size: string; // 기존 호환성을 위해 유지
  selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>; // 여러 기념품 선택 지원
  jeonmahyupId: string;
  paymentMethod: string;
  depositorName: string;
  // 사용자 비고 (선택입력) - 최대 50자
  note?: string;
}

// ID 확인 결과 타입
export type IdCheckResult = 'none' | 'exists' | 'not_exists';

// 드롭다운 열림 상태 타입
export type OpenDropdown = 'year' | 'month' | 'day' | 'phone1' | 'emailDomain' | 'category' | 'paymentMethod' | null;
