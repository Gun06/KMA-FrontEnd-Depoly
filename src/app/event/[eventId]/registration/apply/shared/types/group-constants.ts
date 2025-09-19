// 단체신청 관련 상수 정의
import { GroupFormData, ParticipantData } from './group';

// 초기 참가자 데이터
export const createInitialParticipant = (): ParticipantData => ({
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: '성별',
  category: '종목',
  souvenir: '선택',
  size: '사이즈',
  email1: '',
  email2: '',
  emailDomain: '직접입력',
  phone1: '010',
  phone2: '',
  phone3: ''
});

// 초기 폼 데이터
export const initialGroupFormData: GroupFormData = {
  // 단체 정보
  groupName: '',
  groupId: '',
  representativeBirthDate: '',
  groupPassword: '',
  confirmGroupPassword: '',
  leaderName: '',
  postalCode: '',
  address: '',
  detailedAddress: '',
  
  // 개인 정보 (연락처, 이메일만)
  phone1: '010',
  phone2: '',
  phone3: '',
  email1: '',
  email2: '',
  emailDomain: '직접입력',
  
  // 참가인원 정보
  participants: [
    createInitialParticipant()
  ],
  
  // 결제 정보
  paymentMethod: 'bank_transfer',
  depositorName: ''
};
