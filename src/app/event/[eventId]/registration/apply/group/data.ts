// 참가자 정보 타입
export interface ParticipantData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  category: string;
  souvenir: string;
  email1: string;
  email2: string;
  emailDomain: string;
  phone1: string;
  phone2: string;
  phone3: string;
}

// 단체신청 폼 데이터 타입
export interface GroupFormData {
  // 단체 정보
  groupName: string;
  groupId: string;
  representativeBirthDate: string;
  groupPassword: string;
  confirmGroupPassword: string;
  postalCode: string;
  address: string;
  detailedAddress: string;
  
  // 개인 정보 (연락처, 이메일만)
  phone1: string;
  phone2: string;
  phone3: string;
  email1: string;
  email2: string;
  emailDomain: string;
  
  // 참가인원 정보
  participants: ParticipantData[];
  
  // 결제 정보
  paymentMethod: string;
  depositorName: string;
}

// 초기 참가자 데이터
export const createInitialParticipant = (): ParticipantData => ({
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: '성별',
  category: '',
  souvenir: '선택',
  email1: '',
  email2: '',
  emailDomain: 'naver.com',
  phone1: '010',
  phone2: '',
  phone3: ''
});

// 초기 폼 데이터
export const initialFormData: GroupFormData = {
  // 단체 정보
  groupName: '',
  groupId: '',
  representativeBirthDate: '',
  groupPassword: '',
  confirmGroupPassword: '',
  postalCode: '',
  address: '',
  detailedAddress: '',
  
  // 개인 정보 (연락처, 이메일만)
  phone1: '010',
  phone2: '',
  phone3: '',
  email1: '',
  email2: '',
  emailDomain: 'naver.com',
  
  // 참가인원 정보
  participants: [
    createInitialParticipant()
  ],
  
  // 결제 정보
  paymentMethod: 'bank_transfer',
  depositorName: ''
};

// 전화번호 접두사
export const phonePrefixes = [
  { value: '010', label: '010' },
  { value: '011', label: '011' },
  { value: '016', label: '016' },
  { value: '017', label: '017' },
  { value: '018', label: '018' },
  { value: '019', label: '019' }
];

// 이메일 도메인
export const emailDomains = [
  { value: 'naver.com', label: 'naver.com' },
  { value: 'gmail.com', label: 'gmail.com' },
  { value: 'daum.net', label: 'daum.net' },
  { value: 'hanmail.net', label: 'hanmail.net' },
  { value: 'hotmail.com', label: 'hotmail.com' },
  { value: 'outlook.com', label: 'outlook.com' }
];

// 참가종목
export const categories = [
  { value: 'full', label: '풀코스 (42.195km)' },
  { value: 'half', label: '하프코스 (21.1km)' },
  { value: '10k', label: '10km' },
  { value: '5k', label: '5km' }
];

// 참가종목별 기본 참가비
export const PARTICIPATION_FEES = {
  full: 50000,  // 풀마라톤
  half: 40000,  // 하프마라톤
  '10k': 30000, // 10km
  '5k': 20000   // 5km
} as const;

// 기념품 옵션
export const getSouvenirsByCategory = (category: string) => {
  const souvenirOptions: Record<string, Array<{ value: string; label: string; price: number }>> = {
    'full': [
      { value: 'shorts_black', label: '월드런 레이싱 쇼츠 (블랙)', price: 39000 },
      { value: 'shorts_mint', label: '월드런 레이싱 쇼츠 (민트)', price: 39000 },
      { value: 'none', label: '기념품 없음', price: 0 }
    ],
    'half': [
      { value: 'shorts_black', label: '월드런 레이싱 쇼츠 (블랙)', price: 39000 },
      { value: 'shorts_mint', label: '월드런 레이싱 쇼츠 (민트)', price: 39000 },
      { value: 'none', label: '기념품 없음', price: 0 }
    ],
    '10k': [
      { value: 'cap_black', label: '월드런 캡 (블랙)', price: 25000 },
      { value: 'cap_white', label: '월드런 캡 (화이트)', price: 25000 },
      { value: 'none', label: '기념품 없음', price: 0 }
    ],
    '5k': [
      { value: 'cap_black', label: '월드런 캡 (블랙)', price: 25000 },
      { value: 'cap_white', label: '월드런 캡 (화이트)', price: 25000 },
      { value: 'none', label: '기념품 없음', price: 0 }
    ]
  };
  return souvenirOptions[category] || [];
};

// 참가비 계산 함수
export const getParticipationFee = (category: string, souvenir: string) => {
  const baseFee = PARTICIPATION_FEES[category as keyof typeof PARTICIPATION_FEES] || 0;
  const currentSouvenirs = getSouvenirsByCategory(category);
  const selectedSouvenir = currentSouvenirs.find(s => s.value === souvenir);
  const souvenirFee = selectedSouvenir ? selectedSouvenir.price : 0;
  return baseFee + souvenirFee;
};

// 결제 방법
export const paymentMethods = [
  { value: 'bank_transfer', label: '계좌이체' }
];

// 성별 옵션
export const genderOptions = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' }
];

// 년도 옵션 생성
export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 80; year <= currentYear - 10; year++) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years.reverse();
};

// 월 옵션 생성
export const generateMonthOptions = () => {
  const months = [];
  for (let month = 1; month <= 12; month++) {
    months.push({ value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') });
  }
  return months;
};

// 일 옵션 생성
export const generateDayOptions = () => {
  const days = [];
  for (let day = 1; day <= 31; day++) {
    days.push({ value: day.toString().padStart(2, '0'), label: day.toString().padStart(2, '0') });
  }
  return days;
};
