// 개인신청 폼 관련 커스텀 훅
import { useState, useEffect, useRef } from 'react';
import { IndividualFormData, IdCheckResult, OpenDropdown } from '../types/individual';
import { initialIndividualFormData } from '../types/individual-constants';
import { isFormValid } from '../utils/validation';
import { handleInputChange, handleIdCheck, handleAddressSelect } from '../utils/handlers';
import { transformFormDataToApi } from '../utils/transformers';
import { submitIndividualRegistration } from '../api/individual';
import { useRouter } from 'next/navigation';

export const useIndividualForm = (eventId: string, eventInfo: any) => {
  const router = useRouter();
  const [formData, setFormData] = useState<IndividualFormData>({
    ...initialIndividualFormData,
    paymentMethod: "ACCOUNT_TRANSFER"
  });
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [idCheckResult, setIdCheckResult] = useState<IdCheckResult>('none');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for dropdowns
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const phone1Ref = useRef<HTMLDivElement>(null);
  const emailDomainRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const souvenirRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);

  // URL 파라미터 확인하여 수정 모드 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const dataParam = urlParams.get('data');
      
      if (mode === 'edit' && dataParam) {
        try {
          const editData = JSON.parse(decodeURIComponent(dataParam));
          
          // 전화번호 분리 (010-1234-5678 -> 010, 1234, 5678)
          const phoneParts = editData.phNum?.split('-') || ['010', '', ''];
          
          // 이메일 분리
          const emailParts = editData.email?.split('@') || ['', ''];
          
          // 생년월일 분리 (2025-01-01 -> 2025, 01, 01)
          const birthParts = editData.birth?.split('-') || ['', '', ''];
          
          // 기념품 정보 처리 (첫 번째 기념품 사용)
          const firstSouvenir = editData.souvenir?.[0];
          
          setFormData(prev => ({
            ...prev,
            name: editData.name || '',
            birthYear: birthParts[0] || '',
            birthMonth: birthParts[1] || '',
            birthDay: birthParts[2] || '',
            gender: editData.gender === 'M' ? 'male' : 'female',
            jeonmahyupId: editData.personalAccount || '',
            postalCode: editData.zipCode || '',
            address: editData.address || '',
            detailedAddress: '', // API 응답에 상세주소가 없으므로 빈 문자열
            extraAddress: '',
            phone1: phoneParts[0] || '010',
            phone2: phoneParts[1] || '',
            phone3: phoneParts[2] || '',
            email1: emailParts[0] || '',
            emailDomain: emailParts[1] || '',
            category: editData.eventCategoryName || '',
            souvenir: firstSouvenir?.souvenirId || '',
            size: firstSouvenir?.souvenirSize || '',
            paymentMethod: editData.paymentType === 'ACCOUNT_TRANSFER' ? 'bank_transfer' : 'card',
            depositorName: editData.paymenterName || ''
          }));
        } catch (error) {
          // 수정 데이터 파싱 오류 무시
        }
      }
    }
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        yearRef.current && !yearRef.current.contains(event.target as Node) &&
        monthRef.current && !monthRef.current.contains(event.target as Node) &&
        dayRef.current && !dayRef.current.contains(event.target as Node) &&
        phone1Ref.current && !phone1Ref.current.contains(event.target as Node) &&
        emailDomainRef.current && !emailDomainRef.current.contains(event.target as Node) &&
        categoryRef.current && !categoryRef.current.contains(event.target as Node) &&
        souvenirRef.current && !souvenirRef.current.contains(event.target as Node) &&
        sizeRef.current && !sizeRef.current.contains(event.target as Node) &&
        paymentMethodRef.current && !paymentMethodRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormValid(formData)) {
      try {
        setIsSubmitted(true);
        
        // API 스키마에 맞는 데이터로 변환
        const apiData = transformFormDataToApi(formData, eventInfo);
        
        // 실제 API 호출
        const result = await submitIndividualRegistration(eventId, apiData);
        
        // 성공 페이지로 이동
        const isEditMode = typeof window !== 'undefined' && 
          new URLSearchParams(window.location.search).get('mode') === 'edit';
        const modeParam = isEditMode ? '&mode=edit' : '';
        router.push(`/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(formData.name)}${modeParam}`);
      } catch (error) {
        // NOT_FOUND_SOUVENIR 오류인 경우 이벤트 정보를 다시 조회하고 재시도
        if (error instanceof Error && error.message.includes('NOT_FOUND_SOUVENIR')) {
          try {
            // 이벤트 정보 다시 조회
            const { fetchEventRegistrationInfo } = await import('../api/event');
            const freshEventInfo = await fetchEventRegistrationInfo(eventId);
            
            // 새로운 이벤트 정보로 다시 변환
            const freshApiData = transformFormDataToApi(formData, freshEventInfo);
            
            // 재시도
            const result = await submitIndividualRegistration(eventId, freshApiData);
            
            // 성공 페이지로 이동
            const isEditMode = typeof window !== 'undefined' && 
              new URLSearchParams(window.location.search).get('mode') === 'edit';
            const modeParam = isEditMode ? '&mode=edit' : '';
            router.push(`/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(formData.name)}${modeParam}`);
            return;
          } catch (retryError) {
            alert('선택한 기념품을 찾을 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
          }
        } else {
          // 다른 오류들에 대한 처리
          let errorMessage = '신청 처리 중 오류가 발생했습니다.';
          
          if (error instanceof Error) {
            if (error.message.includes('404')) {
              errorMessage = '요청한 정보를 찾을 수 없습니다. 이벤트 정보를 다시 확인해주세요.';
            } else if (error.message.includes('500')) {
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }
          }
          
          alert(errorMessage);
        }
      } finally {
        setIsSubmitted(false);
      }
    }
  };

  return {
    formData,
    setFormData,
    openDropdown,
    setOpenDropdown,
    idCheckResult,
    setIdCheckResult,
    isSubmitted,
    isFormValid: isFormValid(formData),
    refs: {
      yearRef,
      monthRef,
      dayRef,
      phone1Ref,
      emailDomainRef,
      categoryRef,
      souvenirRef,
      sizeRef,
      paymentMethodRef
    },
    handlers: {
      handleInputChange: (field: keyof IndividualFormData, value: string) => 
        handleInputChange(setFormData, field, value),
      handleIdCheck: () => handleIdCheck(formData.jeonmahyupId, setIdCheckResult),
      handleAddressSelect: (postalCode: string, address: string) => 
        handleAddressSelect(setFormData, postalCode, address),
      handleSubmit
    }
  };
};
