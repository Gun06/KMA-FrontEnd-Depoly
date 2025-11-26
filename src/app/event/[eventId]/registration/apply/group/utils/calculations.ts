import { GroupFormData, getParticipationFee } from "../data";

// 총 참가비 계산 (단체 신청의 경우)
export const getTotalFee = (formData: GroupFormData) => {
  // 모든 참가자의 참가비를 합산
  const totalFee = formData.participants.reduce((total, participant) => {
    const individualFee = getParticipationFee(participant.category, participant.souvenir);
    return total + individualFee;
  }, 0);
  
  // 단체 할인 등이 있다면 여기서 계산
  return totalFee;
};
