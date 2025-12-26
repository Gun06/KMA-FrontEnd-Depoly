// 단체신청 폼 관련 커스텀 훅
import { useState, useEffect, useCallback, useRef } from 'react';
import { GroupFormData, ParticipantData } from '../types/group';
import { initialGroupFormData, createInitialParticipant } from '../types/group-constants';
import { isFormValid } from '../utils/validation';
import { handleGroupInputChange, handleParticipantChange, handleGroupAddressSelect, handleGroupNameCheck, handleGroupIdCheck } from '../utils/handlers';
import { transformGroupFormDataToApi, transformGroupFormDataToUpdateApi } from '../utils/transformers';
import { submitGroupRegistration, updateGroupRegistration } from '../api/group';
import { formatError } from '../utils/errorHandler';
import { useRouter } from 'next/navigation';

export const useGroupForm = (eventId: string, eventInfo: any) => {
  const router = useRouter();
  const [formData, setFormData] = useState<GroupFormData>({
    ...initialGroupFormData,
    paymentMethod: "bank_transfer"
  });
  const [isGroupNameChecked, setIsGroupNameChecked] = useState(false);
  const [isGroupIdChecked, setIsGroupIdChecked] = useState(false);
  const [groupNameCheckResult, setGroupNameCheckResult] = useState<'none' | 'available' | 'unavailable' | 'error'>('none');
  const [groupIdCheckResult, setGroupIdCheckResult] = useState<'none' | 'available' | 'unavailable' | 'error'>('none');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<'phone1' | 'emailDomain' | null>(null);
  const [editData, setEditData] = useState<any>(null); // 수정 모드 데이터 저장
  
  // refs for dropdowns
  const phone1Ref = useRef<HTMLDivElement>(null);
  // const emailDomainRef = useRef<HTMLDivElement>(null); // API 구조 변경으로 제거

  // URL 파라미터 확인하여 수정 모드 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const dataParam = urlParams.get('data');
      const orgAccount = urlParams.get('orgAccount');
      
      // 수정 모드: sessionStorage 또는 URL 파라미터를 통해 기존 신청 데이터 복원
      if (mode === 'edit') {
        setIsEditMode(true);
        let editData: any = null;
        
        // sessionStorage에서 먼저 확인 (새로운 방식)
        if (orgAccount) {
        try {
            const storageKey = `group_edit_data_${eventId}_${decodeURIComponent(orgAccount)}`;
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
            // editData를 state에 저장 (handleSubmit에서 사용하기 위해)
            setEditData(editData);
          
          // 전화번호 분리 (새로운 스키마의 leaderPhNum 사용)
          const phoneParts = (editData.leaderPhNum || editData.phNum || '010-0000-0000').split('-') || ['010', '', ''];
          
          // 이메일 분리 (새로운 스키마의 email 사용)
          const emailParts = (editData.email || '').split('@') || ['', ''];
          
          // 주소 처리 (쉼표(,) 기준으로 기본주소와 상세주소 분리)
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
          
          
          // 참가자 데이터 변환
          const participants = (editData.innerUserRegistrationList || []).map((participant: any, index: number) => {
            // 전화번호 분리
            const participantPhoneParts = (participant.phNum || '010-0000-0000').split('-') || ['010', '', ''];
            
            // 이메일 분리 (emailDomain이 있으면 email2에 설정) - API 구조 변경으로 제거
            // const participantEmailParts = (participant.email || '').split('@') || ['', ''];
            // const emailDomain = participantEmailParts[1] || 'naver.com';
            
            // 기념품 정보 처리 (다중 선택 복원)
            const souvenirList = Array.isArray(participant.souvenir) ? participant.souvenir : [];
            const firstSouvenir = souvenirList[0];
            const souvenirId = firstSouvenir?.souvenirId || '0';
            const souvenirSize = firstSouvenir?.souvenirSize || '사이즈 없음';
            const selectedSouvenirs = souvenirList.map((s: any) => ({
              souvenirId: String(s.souvenirId || ''),
              souvenirName: String(s.souvenirName || ''),
              size: String(s.souvenirSize || '사이즈 없음')
            }));
            
            return {
              name: participant.name || '',
              gender: participant.gender === 'M' ? 'male' : 'female',
              birthYear: participant.birth?.split('-')[0] || '',
              birthMonth: participant.birth?.split('-')[1] || '',
              birthDay: participant.birth?.split('-')[2] || '',
              phone1: participantPhoneParts[0] || '010',
              phone2: participantPhoneParts[1] || '',
              phone3: participantPhoneParts[2] || '',
              // email1: participantEmailParts[0] || '', // API 구조 변경으로 제거
              // email2: emailDomain, // emailDomain을 email2에 설정 // API 구조 변경으로 제거
              // emailDomain: emailDomain, // API 구조 변경으로 제거
              category: participant.eventCategoryName || '',
              // 하위 호환 필드(단일)
              souvenir: souvenirId,
              size: souvenirSize,
              // 다중 선택 복원 필드
              selectedSouvenirs,
              note: participant.note || '',
              // 결제 상태 및 등록 ID (수정 모드에서 사용)
              // 모든 결제 상태를 그대로 유지 (COMPLETED, MUST_CHECK, NEED_REFUND 등 모두 포함)
              paymentStatus: participant.paymentStatus || 'UNPAID',
              registrationId: participant.registrationId,
              // 참가 대표자 여부 (checkLeader 필드에서 매핑)
              isLeader: participant.checkLeader === true || participant.isLeader === true
            };
          });
          
          const updatedFormData = {
            ...formData,
            // 새로운 스키마 필드 우선, 없으면 기존 필드 사용
            groupName: editData.organizationName || editData.groupName || '',
            groupId: editData.organizationAccount || editData.groupId || '',
            groupPassword: '', // 비밀번호는 수정 시 입력받음
            representativeBirthDate: editData.leaderBirth || editData.representativeBirthDate || '',
            leaderName: editData.leaderName || '',
            postalCode: editData.zipCode || editData.postalCode || '',
            address: baseAddress,
            detailedAddress: detailedAddress,
            extraAddress: '',
            phone1: phoneParts[0] || '010',
            phone2: phoneParts[1] || '',
            phone3: phoneParts[2] || '',
            email1: emailParts[0] || '',
            emailDomain: emailParts[1] || 'naver.com',
            participants: participants.length > 0 ? participants : [createInitialParticipant()],
            // 결제방법: ACCOUNT_TRANSFER가 있으면 bank_transfer로 설정
            paymentMethod: (editData.paymentType === 'ACCOUNT_TRANSFER') ? 'bank_transfer' : 'card',
            depositorName: editData.paymenterName || editData.depositorName || ''
          };
          
          setFormData(updatedFormData);
        } catch (error) {
          // 수정 데이터 파싱 오류 무시
          }
        }
      }
    }
  }, []);

  // 참가자 정보 변경 함수
  const handleParticipantChangeCallback = useCallback((index: number, field: keyof ParticipantData, value: string) => {
    handleParticipantChange(setFormData, index, field, value);
  }, []);

  // 참가자 추가 함수 (최대 100명 제한)
  const handleAddParticipant = useCallback(() => {
    setFormData(prev => {
      if (prev.participants.length >= 100) {
        return prev;
      }
      
      return {
        ...prev,
        participants: [...prev.participants, createInitialParticipant()]
      };
    });
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

    // 참가자 수 최대 100명 제한
    if (formData.participants.length > 100) {
      setSubmitError('단체신청은 최대 100명까지만 신청 가능합니다.');
      return;
    }
    
    if (isFormValid(formData)) {
      setIsLoading(true);
      
      try {
        // 수정 모드인지 확인
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const dataParam = urlParams.get('data');
        const orgAccount = urlParams.get('orgAccount');
        const isEdit = mode === 'edit';
        
        // 수정 모드인 경우 state에서 editData 사용 (useEffect에서 이미 설정됨)
        let currentEditData = editData;
        
        // 수정 모드인데 state에 없으면 다시 시도
        if (isEdit && !currentEditData) {
          // sessionStorage에서 다시 확인
          if (orgAccount) {
            try {
              const storageKey = `group_edit_data_${eventId}_${decodeURIComponent(orgAccount)}`;
              const storedDataString = sessionStorage.getItem(storageKey);
              if (storedDataString) {
                currentEditData = JSON.parse(storedDataString);
                setEditData(currentEditData);
              }
            } catch (e) {
              // sessionStorage 접근 실패 시 무시
            }
          }
          
          // sessionStorage에 없으면 URL 파라미터에서 확인 (하위 호환성)
          if (!currentEditData && dataParam) {
            try {
              currentEditData = JSON.parse(decodeURIComponent(dataParam));
              setEditData(currentEditData);
            } catch (e) {
              // 파싱 실패 시 무시
            }
          }
        }

        let response;
        if (isEdit) {
          // 수정 모드인데 editData가 없으면 에러
          if (!currentEditData) {
            throw new Error('수정할 신청 정보를 찾을 수 없습니다. 다시 시도해주세요.');
          }
          
          // 수정 모드: PATCH API 호출
          const registrationId = currentEditData.innerUserRegistrationList?.[0]?.registrationId;
          
          if (!registrationId) {
            throw new Error('수정할 신청 정보를 찾을 수 없습니다. registrationId가 없습니다.');
          }
          
          // 수정용 API 데이터 구조 생성 (원본 데이터 전달)
          const requestData = transformGroupFormDataToUpdateApi(formData, eventInfo, currentEditData);
          response = await updateGroupRegistration(eventId, registrationId, requestData);
          
          // 성공 후 sessionStorage에서 삭제 (보안)
          if (orgAccount) {
            try {
              const storageKey = `group_edit_data_${eventId}_${decodeURIComponent(orgAccount)}`;
              sessionStorage.removeItem(storageKey);
            } catch (e) {
              // 무시
            }
          }
          if (orgAccount) {
            try {
              const storageKey = `group_edit_data_${eventId}_${decodeURIComponent(orgAccount)}`;
              sessionStorage.removeItem(storageKey);
            } catch (e) {
              // 무시
            }
          }
        } else {
          // 신규 신청 모드: POST API 호출
          const requestData = transformGroupFormDataToApi(formData, eventInfo);
          response = await submitGroupRegistration(eventId, requestData);
        }
        
        // 성공 시 오류 메시지 초기화
        setSubmitError('');
        
        // 성공 페이지로 이동
        const modeParam = isEdit ? '&mode=edit' : '';
        const successUrl = `/event/${eventId}/registration/apply/group/success?name=${encodeURIComponent(formData.groupName)}&groupName=${encodeURIComponent(formData.groupName)}&participantCount=${formData.participants.length}${modeParam}`;
        router.push(successUrl);
      } catch (error) {
        const errorMessage = formatError(error);
        setSubmitError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSubmitError('필수 필드를 모두 입력해주세요.');
    }
  };

  return {
    formData,
    setFormData,
    isGroupNameChecked,
    setIsGroupNameChecked,
    isGroupIdChecked,
    setIsGroupIdChecked,
    groupNameCheckResult,
    groupIdCheckResult,
    isEditMode,
    isLoading,
    isFormValid: isFormValid(formData),
    openDropdown,
    setOpenDropdown,
    refs: {
      phone1Ref,
      // emailDomainRef // API 구조 변경으로 제거
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
      handleGroupNameCheck: () => handleGroupNameCheck(eventId, formData.groupName, setGroupNameCheckResult),
      handleGroupIdCheck: () => handleGroupIdCheck(eventId, formData.groupId, setGroupIdCheckResult),
      handleSubmit
    },
    error: {
      submitError,
      clearSubmitError: () => setSubmitError('')
    }
  };
};
