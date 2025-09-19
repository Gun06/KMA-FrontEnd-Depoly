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
