import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { parseCategoryWithDistance } from "./participantHelpers";

/**
 * 참가자의 기념품 선택 가능 여부 확인
 */
export const isSouvenirDisabled = (
  participant: ParticipantData,
  eventInfo: EventRegistrationInfo | null
): boolean => {
  return !participant.category || participant.category === '' || participant.category === '종목';
};

/**
 * 참가자의 사이즈 선택 가능 여부 확인
 */
export const isSizeDisabled = (
  participant: ParticipantData,
  eventInfo: EventRegistrationInfo | null
): boolean => {
  if (!participant.souvenir || participant.souvenir === '' || participant.souvenir === '선택') {
    return true;
  }

  // 기념품 없음 판단 (ID 기반)
  if (participant.souvenir === '0' || participant.souvenir === '1' || participant.souvenir === '2') {
    return true;
  }

  // 기념품 없음 판단 (이름 기반) - 이벤트 정보에서 확인
  if (eventInfo && participant.category) {
    const { distance, categoryName } = parseCategoryWithDistance(participant.category);
    
    const selectedCategory = eventInfo.categorySouvenirList.find(c => {
      if (distance) {
        return c.categoryName === categoryName && c.distance === distance;
      }
      return c.categoryName === categoryName;
    });

    if (selectedCategory) {
      const selectedSouvenir = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participant.souvenir);
      if (selectedSouvenir && selectedSouvenir.souvenirName === '기념품 없음') {
        return true;
      }
    }
  }

  return false;
};

/**
 * 참가자별 disabled 상태 계산
 */
export const calculateParticipantDisabledStates = (
  participants: ParticipantData[],
  eventInfo: EventRegistrationInfo | null
) => {
  return participants.map((participant) => ({
    isSouvenirDisabled: isSouvenirDisabled(participant, eventInfo),
    isSizeDisabled: isSizeDisabled(participant, eventInfo)
  }));
};

/**
 * 기념품 선택 텍스트 생성
 */
export const getSouvenirDisplayText = (
  participant: ParticipantData,
  eventInfo: EventRegistrationInfo | null
): string => {
  if (!eventInfo || !participant.category || participant.category === '종목') {
    return '참가종목을 먼저 선택해주세요';
  }

  // 여러 기념품이 선택된 경우
  if (participant.selectedSouvenirs && participant.selectedSouvenirs.length > 0) {
    if (participant.selectedSouvenirs.length === 1) {
      // 하나만 선택된 경우: "기념품명 (사이즈)"
      const souvenir = participant.selectedSouvenirs[0];
      return `${souvenir.souvenirName}${souvenir.size ? ` (${souvenir.size})` : ''}`;
    } else {
      // 여러 개 선택된 경우: "X개 기념품 선택됨"
      return `${participant.selectedSouvenirs.length}개 기념품 선택됨`;
    }
  }

  // 기존 방식 (호환성)
  if (participant.souvenir && participant.souvenir !== '') {
    const { distance, categoryName } = parseCategoryWithDistance(participant.category);
    
    const selectedCategory = eventInfo.categorySouvenirList.find(c => {
      if (distance) {
        return c.categoryName === categoryName && c.distance === distance;
      }
      return c.categoryName === categoryName;
    });

    if (selectedCategory) {
      const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participant.souvenir);
      if (selectedSouvenirObj) {
        return selectedSouvenirObj.souvenirName;
      }
    }
  }

  return '기념품 선택';
};

