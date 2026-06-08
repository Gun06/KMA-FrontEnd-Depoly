import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { CategorySouvenir, EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { convertPaymentStatusToKorean } from "@/types/registration";

const CLOSURE_SUFFIX_PATTERN = /\s*\((마감|기념품 마감)\)\s*$/;

/** 표시·저장용 — (마감)/(기념품 마감) 접미사 제거 (중복 방지) */
export function stripClosureSuffix(name: string): string {
  let result = name.trim();
  while (CLOSURE_SUFFIX_PATTERN.test(result)) {
    result = result.replace(CLOSURE_SUFFIX_PATTERN, '').trim();
  }
  return result;
}

/**
 * 카테고리 문자열에서 거리와 세부종목 이름을 추출
 * @param category "10km | 짝궁마라톤" 또는 "half | 세부종목" 형식의 문자열
 * @returns { distance: string, categoryName: string }
 */
export const parseCategoryWithDistance = (category: string): { distance: string; categoryName: string } => {
  if (!category || !category.includes('|')) {
    return { distance: '', categoryName: category };
  }

  // | 기준으로 앞부분은 거리(종목), 뒷부분은 세부종목으로 처리
  const parts = category.split('|').map((p: string) => p.trim());
  if (parts.length >= 2) {
    return {
      distance: parts[0], // 앞부분을 거리로 (예: "10km", "half" 등)
      categoryName: parts.slice(1).join(' | ').trim() // 뒷부분을 세부종목으로
    };
  }

  return { distance: '', categoryName: category };
};

/**
 * eventInfo에서 종목 찾기 (eventCategoryId 우선, 이름·거리 fallback)
 */
function categoryMatchesSelection(
  c: CategorySouvenir,
  distance: string,
  categoryName: string
): boolean {
  if (distance) {
    return c.categoryName === categoryName && c.distance?.toLowerCase() === distance.toLowerCase();
  }
  if (categoryName) {
    return (
      c.categoryName === categoryName ||
      c.distance?.toLowerCase() === categoryName.toLowerCase()
    );
  }
  return false;
}

export function getParticipantCategoryClosure(
  participant: ParticipantData,
  eventInfo: EventRegistrationInfo | null
): {
  category: CategorySouvenir | undefined;
  isCategoryClosed: boolean;
  hasInactiveSouvenir: boolean;
  isSelectedSouvenirClosed: boolean;
} {
  const category = findCategoryInEventInfo(
    participant.category,
    eventInfo,
    participant.eventCategoryId
  );

  if (!category) {
    return {
      category: undefined,
      isCategoryClosed: false,
      hasInactiveSouvenir: false,
      isSelectedSouvenirClosed: false,
    };
  }

  const isCategoryClosed = category.isActive === false;
  const hasInactiveSouvenir =
    category.categorySouvenirPair?.some((s) => s.isActive === false) ?? false;

  const selectedSouvenirIds =
    participant.selectedSouvenirs && participant.selectedSouvenirs.length > 0
      ? participant.selectedSouvenirs.map((s) => s.souvenirId)
      : participant.souvenir && participant.souvenir !== '선택'
        ? [participant.souvenir]
        : [];

  const isSelectedSouvenirClosed = selectedSouvenirIds.some((id) => {
    const matched = category.categorySouvenirPair?.find(
      (s) => String(s.souvenirId) === String(id)
    );
    return matched != null && matched.isActive === false;
  });

  return {
    category,
    isCategoryClosed,
    hasInactiveSouvenir,
    isSelectedSouvenirClosed,
  };
}

export function findCategoryInEventInfo(
  category: string,
  eventInfo: EventRegistrationInfo | null,
  eventCategoryId?: string
): CategorySouvenir | undefined {
  if (!eventInfo) return undefined;

  const { distance, categoryName } = parseCategoryWithDistance(category);

  // 1. ID 우선 — 단, 현재 category 문자열과 일치할 때만 (stale ID 방어)
  if (eventCategoryId) {
    const byId = eventInfo.categorySouvenirList.find((c) => c.categoryId === eventCategoryId);
    if (byId && categoryMatchesSelection(byId, distance, categoryName)) {
      return byId;
    }
  }

  // 2. 이름+거리 매칭 (ID 없음·불일치 시)
  const byNameAndDistance = eventInfo.categorySouvenirList.find((c) =>
    categoryMatchesSelection(c, distance, categoryName)
  );
  if (byNameAndDistance) return byNameAndDistance;

  // 3. ID만으로 fallback (마감·구버전 종목 — API eventCategoryName 형식이 다른 경우)
  if (eventCategoryId) {
    const byId = eventInfo.categorySouvenirList.find((c) => c.categoryId === eventCategoryId);
    if (byId) return byId;
  }

  return undefined;
}

/**
 * 거리와 세부종목 이름을 조합하여 카테고리 문자열 생성
 */
export const formatCategoryWithDistance = (distance: string, categoryName: string): string => {
  const cleanDistance = stripClosureSuffix(distance);
  const cleanName = stripClosureSuffix(categoryName);
  return cleanDistance ? `${cleanDistance} | ${cleanName}` : cleanName;
};

/**
 * 참가비 계산
 */
export const calculateParticipantFee = (
  category: string,
  eventInfo: EventRegistrationInfo | null,
  fallbackAmount?: number,
  eventCategoryId?: string
): number => {
  if (!category || !eventInfo) return fallbackAmount ?? 0;

  const selectedCategory = findCategoryInEventInfo(category, eventInfo, eventCategoryId);
  return selectedCategory?.amount ?? fallbackAmount ?? 0;
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

  const selectedCategory = findCategoryInEventInfo(
    participant.category,
    eventInfo,
    participant.eventCategoryId
  );

  if (selectedCategory) {
    const base = formatCategoryWithDistance(
      selectedCategory.distance,
      selectedCategory.categoryName
    );
    const { isCategoryClosed, hasInactiveSouvenir } = getParticipantCategoryClosure(
      participant,
      eventInfo
    );

    if (isCategoryClosed) return `${base} (마감)`;
    if (hasInactiveSouvenir) return `${base} (기념품 마감)`;
    return base;
  }

  return stripClosureSuffix(participant.category);
};

export interface ParticipantRowState {
  isExistingParticipant: boolean;
  isNewParticipant: boolean;
  isOwned: boolean;
  isDisabled: boolean;
  isCategorySouvenirChangeDisabled: boolean;
  canDelete: boolean;
}

export function getParticipantRowState(
  participant: ParticipantData,
  isEditMode: boolean
): ParticipantRowState {
  const isExistingParticipant = isEditMode && Boolean(participant.registrationId);
  const isNewParticipant = isEditMode && !participant.registrationId;
  const paymentStatus = participant.paymentStatus?.toUpperCase();
  const isOwned = participant.checkOwned === true;

  const isRowBlocked =
    paymentStatus === 'MUST_CHECK' ||
    paymentStatus === 'NEED_REFUND' ||
    paymentStatus === 'NEED_PARTITIAL_REFUND' ||
    paymentStatus === 'REFUNDED' ||
    isOwned;

  const isUnpaid = !paymentStatus || paymentStatus === 'UNPAID';
  const isCompleted = paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
  const canEditCategorySouvenir = isUnpaid || isCompleted;

  return {
    isExistingParticipant,
    isNewParticipant,
    isOwned,
    isDisabled: isRowBlocked,
    isCategorySouvenirChangeDisabled: !canEditCategorySouvenir,
    canDelete: !isRowBlocked && (!isEditMode || !isExistingParticipant),
  };
}

