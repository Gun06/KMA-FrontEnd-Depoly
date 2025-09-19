// 공통 상수 정의
import { Option, SouvenirOption } from './common';

// 전화번호 접두사
export const phonePrefixes: Option[] = [
  { value: '010', label: '010' },
  { value: '011', label: '011' },
  { value: '016', label: '016' },
  { value: '017', label: '017' },
  { value: '018', label: '018' },
  { value: '019', label: '019' }
];

// 이메일 도메인
export const emailDomains: Option[] = [
  { value: '', label: '직접입력' },
  { value: 'naver.com', label: 'naver.com' },
  { value: 'daum.net', label: 'daum.net' },
  { value: 'gmail.com', label: 'gmail.com' },
  { value: 'hanmail.net', label: 'hanmail.net' },
  { value: 'hotmail.com', label: 'hotmail.com' },
  { value: 'outlook.com', label: 'outlook.com' }
];

// 참가종목
export const categories: Option[] = [
  { value: 'full', label: '풀코스 (42.195km)' },
  { value: 'half', label: '하프코스 (21.0975km)' },
  { value: '10k', label: '10km' },
  { value: '5k', label: '5km' },
  { value: 'fun', label: '펀런 (5km)' }
];

// 결제 방법
export const paymentMethods: Option[] = [
  { value: 'bank_transfer', label: '계좌이체' },
  { value: 'credit_card', label: '신용카드' },
  { value: 'virtual_account', label: '가상계좌' }
];

// 성별 옵션
export const genderOptions: Option[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' }
];

// 참가종목별 기본 참가비
export const PARTICIPATION_FEES = {
  full: 50000,  // 풀마라톤
  half: 40000,  // 하프마라톤
  '10k': 30000, // 10km
  '5k': 20000,  // 5km
  'fun': 15000  // 펀런
} as const;

// 참가종목별 기념품 옵션
export const getSouvenirsByCategory = (category: string): SouvenirOption[] => {
  const souvenirOptions: Record<string, SouvenirOption[]> = {
    'full': [
      { value: 'shorts_black', label: '월드런 레이싱 쇼츠 (블랙)', price: 39000 },
      { value: 'shorts_mint', label: '월드런 레이싱 쇼츠 (민트)', price: 39000 },
      { value: 'none', label: '기념품 없음', price: 10000 }
    ],
    'half': [
      { value: 'shorts_black', label: '월드런 레이싱 쇼츠 (블랙)', price: 39000 },
      { value: 'shorts_mint', label: '월드런 레이싱 쇼츠 (민트)', price: 39000 },
      { value: 'none', label: '기념품 없음', price: 10000 }
    ],
    '10k': [
      { value: 'cap_black', label: '월드런 캡 (블랙)', price: 25000 },
      { value: 'cap_white', label: '월드런 캡 (화이트)', price: 25000 },
      { value: 'none', label: '기념품 없음', price: 10000 }
    ],
    '5k': [
      { value: 'cap_black', label: '월드런 캡 (블랙)', price: 25000 },
      { value: 'cap_white', label: '월드런 캡 (화이트)', price: 25000 },
      { value: 'none', label: '기념품 없음', price: 10000 }
    ],
    'fun': [
      { value: 'towel', label: '월드런 타월', price: 15000 },
      { value: 'none', label: '기념품 없음', price: 10000 }
    ]
  };
  
  return souvenirOptions[category] || [];
};

// 기본 기념품 옵션 (참가종목 선택 전)
export const defaultSouvenirs: SouvenirOption[] = [
  { value: '', label: '참가종목을 먼저 선택해주세요', price: 0 }
];


// 년도 옵션 생성
export const generateYearOptions = (): Option[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 100; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

// 월 옵션 생성
export const generateMonthOptions = (): Option[] => {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    const month = i.toString().padStart(2, '0');
    months.push({ value: month, label: month });
  }
  return months;
};

// 일 옵션 생성
export const generateDayOptions = (): Option[] => {
  const days = [];
  for (let i = 1; i <= 31; i++) {
    const day = i.toString().padStart(2, '0');
    days.push({ value: day, label: day });
  }
  return days;
};
