// 공통 유효성 검사 함수들
import { IndividualFormData } from '../types/individual';
import { GroupFormData } from '../types/group';

// 비밀번호 유효성 검사 (최소 6자리, 공백 없음)
export const isPasswordValid = (password: string): boolean => {
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

// 비밀번호 일치 여부 확인
export const isPasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// 전화번호 유효성 검사
export const isPhoneValid = (phone1: string, phone2: string, phone3: string): boolean => {
  return phone1.trim() !== '' && phone2.trim() !== '' && phone3.trim() !== '';
};

// 이메일 유효성 검사
export const isEmailValid = (email1: string, emailDomain: string): boolean => {
  return email1.trim() !== '' && emailDomain.trim() !== '' && emailDomain !== '직접입력';
};

// 개인신청 폼 유효성 검사
export const isIndividualFormValid = (formData: IndividualFormData): boolean => {
  return (
    formData.name.trim() !== '' &&
    formData.birthYear !== '' &&
    formData.birthMonth !== '' &&
    formData.birthDay !== '' &&
    isPasswordValid(formData.password) &&
    isPasswordMatch(formData.password, formData.confirmPassword) &&
    formData.postalCode.trim() !== '' &&
    formData.address.trim() !== '' &&
    isPhoneValid(formData.phone1, formData.phone2, formData.phone3) &&
    // isEmailValid(formData.email1, formData.emailDomain) && // API 구조 변경으로 제거
    formData.category !== '' &&
    formData.souvenir !== '' &&
    formData.size !== '' &&
    formData.paymentMethod !== '' &&
    formData.depositorName.trim() !== ''
  );
};

// 단체신청 폼 유효성 검사
export const isGroupFormValid = (formData: GroupFormData): boolean => {
  // 단체 아이디 유효성 체크 (5-20자, 영문/숫자/특문 허용, 한글 불허)
  const isGroupIdValid = formData.groupId.length >= 5 && 
                        formData.groupId.length <= 20 && 
                        !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(formData.groupId);

  const isValid = (
    formData.groupName.trim() !== '' &&
    formData.groupId.trim() !== '' &&
    isGroupIdValid &&
    formData.leaderName.trim() !== '' &&
    formData.representativeBirthDate.trim() !== '' &&
    isPasswordValid(formData.groupPassword) &&
    isPasswordMatch(formData.groupPassword, formData.confirmGroupPassword) &&
    formData.postalCode.trim() !== '' &&
    formData.address.trim() !== '' &&
    isPhoneValid(formData.phone1, formData.phone2, formData.phone3) &&
    // isEmailValid(formData.email1, formData.emailDomain) && // 이메일은 선택사항으로 변경
    formData.participants.length > 0 &&
    formData.participants.every(participant => {
      const participantValid = (
        participant.name.trim() !== '' &&
        participant.birthYear !== '' &&
        participant.birthMonth !== '' &&
        participant.birthDay !== '' &&
        participant.gender !== '' && participant.gender !== '성별' &&
        participant.category !== '' && participant.category !== '종목' &&
        participant.souvenir !== '' && 
        participant.size !== '' &&
        isPhoneValid(participant.phone1, participant.phone2, participant.phone3)
        // isEmailValid(participant.email1, participant.emailDomain === '직접입력' ? participant.email2 : participant.emailDomain) // API 구조 변경으로 제거
      );
      
      return participantValid;
    }) &&
    formData.paymentMethod !== '' &&
    formData.depositorName.trim() !== ''
  );

  return isValid;
};

// 공통 폼 유효성 검사 (오버로드)
export function isFormValid(formData: IndividualFormData): boolean;
export function isFormValid(formData: GroupFormData): boolean;
export function isFormValid(formData: IndividualFormData | GroupFormData): boolean {
  if ('groupName' in formData) {
    return isGroupFormValid(formData as GroupFormData);
  } else {
    return isIndividualFormValid(formData as IndividualFormData);
  }
}
