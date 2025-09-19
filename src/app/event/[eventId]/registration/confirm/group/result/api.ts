// 단체신청 확인 API 함수들
import { GroupRegistrationConfirmData } from './types';

const API_BASE_URL = 'https://kma-user.duckdns.org';

// 단체신청 확인 데이터 조회
export const fetchGroupRegistrationConfirm = async (
  eventId: string, 
  organizationAccount: string
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
          orgPw: '' // 비밀번호는 인증 단계에서 이미 확인됨
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('단체신청 확인 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        eventId,
        organizationAccount
      });
      throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('단체신청 확인 API 호출 중 오류:', error);
    throw error;
  }
};

// 단체신청 수정 페이지로 이동하는 데이터 생성
export const createEditData = (data: GroupRegistrationConfirmData) => {
  return {
    groupName: data.organizationName,
    groupId: data.organizationAccount,
    representativeBirthDate: data.birth,
    postalCode: data.zipCode,
    address: data.address,
    detailedAddress: '', // API에서 상세주소가 별도로 오지 않는 경우
    extraAddress: '', // API에서 추가주소가 별도로 오지 않는 경우
    phone: data.phNum,
    email: data.email,
    participants: data.innerUserRegistrationList.map(participant => ({
      name: participant.name,
      birthYear: participant.birth.split('-')[0],
      birthMonth: participant.birth.split('-')[1],
      birthDay: participant.birth.split('-')[2],
      gender: participant.gender === 'M' ? 'male' : 'female',
      category: participant.eventCategoryName,
      souvenir: participant.souvenir[0]?.souvenirName || 'none',
      size: participant.souvenir[0]?.souvenirSize || '',
      email1: '',
      email2: '',
      emailDomain: 'naver.com',
      phone1: participant.phNum.split('-')[0],
      phone2: participant.phNum.split('-')[1],
      phone3: participant.phNum.split('-')[2],
    })),
    totalParticipants: data.organizationHeadCount,
    totalParticipationFee: data.sumAmount,
    paymentStatus: data.paymentStatus,
    depositorName: data.paymenterName
  };
};
