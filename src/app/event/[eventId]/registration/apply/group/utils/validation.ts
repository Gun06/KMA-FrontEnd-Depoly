import { GroupFormData } from "../data";

// 필수 필드 검증
export const isFormValid = (formData: GroupFormData) => {
  return (
    // 단체 정보
    formData.groupName.trim() !== '' &&
    formData.groupId.trim() !== '' &&
    formData.representativeBirthDate.trim() !== '' &&
    formData.groupPassword.trim() !== '' &&
    formData.confirmGroupPassword.trim() !== '' &&
    formData.groupPassword === formData.confirmGroupPassword &&
    formData.postalCode.trim() !== '' &&
    formData.address.trim() !== '' &&
    
    // 개인 정보 (연락처만, 이메일은 선택사항)
    formData.phone1.trim() !== '' &&
    formData.phone2.trim() !== '' &&
    formData.phone3.trim() !== '' &&
    // formData.email1.trim() !== '' && // 이메일은 선택사항으로 변경
    // formData.email2.trim() !== '' && // 이메일은 선택사항으로 변경
    // formData.emailDomain.trim() !== '' && // 이메일은 선택사항으로 변경
    
    // 참가인원 정보 (최소 1명)
    formData.participants.length > 0 &&
    formData.participants.some(participant => 
      participant.name.trim() !== '' &&
      participant.birthYear !== '' &&
      participant.birthMonth !== '' &&
      participant.birthDay !== '' &&
      participant.gender !== '' &&
      participant.gender !== '성별' &&
      participant.category !== '' &&
      participant.category !== '성별 선택' &&
      participant.phone1.trim() !== '' &&
      participant.phone2.trim() !== '' &&
      participant.phone3.trim() !== ''
    ) &&
    
    // 결제 정보
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
