import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { convertPaymentStatusToKorean } from "@/types/registration";

/**
 * 카테고리 문자열에서 거리와 세부종목 이름을 추출
 * @param category "10km | 짝궁마라톤" 형식의 문자열
 * @returns { distance: string, categoryName: string }
 */
export const parseCategoryWithDistance = (category: string): { distance: string; categoryName: string } => {
  if (!category || !category.includes('|')) {
    return { distance: '', categoryName: category };
  }

  const parts = category.split('|').map((p: string) => p.trim());
  if (parts.length > 0) {
    const firstPart = parts[0];
    // 첫 번째 부분이 거리 형식인지 확인 (예: "10km", "3km" 등)
    if (firstPart.match(/^\d+km$/i)) {
      return {
        distance: firstPart,
        categoryName: parts.slice(1).join(' | ').trim()
      };
    }
  }

  return { distance: '', categoryName: category };
};

/**
 * 거리와 세부종목 이름을 조합하여 카테고리 문자열 생성
 */
export const formatCategoryWithDistance = (distance: string, categoryName: string): string => {
  return distance ? `${distance} | ${categoryName}` : categoryName;
};

/**
 * 참가비 계산
 */
export const calculateParticipantFee = (category: string, eventInfo: EventRegistrationInfo | null): number => {
  if (!category || !eventInfo) return 0;

  const { distance, categoryName } = parseCategoryWithDistance(category);
  
  const selectedCategory = eventInfo.categorySouvenirList.find(c => {
    if (distance) {
      return c.categoryName === categoryName && c.distance === distance;
    }
    return c.categoryName === categoryName;
  });

  return selectedCategory?.amount || 0;
};

/**
 * 결제 상태를 한글로 변환
 */
export const formatPaymentStatusText = (status: string | undefined): string => {
  const paymentStatus = status || 'UNPAID';
  
  if (paymentStatus === 'PAID' || paymentStatus === 'COMPLETED') {
    return '결제완료';
  } else if (paymentStatus === 'UNPAID') {
    return '미입금';
  } else {
    const koreanStatus = convertPaymentStatusToKorean(paymentStatus);
    return koreanStatus === '미결제' ? '미입금' : koreanStatus;
  }
};

/**
 * 결제 상태에 따른 색상 클래스 반환
 */
export const getPaymentStatusColorClass = (status: string | undefined): string => {
  const statusUpper = (status || 'UNPAID').toUpperCase();
  
  if (statusUpper === 'PAID' || statusUpper === 'COMPLETED') {
    return 'text-green-600';
  } else if (statusUpper === 'MUST_CHECK' || statusUpper === 'NEED_REFUND' || statusUpper === 'NEED_PARTITIAL_REFUND') {
    return 'text-orange-600';
  } else if (statusUpper === 'REFUNDED') {
    return 'text-gray-600';
  }
  
  return 'text-red-600';
};

/**
 * 초기 참가자 데이터 생성
 */
export const createInitialParticipant = (): ParticipantData => ({
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  phone1: '010',
  phone2: '',
  phone3: '',
  gender: '성별',
  category: '종목',
  souvenir: '선택',
  size: '',
  selectedSouvenirs: [],
  note: ''
});

/**
 * 참가자의 카테고리 표시 텍스트 생성
 */
export const getCategoryDisplayText = (
  participant: ParticipantData,
  eventInfo: EventRegistrationInfo | null
): string => {
  if (!eventInfo) return "로딩 중...";
  if (!participant.category || participant.category === '종목') {
    return "참가종목을 선택해주세요";
  }

  const { distance, categoryName } = parseCategoryWithDistance(participant.category);
  
  // categorySouvenirList에서 거리 정보 확인
  const selectedCategory = eventInfo.categorySouvenirList.find(c => {
    if (distance) {
      return c.categoryName === categoryName && c.distance === distance;
    }
    return c.categoryName === categoryName;
  });

  if (selectedCategory && selectedCategory.distance) {
    return `${selectedCategory.distance} | ${categoryName}`;
  }

  return participant.category;
};

