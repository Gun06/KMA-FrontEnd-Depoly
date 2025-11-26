import { Dispatch, SetStateAction } from "react";
import { GroupFormData } from "../data";

// 입력 필드 변경 핸들러
export const handleInputChange = (
  setFormData: Dispatch<SetStateAction<GroupFormData>>,
  field: keyof GroupFormData,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// 아이디 확인 핸들러
export const handleIdCheck = (
  jeonmahyupId: string,
  setIdCheckResult: Dispatch<SetStateAction<'none' | 'exists' | 'not_exists'>>
) => {
  // 실제로는 API 호출을 통해 아이디 존재 여부를 확인해야 함
  if (jeonmahyupId.trim() === '') {
    alert('전마협 아이디를 입력해주세요.');
    return;
  }
  
  // 임시로 랜덤하게 결과 생성 (실제 구현 시 제거)
  const random = Math.random();
  if (random > 0.5) {
    setIdCheckResult('exists');
  } else {
    setIdCheckResult('not_exists');
  }
};

// 주소 선택 핸들러
export const handleAddressSelect = (
  setFormData: Dispatch<SetStateAction<GroupFormData>>,
  postalCode: string,
  address: string
) => {
  setFormData(prev => ({
    ...prev,
    postalCode,
    address
  }));
};

// 폼 제출 핸들러
export const handleFormSubmit = (formData: GroupFormData) => {
  // 여기서 실제 API 호출을 통해 서버로 데이터 전송
};
