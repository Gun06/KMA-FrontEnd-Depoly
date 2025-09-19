// 공통 계산 함수들
import { getSouvenirsByCategory, defaultSouvenirs, PARTICIPATION_FEES } from '../types/constants';

// 현재 선택된 참가종목에 따른 기념품 옵션 가져오기
export const getCurrentSouvenirs = (category: string) => {
  if (!category) {
    return defaultSouvenirs;
  }
  return getSouvenirsByCategory(category);
};

// 참가금액 계산
export const getParticipationFee = (category: string, souvenir: string, isGroup: boolean = false): number => {
  const currentSouvenirs = getCurrentSouvenirs(category);
  const selectedSouvenir = currentSouvenirs.find(s => s.value === souvenir);
  return selectedSouvenir ? selectedSouvenir.price : 0;
};

// 총 참가비 계산 (추후 추가 비용이 있을 경우)
export const getTotalFee = (category: string, souvenir: string, isGroup: boolean = false): number => {
  return getParticipationFee(category, souvenir, isGroup);
};
