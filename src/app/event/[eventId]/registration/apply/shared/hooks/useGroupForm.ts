// 단체신청 폼 관련 커스텀 훅
import { useState, useEffect, useCallback, useRef } from 'react';
import { GroupFormData, ParticipantData } from '../types/group';
import { initialGroupFormData, createInitialParticipant } from '../types/group-constants';
import { isFormValid, getGroupFormValidationErrors } from '../utils/validation';
import { handleGroupInputChange, handleParticipantChange, handleGroupAddressSelect, handleGroupNameCheck, handleGroupIdCheck } from '../utils/handlers';
import { transformGroupFormDataToApi, transformGroupFormDataToUpdateApi } from '../utils/transformers';
import { submitGroupRegistration, updateGroupRegistration } from '../api/group';
import { formatError } from '../utils/errorHandler';
import { mapLoadedAddressDetail } from '../constants/addressField';
import { loadEventTermsAgreement } from '../utils/eventTermsAgreement';
import { useRouter } from 'next/navigation';

const isEditPasswordValid = (password: string) => password.length >= 4 && !/\s/.test(password);

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

  // OTP 인증용 스테이징 정보
  const [stagedToken, setStagedToken] = useState<string | null>(null);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);

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

            // 예전 추론 로직(쉼표 기준 분리)은 도로명 주소/참고주소를 잘못 상세주소로 옮길 수 있어 비활성화


            // 참가자 데이터 변환
            // editData.participants가 있으면 우선 사용 (createEditData에서 이미 변환된 데이터)
            // 없으면 innerUserRegistrationList를 변환
            // 참고: editData.participants에는 checkOwned가 포함되어 있음
            const participants = editData.participants || (editData.innerUserRegistrationList || []).map((participant: any, index: number) => {
              // 전화번호 분리
              const participantPhoneParts = (participant.phNum || '010-0000-0000').split('-') || ['010', '', ''];

              // 이메일 분리 (emailDomain이 있으면 email2에 설정) - API 구조 변경으로 제거
              // const participantEmailParts = (participant.email || '').split('@') || ['', ''];
              // const emailDomain = participantEmailParts[1] || 'naver.com';

              const souvenirList = Array.isArray(participant.souvenir) ? participant.souvenir : [];
              const firstSouvenir = souvenirList[0];

              return {
                name: participant.name || '',
                gender: participant.gender === 'M' ? 'male' : 'female',
                birthYear: participant.birth?.split('-')[0] || '',
                birthMonth: participant.birth?.split('-')[1] || '',
                birthDay: participant.birth?.split('-')[2] || '',
                phone1: participantPhoneParts[0] || '010',
                phone2: participantPhoneParts[1] || '',
                phone3: participantPhoneParts[2] || '',
                category: participant.eventCategoryName || '',
                souvenir: firstSouvenir?.souvenirId || '',
                size: firstSouvenir?.souvenirSize || '',
                selectedSouvenirs: souvenirList.map((s: any) => ({
                  souvenirId: s.souvenirId,
                  souvenirName: s.souvenirName,
                  size: s.souvenirSize
                })),
                note: participant.note || '',
                paymentStatus: participant.paymentStatus || 'UNPAID',
                registrationId: participant.registrationId,
                originalAmount: participant.amount,
                checkOwned: participant.checkOwned === true ? true : false // 소유 신청 여부 설정 (명시적으로 true인 경우만 true)
              };
            });

            const addressDetailMapped = mapLoadedAddressDetail(detailedAddress);

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
              detailedAddress: addressDetailMapped.detailedAddress,
              noDetailedAddress: addressDetailMapped.noDetailedAddress,
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

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const dataParam = urlParams.get('data');
    const orgAccount = urlParams.get('orgAccount');
    const isEdit = mode === 'edit';

    const sanitizedFormData = isEdit
      ? { ...formData, groupPassword: '123456', confirmGroupPassword: '123456' }
      : formData;
    const isEditPasswordSectionValid = !isEdit || (
      formData.groupPassword.trim() !== '' &&
      formData.confirmGroupPassword.trim() !== '' &&
      formData.groupPassword === formData.confirmGroupPassword &&
      isEditPasswordValid(formData.groupPassword)
    );

    if (isFormValid(sanitizedFormData as GroupFormData) && isEditPasswordSectionValid) {
      setIsLoading(true);

      try {
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

        let response: any;
        if (isEdit) {
          // 수정 모드인데 editData가 없으면 에러
          if (!currentEditData) {
            throw new Error('수정할 신청 정보를 찾을 수 없습니다. 다시 시도해주세요.');
          }

          // 단체 수정: 항상 단체 수정 API만 사용 (소유 신청자 여부와 관계없이)
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
        } else {
          // 신규 신청 모드: POST API 호출
          const eventTermsAgreeRequestList = loadEventTermsAgreement(eventId);
          const requestData = transformGroupFormDataToApi(
            formData,
            eventInfo,
            eventTermsAgreeRequestList
          );
          response = await submitGroupRegistration(eventId, requestData);
        }
        // 스테이징 성공 시 stageToken 저장 및 OTP 모달 오픈
        if (response && response.stagedToken) {
          setStagedToken(response.stagedToken as string);
          const phoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
          setOtpPhoneNumber(phoneNumber);
          setIsOtpModalOpen(true);
          setSubmitError('');
        } else {
          throw new Error('스테이징 토큰을 받지 못했습니다.');
        }
      } catch (error) {
        const errorMessage = formatError(error);
        setSubmitError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 누락된 필드 목록 가져오기 (수정 모드에서는 비밀번호 규칙 별도 처리)
      const errorMessage = (() => {
        if (!isEdit) return getGroupFormValidationErrors(formData);

        const pwdErrors: string[] = [];
        if (formData.groupPassword.trim() === '') {
          pwdErrors.push('• 단체 비밀번호를 입력해주세요');
        } else if (!isEditPasswordValid(formData.groupPassword)) {
          pwdErrors.push('• 신청시 입력했던 비밀번호로 입력해주세요.');
        }
        if (formData.confirmGroupPassword.trim() === '') {
          pwdErrors.push('• 단체 비밀번호 확인을 입력해주세요');
        } else if (formData.groupPassword !== formData.confirmGroupPassword) {
          pwdErrors.push('• 단체 비밀번호와 비밀번호 확인이 일치하지 않습니다');
        }

        const baseErrors = getGroupFormValidationErrors(sanitizedFormData as GroupFormData);
        if (pwdErrors.length === 0) return baseErrors;
        if (!baseErrors.includes('【기본 정보】')) {
          return `다음 항목을 확인해주세요:\n\n【기본 정보】\n${pwdErrors.join('\n')}`;
        }
        return baseErrors.replace('【기본 정보】', `【기본 정보】\n${pwdErrors.join('\n')}`);
      })();
      setSubmitError(errorMessage);
    }
  };

  // OTP 요청 (스테이징 단계에서 이미 발송되었다고 가정하므로 별도 서버 호출 없음)
  const handleOtpRequest = async () => {
    return;
  };

  // OTP 재발급
  const handleOtpReissue = async () => {
    if (!stagedToken || !otpPhoneNumber) {
      throw new Error('재발급할 스테이징 정보가 없습니다.');
    }
    setIsOtpReissuing(true);
    try {
      const { reissueStagedOtp } = await import('../api/individual');
      await reissueStagedOtp(stagedToken, otpPhoneNumber);
    } finally {
      setIsOtpReissuing(false);
    }
  };

  // OTP 인증 완료 → commit 호출
  const handleOtpSubmit = async (otp: string) => {
    if (!stagedToken || !otpPhoneNumber) {
      throw new Error('커밋할 스테이징 정보가 없습니다.');
    }
    setIsOtpSubmitting(true);
    try {
      const { commitStagedRegistration } = await import('../api/individual');
      await commitStagedRegistration(stagedToken, otp, otpPhoneNumber);

      setStagedToken(null);
      setOtpPhoneNumber(null);
      setIsOtpModalOpen(false);

      const modeParam = isEditMode ? '&mode=edit' : '';
      const successUrl = `/event/${eventId}/registration/apply/group/success?name=${encodeURIComponent(
        formData.groupName
      )}&groupName=${encodeURIComponent(
        formData.groupName
      )}&participantCount=${formData.participants.length}${modeParam}`;
      router.push(successUrl);
    } catch (error) {
      const errorMessage = formatError(error);
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
  };

  const isEditPasswordSectionValid = formData.groupPassword.trim() !== '' &&
    formData.confirmGroupPassword.trim() !== '' &&
    formData.groupPassword === formData.confirmGroupPassword &&
    isEditPasswordValid(formData.groupPassword);
  const isSubmitEnabled = isEditMode
    ? isFormValid({ ...formData, groupPassword: '123456', confirmGroupPassword: '123456' } as GroupFormData) && isEditPasswordSectionValid
    : isFormValid(formData);

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
    isFormValid: isSubmitEnabled,
    openDropdown,
    setOpenDropdown,
    refs: {
      phone1Ref,
      // emailDomainRef // API 구조 변경으로 제거
    },
    handlers: {
      handleInputChange: (field: keyof GroupFormData, value: string | boolean) =>
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
    },
    otp: {
      isOpen: isOtpModalOpen,
      phoneNumber: otpPhoneNumber,
      isSubmitting: isOtpSubmitting,
      isReissuing: isOtpReissuing,
      handleRequest: handleOtpRequest,
      handleReissue: handleOtpReissue,
      handleSubmit: handleOtpSubmit,
      close: closeOtpModal,
    },
  };
};
