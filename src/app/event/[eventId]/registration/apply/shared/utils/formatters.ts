// 폼 데이터 포맷팅 함수들
import { normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';

// 생년월일을 YYYY-MM-DD 형식으로 변환 (공통 유틸 사용)
export const formatBirthDate = (year: string, month: string, day: string): string => {
  // 2자리 연도를 4자리로 변환 (과거 날짜가 되도록 조정)
  let fullYear = year;
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    const currentYear2Digit = currentYear % 100;
    
    // 현재 연도의 2자리와 비교하여 과거 날짜로 변환
    if (yearNum > currentYear2Digit) {
      // 현재 연도보다 크면 1900년대로 변환
      fullYear = `19${year.padStart(2, '0')}`;
    } else {
      // 현재 연도보다 작거나 같으면 2000년대로 변환
      fullYear = `20${year.padStart(2, '0')}`;
    }
  }
  
  const birthString = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // 공통 유틸로 정규화 (일관성 보장)
  return normalizeBirthDate(birthString) || birthString;
};

// 전화번호를 010-1234-5678 형식으로 변환 (공통 유틸 사용)
export const formatPhoneNumber = (phone1: string, phone2: string, phone3: string): string => {
  // 전화번호 자릿수 검증 및 보정
  let correctedPhone2 = phone2;
  let correctedPhone3 = phone3;
  
  // 010으로 시작하는 경우 4자리-4자리 형식이어야 함
  if (phone1 === '010') {
    // phone2가 3자리인 경우 앞에 0을 추가
    if (phone2.length === 3) {
      correctedPhone2 = '0' + phone2;
    }
    // phone3가 3자리인 경우 뒤에 0을 추가
    if (phone3.length === 3) {
      correctedPhone3 = phone3 + '0';
    }
  }
  
  const phoneString = `${phone1}-${correctedPhone2}-${correctedPhone3}`;
  // 공통 유틸로 정규화 (일관성 보장)
  return normalizePhoneNumber(phoneString) || phoneString;
};

// 이메일을 완성
export const formatEmail = (email1: string, emailDomain: string, email2?: string): string => {
  // 이메일이 비어있으면 빈 문자열 반환 (선택사항)
  if (!email1.trim()) {
    return '';
  }
  
  // 직접입력인 경우
  if (emailDomain === '직접입력') {
    // email2가 제공되고 비어있지 않으면 사용
    if (email2 && email2.trim()) {
      return `${email1}@${email2}`;
    }
    // email2가 없거나 비어있으면 빈 문자열 반환
    return '';
  }
  
  // 도메인이 비어있으면 빈 문자열 반환
  if (!emailDomain.trim()) {
    return '';
  }
  
  return `${email1}@${emailDomain}`;
};

// 성별을 M/F로 변환
export const formatGender = (gender: 'male' | 'female'): string => {
  return gender === 'male' ? 'M' : 'F';
};

// 주소 정보 파싱
export const parseAddress = (address: string): { siDo: string; siGunGu: string } => {
  let siDo = '';
  let siGunGu = '';
  
  if (address) {
    const addressParts = address.split(' ');
    // 첫 번째 부분이 시도 (예: 서울특별시, 경기도)
    siDo = addressParts[0] || '';
    // 두 번째 부분이 시군구 (예: 강남구, 수원시)
    siGunGu = addressParts[1] || '';
    
    // 시도가 "시"로 끝나는 경우 (예: 부산시, 대구시) 다음 부분도 포함
    if (siDo.endsWith('시') && addressParts[1] && !addressParts[1].includes('시') && !addressParts[1].includes('구')) {
      siGunGu = addressParts[2] || '';
    }
  }
  
  return { siDo, siGunGu };
};
