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
    formData.gender !== '' &&
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

// 단체신청 폼에서 누락된 필드 목록 반환 (친절한 메시지 형식)
export const getGroupFormValidationErrors = (formData: GroupFormData): string => {
  const sections: string[] = [];
  const basicInfoErrors: string[] = [];
  const contactErrors: string[] = [];
  const participantErrors: string[] = [];
  const paymentErrors: string[] = [];

  // 기본 정보 검증
  if (formData.groupName.trim() === '') {
    basicInfoErrors.push('• 단체명을 입력해주세요');
  }
  
  if (formData.groupId.trim() === '') {
    basicInfoErrors.push('• 단체신청용 ID를 입력해주세요');
  } else {
    const isGroupIdValid = formData.groupId.length >= 5 && 
                          formData.groupId.length <= 20 && 
                          !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(formData.groupId);
    if (!isGroupIdValid) {
      basicInfoErrors.push('• 단체신청용 ID는 5-20자이며 한글은 사용할 수 없습니다');
    }
  }
  
  if (formData.leaderName.trim() === '') {
    basicInfoErrors.push('• 대표자 성명을 입력해주세요');
  }
  
  if (formData.representativeBirthDate.trim() === '') {
    basicInfoErrors.push('• 대표자 생년월일을 입력해주세요');
  }
  
  if (formData.groupPassword.trim() === '') {
    basicInfoErrors.push('• 단체 비밀번호를 입력해주세요');
  } else if (!isPasswordValid(formData.groupPassword)) {
    basicInfoErrors.push('• 단체 비밀번호는 최소 6자리이며 공백을 포함할 수 없습니다');
  }
  
  if (formData.confirmGroupPassword.trim() === '') {
    basicInfoErrors.push('• 단체 비밀번호 확인을 입력해주세요');
  } else if (!isPasswordMatch(formData.groupPassword, formData.confirmGroupPassword)) {
    basicInfoErrors.push('• 단체 비밀번호와 비밀번호 확인이 일치하지 않습니다');
  }
  
  if (formData.postalCode.trim() === '') {
    basicInfoErrors.push('• 우편번호를 입력해주세요 (우편번호 찾기 버튼을 이용해주세요)');
  }
  
  if (formData.address.trim() === '') {
    basicInfoErrors.push('• 주소를 입력해주세요 (우편번호 찾기 버튼을 이용해주세요)');
  }
  
  // 연락처 정보 검증
  if (!isPhoneValid(formData.phone1, formData.phone2, formData.phone3)) {
    contactErrors.push('• 대표자 휴대폰번호를 모두 입력해주세요');
  }
  
  // 참가자 정보 검증
  if (formData.participants.length === 0) {
    participantErrors.push('• 최소 1명 이상의 참가자 정보를 입력해주세요');
  } else {
    formData.participants.forEach((participant, index) => {
      const participantFields: string[] = [];
      
      if (participant.name.trim() === '') {
        participantFields.push('이름');
      }
      if (participant.birthYear === '' || participant.birthMonth === '' || participant.birthDay === '') {
        participantFields.push('생년월일');
      }
      if (participant.gender === '' || participant.gender === '성별') {
        participantFields.push('성별');
      }
      if (participant.category === '' || participant.category === '종목') {
        participantFields.push('참가종목');
      }
      if (participant.souvenir === '') {
        participantFields.push('기념품');
      }
      if (participant.size === '') {
        participantFields.push('기념품 사이즈');
      }
      if (!isPhoneValid(participant.phone1, participant.phone2, participant.phone3)) {
        participantFields.push('연락처');
      }
      
      if (participantFields.length > 0) {
        participantErrors.push(`• 참가자 ${index + 1}번: ${participantFields.join(', ')}을(를) 입력해주세요`);
      }
    });
  }
  
  // 결제 정보 검증
  if (formData.paymentMethod === '') {
    paymentErrors.push('• 결제방법을 선택해주세요');
  }
  
  if (formData.depositorName.trim() === '') {
    paymentErrors.push('• 입금자명을 입력해주세요 (입금 확인을 위해 정확히 입력해주세요)');
  }

  // 섹션별로 메시지 구성
  if (basicInfoErrors.length > 0) {
    sections.push('【기본 정보】\n' + basicInfoErrors.join('\n'));
  }
  if (contactErrors.length > 0) {
    sections.push('【연락처 정보】\n' + contactErrors.join('\n'));
  }
  if (participantErrors.length > 0) {
    sections.push('【참가자 정보】\n' + participantErrors.join('\n'));
  }
  if (paymentErrors.length > 0) {
    sections.push('【결제 정보】\n' + paymentErrors.join('\n'));
  }

  if (sections.length === 0) {
    return '입력하신 정보를 확인해주세요';
  }

  return '다음 항목을 확인해주세요:\n\n' + sections.join('\n\n');
};

// 개인신청 폼에서 누락된 필드 목록 반환 (친절한 메시지 형식)
export const getIndividualFormValidationErrors = (formData: IndividualFormData): string => {
  const sections: string[] = [];
  const basicInfoErrors: string[] = [];
  const contactErrors: string[] = [];
  const registrationErrors: string[] = [];
  const paymentErrors: string[] = [];

  // 기본 정보 검증
  if (formData.name.trim() === '') {
    basicInfoErrors.push('• 이름을 입력해주세요');
  }
  
  if (formData.birthYear === '' || formData.birthMonth === '' || formData.birthDay === '') {
    basicInfoErrors.push('• 생년월일을 모두 선택해주세요');
  }
  
  if (formData.password.trim() === '') {
    basicInfoErrors.push('• 비밀번호를 입력해주세요');
  } else if (!isPasswordValid(formData.password)) {
    basicInfoErrors.push('• 비밀번호는 최소 6자리이며 공백을 포함할 수 없습니다');
  }
  
  if (formData.confirmPassword.trim() === '') {
    basicInfoErrors.push('• 비밀번호 확인을 입력해주세요');
  } else if (!isPasswordMatch(formData.password, formData.confirmPassword)) {
    basicInfoErrors.push('• 비밀번호와 비밀번호 확인이 일치하지 않습니다');
  }
  
  if (formData.gender === '') {
    basicInfoErrors.push('• 성별을 선택해주세요');
  }
  
  if (formData.postalCode.trim() === '') {
    basicInfoErrors.push('• 우편번호를 입력해주세요 (우편번호 찾기 버튼을 이용해주세요)');
  }
  
  if (formData.address.trim() === '') {
    basicInfoErrors.push('• 주소를 입력해주세요 (우편번호 찾기 버튼을 이용해주세요)');
  }
  
  // 연락처 정보 검증
  if (!isPhoneValid(formData.phone1, formData.phone2, formData.phone3)) {
    contactErrors.push('• 휴대폰번호를 모두 입력해주세요');
  }
  
  // 신청 정보 검증
  if (formData.category === '') {
    registrationErrors.push('• 참가종목을 선택해주세요');
  }
  
  if (formData.souvenir === '' || (Array.isArray(formData.souvenir) && formData.souvenir.length === 0)) {
    registrationErrors.push('• 기념품을 선택해주세요');
  }
  
  if (formData.size === '') {
    registrationErrors.push('• 기념품 사이즈를 선택해주세요');
  }
  
  // 결제 정보 검증
  if (formData.paymentMethod === '') {
    paymentErrors.push('• 결제방법을 선택해주세요');
  }
  
  if (formData.depositorName.trim() === '') {
    paymentErrors.push('• 입금자명을 입력해주세요 (입금 확인을 위해 정확히 입력해주세요)');
  }

  // 섹션별로 메시지 구성
  if (basicInfoErrors.length > 0) {
    sections.push('【기본 정보】\n' + basicInfoErrors.join('\n'));
  }
  if (contactErrors.length > 0) {
    sections.push('【연락처 정보】\n' + contactErrors.join('\n'));
  }
  if (registrationErrors.length > 0) {
    sections.push('【신청 정보】\n' + registrationErrors.join('\n'));
  }
  if (paymentErrors.length > 0) {
    sections.push('【결제 정보】\n' + paymentErrors.join('\n'));
  }

  if (sections.length === 0) {
    return '입력하신 정보를 확인해주세요';
  }

  return '다음 항목을 확인해주세요:\n\n' + sections.join('\n\n');
};
