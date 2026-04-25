// 개인신청 관련 상수 정의
import { IndividualFormData } from './individual';

// 초기 폼 데이터
export const initialIndividualFormData: IndividualFormData = {
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  password: '',
  confirmPassword: '',
  gender: '',
  postalCode: '',
  address: '',
  detailedAddress: '',
  noDetailedAddress: false,
  extraAddress: '',
  phone1: '010',
  phone2: '',
  phone3: '',
  guardianPhone1: '010',
  guardianPhone2: '',
  guardianPhone3: '',
  guardianRelationship: '',
  email1: '',
  email2: '',
  emailDomain: '',
  selectedDistance: '',
  category: '',
  souvenir: '',
  size: '',
  selectedSouvenirs: [],
  jeonmahyupId: '',
  paymentMethod: '',
  depositorName: '',
  note: ''
};
