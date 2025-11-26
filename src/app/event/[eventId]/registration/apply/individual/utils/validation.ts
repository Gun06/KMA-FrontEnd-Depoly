import { IndividualFormData } from "../data";

// 비밀번호 유효성 검사 (최소 6자리, 공백 없음)
export const isPasswordValid = (password: string) => {
  const minLength = 6;
  
  // 최소 6자리 확인
  if (password.length < minLength) {
    return false;
  }
  
  // 공백 금지
  if (/\s/.test(password)) {
    return false;
  }
  
  return true;
};

// 필수 필드 검증
export const isFormValid = (formData: IndividualFormData) => {
  return (
    formData.name.trim() !== '' &&
    formData.birthYear !== '' &&
    formData.birthMonth !== '' &&
    formData.birthDay !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword &&
    isPasswordValid(formData.password) &&
    (formData.gender === 'male' || formData.gender === 'female') &&
    formData.postalCode.trim() !== '' &&
    formData.address.trim() !== '' &&
    formData.phone1.trim() !== '' &&
    formData.phone2.trim() !== '' &&
    formData.phone3.trim() !== '' &&
    formData.category !== '' &&
    formData.souvenir !== '' &&
    formData.depositorName.trim() !== ''
  );
};

// 비밀번호 일치 여부 확인
export const isPasswordMatch = (password: string, confirmPassword: string) => {
  return password === confirmPassword;
};

// 전화번호 유효성 검사
export const isPhoneValid = (phone1: string, phone2: string, phone3: string) => {
  return phone1.trim() !== '' && phone2.trim() !== '' && phone3.trim() !== '';
};

// 이메일 유효성 검사
export const isEmailValid = (email1: string, emailDomain: string) => {
  return email1.trim() !== '' && emailDomain.trim() !== '';
};
