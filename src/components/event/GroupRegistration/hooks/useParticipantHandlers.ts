import { useCallback } from 'react';
import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { createInitialParticipant } from "../utils/participantHelpers";

interface UseParticipantHandlersProps {
  participants: ParticipantData[];
  onParticipantsChange: (participants: ParticipantData[]) => void;
  isEditMode?: boolean;
}

export const useParticipantHandlers = ({
  participants,
  onParticipantsChange,
  isEditMode = false
}: UseParticipantHandlersProps) => {
  const handleParticipantChange = useCallback((index: number, field: keyof ParticipantData, value: string | boolean | undefined) => {
    // 참가 대표자 체크박스 처리 (참가 대표자는 한 명만 가능)
    if (field === 'isLeader') {
      // 수정 모드에서는 참가 대표자 변경 불가 (체크박스 자체가 비활성화됨)
      if (isEditMode) {
        return;
      }
      
      if (value === true) {
        // 참가 대표자 체크: 현재 참가자를 참가 대표자로, 다른 참가자는 모두 해제
        const updatedParticipants = participants.map((p, idx) => ({
          ...p,
          isLeader: idx === index ? true : false
        }));
        onParticipantsChange(updatedParticipants);
        return;
      } else {
        // 참가 대표자 해제: 현재 참가자의 참가 대표자만 해제
        const updatedParticipants = participants.map((p, idx) => ({
          ...p,
          isLeader: idx === index ? false : p.isLeader
        }));
        onParticipantsChange(updatedParticipants);
        return;
      }
    }

    const newParticipants = participants.map((participant, i) => {
      if (i === index) {
        // 참가종목이 변경되면 기념품 관련 필드들 초기화
        if (field === 'category') {
          return {
            ...participant,
            [field]: value as string,
            souvenir: '선택',
            size: '사이즈',
            selectedSouvenirs: []
          };
        }
        
        return { ...participant, [field]: value };
      }
      return participant;
    });
    
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange]);

  const handleParticipantCountChange = useCallback((newCount: number) => {
    // 수정 모드에서는 참가자 추가/삭제 불가
    if (isEditMode) {
      return;
    }
    
    const currentCount = participants.length;
    
    if (newCount > currentCount) {
      // 참가자 추가
      const newParticipants = [...participants];
      for (let i = currentCount; i < newCount; i++) {
        newParticipants.push(createInitialParticipant());
      }
      onParticipantsChange(newParticipants);
    } else if (newCount < currentCount) {
      // 참가자 제거
      const newParticipants = participants.slice(0, newCount);
      onParticipantsChange(newParticipants);
    }
  }, [participants, onParticipantsChange, isEditMode]);

  const handleDeleteParticipant = useCallback((index: number) => {
    // 수정 모드에서는 기존 참가자(registrationId가 있는 참가자)는 삭제 불가
    const participant = participants[index];
    if (isEditMode && participant.registrationId) {
      return;
    }
    
    // 신청 모드에서는 결제완료된 참가자는 삭제할 수 없음
    if (!isEditMode && participant.paymentStatus === 'PAID') {
      return;
    }
    
    const newParticipants = participants.filter((_, i) => i !== index);
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange, isEditMode]);

  // 수정 모드에서 새 참가자 추가 (기존 참가자는 건드리지 않음)
  const handleAddNewParticipant = useCallback(() => {
    if (!isEditMode) {
      return;
    }
    
    const newParticipant = createInitialParticipant();
    const newParticipants = [...participants, newParticipant];
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange, isEditMode]);

  // 수정 모드에서 새 참가자만 삭제 (registrationId가 없는 참가자만)
  const handleDeleteNewParticipant = useCallback((index: number) => {
    if (!isEditMode) {
      return;
    }
    
    const participant = participants[index];
    // 기존 참가자(registrationId가 있는 참가자)는 삭제 불가
    if (participant.registrationId) {
      return;
    }
    
    const newParticipants = participants.filter((_, i) => i !== index);
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange, isEditMode]);

  return {
    handleParticipantChange,
    handleParticipantCountChange,
    handleDeleteParticipant,
    handleAddNewParticipant,
    handleDeleteNewParticipant
  };
};

