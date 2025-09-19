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
  category: string;
  souvenir: string;
  size: string;
  jeonmahyupId: string;
  paymentMethod: string;
  depositorName: string;
}

// ID 확인 결과 타입
export type IdCheckResult = 'none' | 'exists' | 'not_exists';

// 드롭다운 열림 상태 타입
export type OpenDropdown = 'year' | 'month' | 'day' | 'phone1' | 'emailDomain' | 'category' | 'souvenir' | 'size' | 'paymentMethod' | null;
