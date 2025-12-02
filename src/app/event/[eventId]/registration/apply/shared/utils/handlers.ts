// 공통 핸들러 함수들
import { Dispatch, SetStateAction } from "react";
import { IndividualFormData } from "../types/individual";
import { GroupFormData as GroupFormDataType } from "../types/group";

// 개인신청 핸들러들
export const handleInputChange = (
  setFormData: Dispatch<SetStateAction<IndividualFormData>>,
  field: keyof IndividualFormData,
  value: string | Array<{souvenirId: string, souvenirName: string, size: string}>
) => {
  setFormData(prev => {
    // 카테고리가 변경되면 기념품 관련 필드들 초기화
    if (field === 'category') {
      // category는 string 타입이므로 value가 string인지 확인
      if (typeof value === 'string') {
        return {
          ...prev,
          [field]: value,
          souvenir: '',
          size: '',
          selectedSouvenirs: []
        };
      }
      // category에 Array가 전달되면 무시
      return prev;
    }
    
    // 다른 필드들은 타입에 맞게 처리
    return {
      ...prev,
      [field]: value
    };
  });
};

export const handleIdCheck = async (
  jeonmahyupId: string,
  setIdCheckResult: Dispatch<SetStateAction<'none' | 'exists' | 'not_exists'>>
) => {
  if (!jeonmahyupId.trim()) {
    setIdCheckResult('none');
    return;
  }

  try {
    // TODO: 실제 API 호출로 변경
    // const response = await checkIdExists(jeonmahyupId);
    // setIdCheckResult(response.exists ? 'exists' : 'not_exists');
    
    // 임시로 랜덤 결과 반환
    const exists = Math.random() > 0.5;
    setIdCheckResult(exists ? 'exists' : 'not_exists');
  } catch (error) {
    setIdCheckResult('none');
  }
};

export const handleAddressSelect = (
  setFormData: Dispatch<SetStateAction<IndividualFormData>>,
  postalCode: string,
  address: string
) => {
  setFormData(prev => ({
    ...prev,
    postalCode,
    address
  }));
};

// 단체신청 핸들러들
export const handleGroupInputChange = (
  setFormData: Dispatch<SetStateAction<GroupFormDataType>>,
  field: keyof GroupFormDataType,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

export const handleParticipantChange = (
  setFormData: Dispatch<SetStateAction<GroupFormDataType>>,
  index: number,
  field: keyof GroupFormDataType['participants'][0],
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    participants: prev.participants.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    )
  }));
};

export const handleGroupAddressSelect = (
  setFormData: Dispatch<SetStateAction<GroupFormDataType>>,
  postalCode: string,
  address: string
) => {
  setFormData(prev => ({
    ...prev,
    postalCode,
    address
  }));
};

export const handleGroupNameCheck = async (
  eventId: string, 
  groupName: string,
  setNameCheckResult: Dispatch<SetStateAction<'none' | 'available' | 'unavailable' | 'error'>>,
  originalGroupName?: string // 수정 모드에서 원래 단체명
) => {
  if (!groupName.trim()) {
    setNameCheckResult('none');
    return false;
  }

  // 수정 모드이고 원래 값과 동일하면 사용 가능
  if (originalGroupName && groupName.trim() === originalGroupName.trim()) {
    setNameCheckResult('available');
    return true;
  }

  setNameCheckResult('none'); // 로딩 상태 초기화

  try {
    const { checkGroupName } = await import('../api/group');
    const isDuplicate = await checkGroupName(eventId, groupName);
    
    if (isDuplicate) {
      setNameCheckResult('unavailable');
      return false;
    } else {
      setNameCheckResult('available');
      return true;
    }
  } catch (error) {
    setNameCheckResult('error');
    return false;
  }
};

export const handleGroupIdCheck = async (
  eventId: string, 
  groupId: string,
  setIdCheckResult: Dispatch<SetStateAction<'none' | 'available' | 'unavailable' | 'error'>>
) => {
  if (!groupId.trim()) {
    setIdCheckResult('none');
    return false;
  }

  // 길이 체크 (5-20자)
  if (groupId.length < 5 || groupId.length > 20) {
    setIdCheckResult('error');
    return false;
  }

  // 한글 포함 여부 체크
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(groupId)) {
    setIdCheckResult('error');
    return false;
  }

  setIdCheckResult('none'); // 로딩 상태 초기화

  try {
    const { checkGroupId } = await import('../api/group');
    const isDuplicate = await checkGroupId(eventId, groupId);
    
    if (isDuplicate) {
      setIdCheckResult('unavailable');
      return false;
    } else {
      setIdCheckResult('available');
      return true;
    }
  } catch (error) {
    setIdCheckResult('error');
    return false;
  }
};
