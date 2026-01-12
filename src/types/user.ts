/**
 * 실제 데이터베이스 스키마에 맞는 사용자 타입 정의
 */

export interface User {
  id: number;
  name: string;
  created_at: string;
  ph_num: string; // 연락처 (Unique)
  birth: string; // 생년월일 (YYYY-MM-DD 형식)
  account: string; // 아이디
  account_password: string; // 계정 비밀번호
  address: string; // 주소 (우편번호 포함)
  address_detail: string; // 상세주소
  auth: string; // 회원타입 (임시회원, 회원 비교목적)
}

export interface UserCreateRequest {
  name: string;
  ph_num: string;
  birth: string;
  account: string;
  account_password: string;
  address: string;
  address_detail: string;
  auth?: string; // 기본값: 'USER'
}

export interface UserUpdateRequest {
  name?: string;
  ph_num?: string;
  birth?: string;
  address?: string;
  address_detail?: string;
  auth?: string;
}

export interface UserLoginRequest {
  account: string;
  account_password: string;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserProfileResponse {
  user: User;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  account: string;
  ph_num: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyPhoneRequest {
  ph_num: string;
  verification_code: string;
}

export interface ResendVerificationRequest {
  ph_num: string;
}

// 회원 타입 상수
export const USER_TYPES = {
  TEMPORARY: '임시회원',
  REGULAR: '회원',
  ADMIN: '관리자',
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

// 회원 상태
export interface UserStatus {
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  loginAttempts: number;
}

// API 응답 타입 정의
export interface UserListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: UserApiData[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserApiData {
  no: number;
  id: string;
  account: string;
  accountPassword: string;
  name: string;
  phNum: string;
  birth: string;
  address: string;
  addressDetail: string;
  auth: 'USER' | 'ADMIN';
  email: string;
  gender: 'M' | 'F';
  createdAt: string;
}

// 유저별 등록 대회 조회 API 타입 정의
export interface UserRegistrationListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: UserRegistrationData[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserRegistrationData {
  no: number;
  id?: string; // registration ID (비밀번호 초기화에 필요)
  eventId: string;
  nameKr: string;
  startDate: string;
  region: string;
  eventType: 'KMA';
  eventStatus: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  registeredAt: string;
}

// ───────────── 단체 회원 API 타입 ─────────────
export interface OrganizationApiData {
  no: number;
  id: string;
  name: string;         // 단체명
  leaderName: string;   // 대표자명
  account: string;      // 대표자 아이디
  leaderPhNum: string;  // 대표자 연락처
  eventName: string;    // 최근(또는 대표) 대회명
  memberCount: number;  // 회원수
  leaderBirth?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string;
  email?: string;
  registrationDate?: string;
  createdAt?: string; // 등록일 (백엔드에서 제공 예정)
  organizationHeadCount?: number;
  sumAmount?: number;
  totalAmount?: number;
  amount?: number;
  paymentType?: string;
  paymentMethod?: string;
  paymenterName?: string;
  paymentStatus?: string;
}

export interface OrganizationListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: OrganizationApiData[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ───────────── 단체 구성원 API 타입 ─────────────
// GET /api/v1/organization/{organizationId}/user 응답 스키마 기반
export interface OrganizationMemberApiData {
  no: number;
  registrationId?: string;
  userType?: string;    // 'USER' 등
  account?: string;      // 사용자 계정
  userName?: string;     // 사용자 이름
  name?: string;         // 호환성: 일부 응답에서 name 필드 사용
  birth?: string;        // YYYY-MM-DD 형식
  phNum?: string;        // 전화번호
  registrationDate?: string; // ISO 8601 형식
  amount?: number;        // 신청 금액
  paymenterName?: string; // 입금자명
  paymentStatus?: string; // 결제 상태 코드
}

export interface OrganizationMemberListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: OrganizationMemberApiData[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}