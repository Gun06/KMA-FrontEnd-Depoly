/**
 * 회원가입 과정의 모든 단계 정보를 포함하는 타입 정의
 */

// Step 1: 약관 동의
export interface TermsAgreement {
  allTerms: boolean;
  serviceTerms: boolean;
  privacyTerms: boolean;
  marketingTerms: boolean;
  marketingEmail: boolean;
  marketingSMS: boolean;
  ageVerification: boolean;
}

// Step 2: 계정 정보
export interface AccountInfo {
  account: string; // 아이디
  password: string; // 비밀번호
  passwordConfirm: string; // 비밀번호 확인
}

// Step 3: 개인정보
export interface PersonalInfo {
  name: string; // 성명
  birthDate: string; // 생년월일 (YYYY.MM.DD 형식)
  gender: 'male' | 'female' | ''; // 성별
  emailLocal: string; // 이메일 로컬 부분
  emailDomain: string; // 이메일 도메인 부분
  phonePrefix: string; // 전화번호 앞자리 (010, 011 등)
  phoneMiddle: string; // 전화번호 중간자리
  phoneLast: string; // 전화번호 마지막자리
  isPhoneVerified: boolean; // 휴대폰 인증 완료 여부
  isCustomDomain: boolean; // 커스텀 도메인 입력 모드 여부
}

// Step 4: 주소 정보
export interface AddressInfo {
  postalCode: string; // 우편번호
  address: string; // 기본주소
  addressDetail: string; // 상세주소
}

// 전체 회원가입 데이터
export interface SignupFormData {
  // Step 1
  terms: TermsAgreement;
  
  // Step 2
  account: AccountInfo;
  
  // Step 3
  personal: PersonalInfo;
  
  // Step 4
  address: AddressInfo;
}

// 각 단계별 유효성 검사 결과
export interface SignupValidation {
  step1: {
    isValid: boolean;
    errors: string[];
  };
  step2: {
    isValid: boolean;
    errors: string[];
  };
  step3: {
    isValid: boolean;
    errors: string[];
  };
  step4: {
    isValid: boolean;
    errors: string[];
  };
}

// 회원가입 요청 데이터 (API 전송용)
export interface SignupRequest {
  account: string;
  password: string;
  name: string;
  birth: string; // YYYY-MM-DD 형식으로 변환
  gender: 'male' | 'female';
  email: string; // emailLocal + @ + emailDomain 조합
  phone: string; // phonePrefix-phoneMiddle-phoneLast 조합
  address: string;
  addressDetail: string;
  postalCode: string;
  marketingAgreement: boolean;
}

// 회원가입 응답 데이터
export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: number;
  token?: string;
  errors?: SignupValidation;
}

// 휴대폰 인증 관련
export interface PhoneVerificationData {
  phoneNumber: string;
  verificationCode: string;
  countdown: number;
  isVerified: boolean;
  error: string;
}

// 이메일 도메인 옵션
export const EMAIL_DOMAINS = [
  'gmail.com',
  'naver.com', 
  'daum.net',
  'hanmail.net',
  'hotmail.com',
  'outlook.com',
  'yahoo.com'
] as const;

export type EmailDomain = typeof EMAIL_DOMAINS[number];

// 전화번호 앞자리 옵션
export const PHONE_PREFIXES = [
  '010', '011', '016', '017', '018', '019'
] as const;

export type PhonePrefix = typeof PHONE_PREFIXES[number];

// 성별 옵션
export const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' }
] as const;

// 각 단계별 진행 상태
export interface SignupStepStatus {
  step1: 'pending' | 'completed' | 'error';
  step2: 'pending' | 'completed' | 'error';
  step3: 'pending' | 'completed' | 'error';
  step4: 'pending' | 'completed' | 'error';
}

// 회원가입 완료 후 사용자 정보
export interface SignupCompleteUser {
  id: number;
  account: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  addressDetail: string;
  postalCode: string;
  createdAt: string;
  status: 'pending' | 'active' | 'inactive';
}

// 에러 메시지 상수
export const SIGNUP_ERROR_MESSAGES = {
  // Step 1
  TERMS_REQUIRED: '필수 약관에 동의해주세요.',
  AGE_VERIFICATION_REQUIRED: '만 14세 이상이어야 합니다.',
  
  // Step 2
  ACCOUNT_REQUIRED: '아이디를 입력해주세요.',
  ACCOUNT_LENGTH: '아이디는 4~20자로 입력해주세요.',
  ACCOUNT_FORMAT: '아이디는 영문, 숫자만 사용 가능합니다.',
  ACCOUNT_DUPLICATE: '이미 사용 중인 아이디입니다.',
  PASSWORD_REQUIRED: '비밀번호를 입력해주세요.',
  PASSWORD_LENGTH: '비밀번호는 8~20자로 입력해주세요.',
  PASSWORD_FORMAT: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  
  // Step 3
  NAME_REQUIRED: '성명을 입력해주세요.',
  BIRTH_REQUIRED: '생년월일을 입력해주세요.',
  GENDER_REQUIRED: '성별을 선택해주세요.',
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  EMAIL_FORMAT: '올바른 이메일 형식이 아닙니다.',
  PHONE_REQUIRED: '전화번호를 입력해주세요.',
  PHONE_VERIFICATION_REQUIRED: '휴대폰 인증을 완료해주세요.',
  
  // Step 4
  ADDRESS_REQUIRED: '주소를 입력해주세요.',
  ADDRESS_DETAIL_REQUIRED: '상세주소를 입력해주세요.',
  POSTAL_CODE_REQUIRED: '우편번호를 입력해주세요.',
} as const;

// 유효성 검사 규칙
export const VALIDATION_RULES = {
  ACCOUNT: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
    PATTERN: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  },
  PHONE: {
    PATTERN: /^[0-9]{3,4}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

