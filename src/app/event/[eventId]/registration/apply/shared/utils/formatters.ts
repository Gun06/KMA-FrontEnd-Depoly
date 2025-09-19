// 폼 데이터 포맷팅 함수들

// 생년월일을 YYYY-MM-DD 형식으로 변환
export const formatBirthDate = (year: string, month: string, day: string): string => {
  // 2자리 연도를 4자리로 변환 (00-99 -> 2000-2099)
  let fullYear = year;
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    fullYear = yearNum <= 99 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
  }
  
  const result = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return result;
};

// 전화번호를 010-1234-5678 형식으로 변환
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
  
  const result = `${phone1}-${correctedPhone2}-${correctedPhone3}`;
  return result;
};

// 이메일을 완성
export const formatEmail = (email1: string, emailDomain: string, email2?: string): string => {
  const domain = emailDomain === '직접입력' && email2 ? email2 : emailDomain;
  return `${email1}@${domain}`;
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
