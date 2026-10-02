/** 회원가입 step2 UI·store·백엔드 정책과 동일한 비밀번호 규칙 */

export const SIGNUP_PASSWORD_MIN_LENGTH = 10;
export const SIGNUP_PASSWORD_MAX_LENGTH = 64;

const SIGNUP_PASSWORD_SPECIAL_REGEX =
  /[~!@#$%^&*()+\-={}\[\]\\|:;"'<>,.?/]/;

export type SignupPasswordConditions = {
  hasLength: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  noSpace: boolean;
};

export function getSignupPasswordConditions(
  password: string
): SignupPasswordConditions {
  if (!password) {
    return {
      hasLength: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecial: false,
      noSpace: true,
    };
  }

  return {
    hasLength:
      password.length >= SIGNUP_PASSWORD_MIN_LENGTH &&
      password.length <= SIGNUP_PASSWORD_MAX_LENGTH,
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: SIGNUP_PASSWORD_SPECIAL_REGEX.test(password),
    noSpace: !/\s/.test(password),
  };
}

export function isSignupPasswordValid(password: string): boolean {
  return Object.values(getSignupPasswordConditions(password)).every(Boolean);
}
