// 개인신청 폼 관련 커스텀 훅
import { useState, useEffect, useRef } from 'react';
import { IndividualFormData, IdCheckResult, OpenDropdown } from '../types/individual';
import { initialIndividualFormData } from '../types/individual-constants';
import { isFormValid } from '../utils/validation';
import { handleInputChange, handleIdCheck, handleAddressSelect } from '../utils/handlers';
import { transformFormDataToApi, transformFormDataToUpdateApi } from '../utils/transformers';
import { submitIndividualRegistration, updateIndividualRegistration, UserData } from '../api/individual';
import { EventRegistrationInfo } from '../types/common';
import { useRouter } from 'next/navigation';

export const useIndividualForm = (eventId: string, eventInfo: EventRegistrationInfo | null) => {
  const router = useRouter();
  const [formData, setFormData] = useState<IndividualFormData>({
    ...initialIndividualFormData,
    paymentMethod: "ACCOUNT_TRANSFER"
  });
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [idCheckResult, setIdCheckResult] = useState<IdCheckResult>('none');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isIdPasswordModalOpen, setIsIdPasswordModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Refs for dropdowns
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const phone1Ref = useRef<HTMLDivElement>(null);
  const emailDomainRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  // const souvenirRef = useRef<HTMLDivElement>(null); // 기념품 선택 모달로 변경
  // const sizeRef = useRef<HTMLDivElement>(null); // 기념품 선택 모달로 변경
  const paymentMethodRef = useRef<HTMLDivElement>(null);

  // URL 파라미터 확인하여 수정 모드 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const dataParam = urlParams.get('data');
      const registrationIdParam = urlParams.get('registrationId');
      
      // 수정 모드: sessionStorage 또는 URL 파라미터를 통해 기존 신청 데이터 복원
      if (mode === 'edit') {
        let editData: any = null;
        
        // sessionStorage에서 먼저 확인 (새로운 방식)
        if (registrationIdParam) {
        try {
            const storageKey = `individual_edit_data_${eventId}_${decodeURIComponent(registrationIdParam)}`;
            const storedDataString = sessionStorage.getItem(storageKey);
            if (storedDataString) {
              editData = JSON.parse(storedDataString);
              // handleSubmit에서 사용한 후 삭제하므로 여기서는 삭제하지 않음
            }
          } catch (e) {
            // sessionStorage 접근 실패 시 무시
          }
        }
        
        // sessionStorage에 없으면 URL 파라미터에서 확인 (하위 호환성)
        if (!editData && dataParam) {
          try {
            editData = JSON.parse(decodeURIComponent(dataParam as string));
          } catch (e) {
            // 파싱 실패 시 무시
          }
        }
        
        if (editData) {
          try {
          // 전화번호 분리 (010-1234-5678 -> 010, 1234, 5678)
          const phoneParts = editData.phNum?.split('-') || ['010', '', ''];
          
          // 이메일 분리 (임시 이메일 값 필터링)
          const email = editData.email || '';
          const isTempEmail = !email || email.trim() === '' || email.includes('TEMP_EMAIL') || email.includes('NOT_TRUE_VALUE');
          const emailParts = isTempEmail ? ['', ''] : (email.split('@') || ['', '']);
          
          // 생년월일 분리 (2025-01-01 -> 2025, 01, 01)
          const birthParts = editData.birth?.split('-') || ['', '', ''];
          
          // 기념품 정보 처리 (첫 번째 기념품 사용)
          const firstSouvenir = editData.souvenir?.[0];
          
          // 기념품이 없거나 빈 값일 때 기본값 설정
          const souvenirId = firstSouvenir?.souvenirId || '';
          const souvenirSize = firstSouvenir?.souvenirSize || '';
          
          // 기념품이 선택되어 있지 않으면 "기념품 없음"과 "사이즈 없음"으로 설정
          const finalSouvenirId = souvenirId || '0'; // API에서 "기념품 없음"의 ID는 "0"
          const finalSouvenirSize = souvenirSize || '사이즈 없음';
          
          // 주소 정보 처리 - 첫 번째 쉼표를 기준으로 분리
          const fullAddress = editData.address || '';
          const addressDetail = editData.addressDetail || '';
          const zipCode = editData.zipCode || '';
          
          // 주소에서 우편번호 제거 함수
          const cleanAddress = (address: string, zipCodeToRemove?: string) => {
            if (!address) return '';
            let cleaned = address;
            
            // zipCode가 있으면 주소 끝에서 해당 우편번호 패턴 제거
            if (zipCodeToRemove) {
              // 다양한 패턴: "_06794", " (06794)", "-06794", "06794"
              const patterns = [
                new RegExp(`[\\s_\\-]${zipCodeToRemove.replace(/\d/g, '\\d')}$`), // 끝에 오는 우편번호 패턴
                new RegExp(`${zipCodeToRemove.replace(/\d/g, '\\d')}$`), // 그냥 끝에 우편번호
              ];
              
              for (const pattern of patterns) {
                cleaned = cleaned.replace(pattern, '').trim();
              }
            }
            
            // 일반적인 우편번호 패턴도 제거 (끝에 5자리 숫자)
            cleaned = cleaned.replace(/[_\-\s]?\d{5}$/, '').trim();
            
            return cleaned;
          };
          
          let baseAddress = cleanAddress(fullAddress, zipCode);
          let detailedAddress = addressDetail;
          
          // 상세주소가 없고 전체 주소에 쉼표가 있는 경우 첫 번째 쉼표 기준으로 분리
          if (!addressDetail && baseAddress && baseAddress.includes(',')) {
            const firstCommaIndex = baseAddress.indexOf(',');
            detailedAddress = baseAddress.substring(firstCommaIndex + 1).trim();
            baseAddress = baseAddress.substring(0, firstCommaIndex).trim();
          }
          
          setFormData(prev => ({
            ...prev,
            name: editData.name || '',
            birthYear: birthParts[0] || '',
            birthMonth: birthParts[1] || '',
            birthDay: birthParts[2] || '',
            gender: editData.gender === 'M' ? 'male' : 'female',
            jeonmahyupId: editData.personalAccount || '',
            postalCode: editData.zipCode || '',
            address: baseAddress,
            detailedAddress: detailedAddress,
            extraAddress: '',
            phone1: phoneParts[0] || '010',
            phone2: phoneParts[1] || '',
            phone3: phoneParts[2] || '',
            email1: emailParts[0] || '',
            emailDomain: emailParts[1] || '',
            category: editData.eventCategoryName || '',
            souvenir: finalSouvenirId,
            size: finalSouvenirSize,
            // 수정 모드에서 기존 기념품들을 selectedSouvenirs 배열로 변환
            selectedSouvenirs: (() => {
              const result = editData.souvenir && editData.souvenir.length > 0 ? editData.souvenir.map((item: any) => {
                // 이벤트 정보에서 실제 기념품 이름 찾기
                let souvenirName = item.souvenirName || '기념품';
                if (eventInfo && editData.eventCategoryName) {
                  const category = eventInfo.categorySouvenirList.find(c => c.categoryName === editData.eventCategoryName);
                  if (category) {
                    const souvenir = category.categorySouvenirPair.find(s => s.souvenirId === item.souvenirId);
                    if (souvenir) {
                      souvenirName = souvenir.souvenirName;
                    }
                  }
                }
                return {
                  souvenirId: item.souvenirId || finalSouvenirId,
                  souvenirName: souvenirName,
                  size: item.souvenirSize || finalSouvenirSize
                };
              }) : (finalSouvenirId ? [{
                souvenirId: finalSouvenirId,
                souvenirName: '기념품',
                size: finalSouvenirSize
              }] : []);
              
              return result;
            })(),
            paymentMethod: editData.paymentType === 'ACCOUNT_TRANSFER' ? 'bank_transfer' : 'card',
            depositorName: editData.paymenterName || '',
            note: editData.note || ''
          }));
        } catch (_error) {
          // 수정 데이터 파싱 오류 무시
        }
        }
      }
    }
  }, [eventInfo]);

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
        // souvenirRef.current && !souvenirRef.current.contains(event.target as Node) && // 기념품 선택 모달로 변경
        // sizeRef.current && !sizeRef.current.contains(event.target as Node) && // 기념품 선택 모달로 변경
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
        
        // 수정 모드인지 확인
        const isEditMode = typeof window !== 'undefined' && 
          new URLSearchParams(window.location.search).get('mode') === 'edit';
        
        // API 스키마에 맞는 데이터로 변환 (수정 모드에서는 souvenir 필드 제거)
        const apiData = isEditMode ? 
          transformFormDataToUpdateApi(formData, eventInfo) : 
          transformFormDataToApi(formData, eventInfo);
        
        let _result;
        if (isEditMode) {
          // 수정 모드: PATCH API 호출
          // sessionStorage 또는 URL 파라미터에서 registrationId 가져오기
          let registrationId: string | null = null;
          
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const registrationIdParam = urlParams.get('registrationId');
            const dataParam = urlParams.get('data');
            
            // sessionStorage에서 먼저 확인 (새로운 방식)
            if (registrationIdParam) {
              try {
                const storageKey = `individual_edit_data_${eventId}_${decodeURIComponent(registrationIdParam)}`;
                const storedDataString = sessionStorage.getItem(storageKey);
                if (storedDataString) {
                  const editData = JSON.parse(storedDataString);
                  registrationId = editData.registrationId;
                  // API 호출 성공 후 sessionStorage 삭제
                  try {
                    sessionStorage.removeItem(storageKey);
                  } catch (e) {
                    // 무시
                  }
                }
              } catch (e) {
                // sessionStorage 접근 실패 시 무시
              }
            }
            
            // sessionStorage에 없으면 URL 파라미터에서 확인 (하위 호환성)
            if (!registrationId && dataParam) {
              try {
            const editData = JSON.parse(decodeURIComponent(dataParam));
                registrationId = editData.registrationId;
              } catch (e) {
                // 파싱 실패 시 무시
              }
            }
          }
          
          if (registrationId) {
            _result = await updateIndividualRegistration(eventId, registrationId, apiData);
          } else {
            throw new Error('수정할 신청 정보를 찾을 수 없습니다.');
          }
        } else {
          // 신규 신청 모드: POST API 호출
          _result = await submitIndividualRegistration(eventId, apiData);
        }
        
        // 성공 시 오류 메시지 초기화
        setSubmitError('');
        
        // 성공 페이지로 이동
        const modeParam = isEditMode ? '&mode=edit' : '';
        router.push(`/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(formData.name)}${modeParam}`);
      } catch (error) {
        // 수정 모드인지 다시 확인 (catch 블록에서 사용)
        const isEditMode = typeof window !== 'undefined' && 
          new URLSearchParams(window.location.search).get('mode') === 'edit';
          
        // NOT_FOUND_SOUVENIR 오류인 경우 이벤트 정보를 다시 조회하고 재시도
        if (error instanceof Error && error.message.includes('NOT_FOUND_SOUVENIR')) {
          try {
            // 이벤트 정보 다시 조회
            const { fetchEventRegistrationInfo } = await import('../api/event');
            const freshEventInfo = await fetchEventRegistrationInfo(eventId);
            
            // 새로운 이벤트 정보로 다시 변환
            const freshApiData = transformFormDataToApi(formData, freshEventInfo);
            
            // 재시도
            if (isEditMode) {
              // sessionStorage 또는 URL 파라미터에서 registrationId 가져오기
              let registrationId: string | null = null;
              
              if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const registrationIdParam = urlParams.get('registrationId');
                const dataParam = urlParams.get('data');
                
                // sessionStorage에서 먼저 확인
                if (registrationIdParam) {
                  try {
                    const storageKey = `individual_edit_data_${eventId}_${decodeURIComponent(registrationIdParam)}`;
                    const storedDataString = sessionStorage.getItem(storageKey);
                    if (storedDataString) {
                      const editData = JSON.parse(storedDataString);
                      registrationId = editData.registrationId;
                    }
                  } catch (e) {
                    // 무시
                  }
                }
                
                // sessionStorage에 없으면 URL 파라미터에서 확인
                if (!registrationId && dataParam) {
                  try {
                const editData = JSON.parse(decodeURIComponent(dataParam));
                    registrationId = editData.registrationId;
                  } catch (e) {
                    // 무시
                  }
                }
              }
              
              if (registrationId) {
                await updateIndividualRegistration(eventId, registrationId, freshApiData);
              }
            } else {
              await submitIndividualRegistration(eventId, freshApiData);
            }
            
            // 성공 페이지로 이동
            const modeParam = isEditMode ? '&mode=edit' : '';
            router.push(`/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(formData.name)}${modeParam}`);
            return;
          } catch (_retryError) {
            alert('선택한 기념품을 찾을 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
          }
        } else {
          // 다른 오류들에 대한 처리
          let errorMessage = '신청 처리 중 오류가 발생했습니다.';
          
          if (error instanceof Error) {
            // 에러 메시지에서 상태 코드와 상세 내용 파싱
            const errorMsg = error.message.toLowerCase();
            
            if (errorMsg.includes('404')) {
              errorMessage = '요청한 정보를 찾을 수 없습니다. 이벤트 정보를 다시 확인해주세요.';
            } else if (errorMsg.includes('500')) {
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (errorMsg.includes('409') || errorMsg.includes('400')) {
              // DB상 이름/생일/전화번호 동시 중복인 경우 무조건 핸드폰 번호 오류 메시지 표시
              errorMessage = '동일 핸드폰 번호로 신청내역이 이미 있습니다.';
            } else {
              // 기타 오류의 경우 기본 메시지 표시
              errorMessage = '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }
          }
          
          // alert 대신 상태로 오류 메시지 저장
          setSubmitError(errorMessage);
        }
      } finally {
        setIsSubmitted(false);
      }
    }
  };

  // 사용자 정보 자동 입력 처리
  const handleUserDataLoad = (userData: UserData) => {
    // 생년월일 분리 (YYYY-MM-DD -> YYYY, MM, DD)
    const birthParts = userData.birth?.split('-') || ['', '', ''];
    
    // 전화번호 분리 (010-1234-5678 -> 010, 1234, 5678)
    const phoneParts = userData.phNum?.split('-') || ['010', '', ''];
    
    // 이메일 분리 (임시 이메일 값 필터링)
    const email = userData.email || '';
    const isTempEmail = !email || email.trim() === '' || email.includes('TEMP_EMAIL') || email.includes('NOT_TRUE_VALUE');
    const emailParts = isTempEmail ? ['', ''] : (email.split('@') || ['', '']);
    
    // 주소 정보 처리
    const fullAddress = userData.address?.roadAddress || '';
    const addressDetail = userData.address?.addressDetail || '';
    
    setFormData(prev => ({
      ...prev,
      name: userData.name || '',
      birthYear: birthParts[0] || '',
      birthMonth: birthParts[1] || '',
      birthDay: birthParts[2] || '',
      gender: userData.gender === '남자' ? 'male' : 'female',
      postalCode: userData.address?.zipCode || '',
      address: fullAddress,
      detailedAddress: addressDetail,
      phone1: phoneParts[0] || '010',
      phone2: phoneParts[1] || '',
      phone3: phoneParts[2] || '',
      email1: emailParts[0] || '',
      emailDomain: emailParts[1] || '',
      depositorName: userData.name || '' // 입금자명을 사용자 이름으로 설정
    }));
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
      // souvenirRef, // 기념품 선택 모달로 변경
      // sizeRef, // 기념품 선택 모달로 변경
      paymentMethodRef
    },
    handlers: {
      handleInputChange: (field: keyof IndividualFormData, value: string | Array<{souvenirId: string, souvenirName: string, size: string}>) => 
        handleInputChange(setFormData, field, value),
      handleIdCheck: () => handleIdCheck(formData.jeonmahyupId, setIdCheckResult),
      handleAddressSelect: (postalCode: string, address: string) => 
        handleAddressSelect(setFormData, postalCode, address),
      handleSubmit
    },
    modal: {
      isIdPasswordModalOpen,
      setIsIdPasswordModalOpen,
      handleUserDataLoad
    },
    error: {
      submitError,
      clearSubmitError: () => setSubmitError('')
    }
  };
};
