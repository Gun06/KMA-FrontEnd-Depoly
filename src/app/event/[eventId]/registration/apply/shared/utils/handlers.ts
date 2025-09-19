// 공통 핸들러 함수들
import { Dispatch, SetStateAction } from "react";
import { IndividualFormData } from "../types/individual";
import { GroupFormData as GroupFormDataType } from "../types/group";

// 개인신청 핸들러들
export const handleInputChange = (
  setFormData: Dispatch<SetStateAction<IndividualFormData>>,
  field: keyof IndividualFormData,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
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

export const handleGroupNameCheck = async (groupName: string) => {
  if (!groupName.trim()) return false;

  try {
    // TODO: 실제 API 호출로 변경
    // const response = await checkGroupNameExists(groupName);
    // return !response.exists;
    
    // 임시로 랜덤 결과 반환
    return Math.random() > 0.5;
  } catch (error) {
    return false;
  }
};

export const handleGroupIdCheck = async (groupId: string) => {
  if (!groupId.trim()) return false;

  try {
    // TODO: 실제 API 호출로 변경
    // const response = await checkGroupIdExists(groupId);
    // return !response.exists;
    
    // 임시로 랜덤 결과 반환
    return Math.random() > 0.5;
  } catch (error) {
    return false;
  }
};
