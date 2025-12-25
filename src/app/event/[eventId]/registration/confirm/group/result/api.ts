// 단체신청 확인 API 함수들
import { GroupRegistrationConfirmData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 단체신청 확인 데이터 조회
export const fetchGroupRegistrationConfirm = async (
  eventId: string, 
  organizationAccount: string,
  password?: string
): Promise<GroupRegistrationConfirmData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/view-registration-info/organization`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: organizationAccount,
          orgPw: password || '' // 비밀번호가 제공되면 사용, 없으면 빈 문자열
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체신청 수정 페이지로 이동하는 데이터 생성
export const createEditData = (data: GroupRegistrationConfirmData) => {
  // 새로운 API 스키마에 맞게 데이터 생성
  const editData = {
    // 새로운 스키마 필드명 사용
    organizationName: data.organizationName,
    organizationAccount: data.organizationAccount,
    leaderName: (data as any).leaderName || data.innerUserRegistrationList[0]?.name || '',
    leaderBirth: (data as any).leaderBirth || data.birth || '',
    leaderPhNum: (data as any).leaderPhNum || data.phNum || '',
    email: data.email,
    address: data.address, // 이미 cleanAddress가 적용된 주소
    zipCode: data.zipCode,
    addressDetail: data.addressDetail || '', // 상세주소 추가
    paymenterName: data.paymenterName,
    paymentType: data.paymentType, // 결제방법 정보 추가
    innerUserRegistrationList: data.innerUserRegistrationList.map(participant => ({
      ...participant,
      // 참가자 이메일 정보 추가 (새로운 스키마)
      email: participant.email || data.email || ''
    })),
    
    // 기존 호환성을 위한 필드들도 유지
    groupName: data.organizationName,
    groupId: data.organizationAccount,
    representativeBirthDate: (data as any).leaderBirth || data.birth || '',
    postalCode: data.zipCode,
    detailedAddress: data.addressDetail || '', // 상세주소 사용
    extraAddress: '', // API에서 추가주소가 별도로 오지 않는 경우
    phone: (data as any).leaderPhNum || data.phNum || '',
    participants: data.innerUserRegistrationList.map(participant => {
      // 기념품 정보 처리 (다중 선택 지원)
      const souvenirList = Array.isArray(participant.souvenir) ? participant.souvenir : [];
      const firstSouvenir = souvenirList[0];
      
      // souvenirId가 있으면 사용, 없으면 souvenirName으로 판단
      let souvenirId = firstSouvenir?.souvenirId;
      let souvenirName = firstSouvenir?.souvenirName || '';
      
      // '기념품 없음' 또는 'none'인 경우 '0'으로 설정
      if (!souvenirId) {
        if (souvenirName === '기념품 없음' || souvenirName === 'none' || souvenirName === '') {
          souvenirId = '0';
        } else {
          // souvenirId가 없고 이름만 있는 경우, 기본값으로 '0' 설정
          souvenirId = '0';
        }
      }
      
      // selectedSouvenirs 배열 생성 (다중 선택 지원)
      const selectedSouvenirs = souvenirList.length > 0 
        ? souvenirList.map((s: any) => ({
            souvenirId: String(s.souvenirId || '0'),
            souvenirName: String(s.souvenirName || '기념품 없음'),
            size: String(s.souvenirSize || '사이즈 없음')
          }))
        : [{
            souvenirId: '0',
            souvenirName: '기념품 없음',
            size: '사이즈 없음'
          }];
      
      return {
      name: participant.name,
      birthYear: participant.birth.split('-')[0],
      birthMonth: participant.birth.split('-')[1],
      birthDay: participant.birth.split('-')[2],
      gender: participant.gender === 'M' ? 'male' : 'female',
      category: participant.eventCategoryName,
        souvenir: String(souvenirId || '0'), // souvenirId를 문자열로 변환
        size: firstSouvenir?.souvenirSize || '사이즈 없음',
        selectedSouvenirs, // 다중 선택 배열 추가
      email1: '',
      email2: '',
      emailDomain: 'naver.com',
      phone1: participant.phNum.split('-')[0],
      phone2: participant.phNum.split('-')[1],
      phone3: participant.phNum.split('-')[2],
      paymentStatus: participant.paymentStatus || 'UNPAID', // 각 참가자별 결제 상태
      registrationId: participant.registrationId, // 수정 모드에서 사용
      isLeader: participant.checkLeader || false, // 단체장 여부
      };
    }),
    totalParticipants: data.organizationHeadCount,
    totalParticipationFee: data.sumAmount,
    paymentStatus: data.paymentStatus,
    depositorName: data.paymenterName
  };
  
  return editData;
};
