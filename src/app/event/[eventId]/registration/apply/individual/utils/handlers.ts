import { Dispatch, SetStateAction } from "react";
import { IndividualFormData } from "../data";

// 입력 필드 변경 처리
export const handleInputChange = (
  setFormData: Dispatch<SetStateAction<IndividualFormData>>,
  field: keyof IndividualFormData,
  value: string
) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));

  // 참가종목이 변경되면 기념품 초기화
  if (field === 'category') {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      souvenir: ''
    }));
  }
};

// 아이디 확인 처리
export const handleIdCheck = (
  jeonmahyupId: string,
  setIdCheckResult: Dispatch<SetStateAction<'none' | 'exists' | 'not_exists'>>
) => {
  if (!jeonmahyupId.trim()) {
    alert('전마협 아이디를 입력해주세요.');
    return;
  }
  
  // 실제로는 API 호출을 통해 아이디 존재 여부를 확인해야 합니다
  // 여기서는 임시로 랜덤하게 결과를 생성합니다
  const randomResult = Math.random() > 0.5 ? 'exists' : 'not_exists';
  setIdCheckResult(randomResult);
  
  if (randomResult === 'exists') {
    alert('이미 등록된 전마협 아이디입니다.');
  } else {
    alert('등록되지 않은 전마협 아이디입니다. 추후에 회원가입을 진행하세요.');
  }
};

// 우편번호 검색 결과 처리
export const handleAddressSelect = (
  setFormData: Dispatch<SetStateAction<IndividualFormData>>,
  postalCode: string,
  address: string
) => {
  setFormData(prev => ({
    ...prev,
    postalCode: postalCode,
    address: address
  }));
};

// 폼 제출 처리
export const handleFormSubmit = (formData: IndividualFormData) => {
  // 여기에 실제 제출 로직을 구현합니다
  // API 호출 등
};
