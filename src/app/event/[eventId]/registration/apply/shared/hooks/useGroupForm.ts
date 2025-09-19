// 단체신청 폼 관련 커스텀 훅
import { useState, useEffect, useCallback, useRef } from 'react';
import { GroupFormData, ParticipantData } from '../types/group';
import { initialGroupFormData, createInitialParticipant } from '../types/group-constants';
import { isFormValid } from '../utils/validation';
import { handleGroupInputChange, handleParticipantChange, handleGroupAddressSelect, handleGroupNameCheck, handleGroupIdCheck } from '../utils/handlers';
import { transformGroupFormDataToApi } from '../utils/transformers';
import { submitGroupRegistration } from '../api/group';
import { useRouter } from 'next/navigation';

export const useGroupForm = (eventId: string, eventInfo: any) => {
  const router = useRouter();
  const [formData, setFormData] = useState<GroupFormData>({
    ...initialGroupFormData,
    paymentMethod: "bank_transfer"
  });
  const [isGroupNameChecked, setIsGroupNameChecked] = useState(false);
  const [isGroupIdChecked, setIsGroupIdChecked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'phone1' | 'emailDomain' | null>(null);
  
  // refs for dropdowns
  const phone1Ref = useRef<HTMLDivElement>(null);
  const emailDomainRef = useRef<HTMLDivElement>(null);

  // URL 파라미터 확인하여 수정 모드 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const dataParam = urlParams.get('data');
      
      if (mode === 'edit' && dataParam) {
        setIsEditMode(true);
        try {
          const editData = JSON.parse(decodeURIComponent(dataParam));
          
          // 전화번호 분리 (010-1234-5678 -> 010, 1234, 5678)
          const phoneParts = editData.phone?.split('-') || ['010', '', ''];
          
          // 이메일 분리
          const emailParts = editData.email?.split('@') || ['', ''];
          
          const updatedFormData = {
            ...formData,
            groupName: editData.groupName || '',
            groupId: editData.groupId || '',
            representativeBirthDate: editData.representativeBirthDate || '',
            leaderName: editData.leaderName || '',
            postalCode: editData.postalCode || '',
            address: editData.address || '',
            detailedAddress: editData.detailedAddress || '',
            extraAddress: editData.extraAddress || '',
            phone1: phoneParts[0] || '010',
            phone2: phoneParts[1] || '',
            phone3: phoneParts[2] || '',
            email1: emailParts[0] || '',
            email2: '',
            emailDomain: emailParts[1] || 'naver.com',
            participants: editData.participants || [createInitialParticipant()],
            paymentMethod: 'ACCOUNT_TRANSFER',
            depositorName: editData.depositorName || ''
          };
          
          setFormData(updatedFormData);
        } catch (error) {
          // 수정 데이터 파싱 오류 무시
        }
      }
    }
  }, []);

  // 참가자 정보 변경 함수
  const handleParticipantChangeCallback = useCallback((index: number, field: keyof ParticipantData, value: string) => {
    handleParticipantChange(setFormData, index, field, value);
  }, []);

  // 참가자 추가 함수
  const handleAddParticipant = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, createInitialParticipant()]
    }));
  }, []);

  // 참가자 제거 함수
  const handleRemoveParticipant = useCallback((index: number) => {
    if (formData.participants.length > 1) {
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index)
      }));
    }
  }, [formData.participants.length]);

  // 참가자 전체 변경 함수 (ParticipantsSection용)
  const handleParticipantsChange = useCallback((newParticipants: ParticipantData[]) => {
    setFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  }, []);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormValid(formData)) {
      setIsLoading(true);
      
      try {
        // API 요청 데이터 구조 생성
        const requestData = transformGroupFormDataToApi(formData, eventInfo);
        
        // API 호출
        const response = await submitGroupRegistration(eventId, requestData);
        
        // 성공 페이지로 이동
        const successUrl = `/event/${eventId}/registration/apply/group/success?name=${encodeURIComponent(formData.groupName)}&groupName=${encodeURIComponent(formData.groupName)}&participantCount=${formData.participants.length}`;
        router.push(successUrl);
      } catch (error) {
        alert('단체신청 제출에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('필수 필드를 모두 입력해주세요.');
    }
  };

  return {
    formData,
    setFormData,
    isGroupNameChecked,
    setIsGroupNameChecked,
    isGroupIdChecked,
    setIsGroupIdChecked,
    isEditMode,
    isLoading,
    isFormValid: isFormValid(formData),
    openDropdown,
    setOpenDropdown,
    refs: {
      phone1Ref,
      emailDomainRef
    },
    handlers: {
      handleInputChange: (field: keyof GroupFormData, value: string) => 
        handleGroupInputChange(setFormData, field, value),
      handleParticipantChange: handleParticipantChangeCallback,
      handleParticipantsChange,
      handleAddParticipant,
      handleRemoveParticipant,
      handleAddressSelect: (postalCode: string, address: string) => 
        handleGroupAddressSelect(setFormData, postalCode, address),
      handleGroupNameCheck: () => handleGroupNameCheck(formData.groupName),
      handleGroupIdCheck: () => handleGroupIdCheck(formData.groupId),
      handleSubmit
    }
  };
};
