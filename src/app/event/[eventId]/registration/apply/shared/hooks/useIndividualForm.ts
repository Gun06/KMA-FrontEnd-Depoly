// 개인신청 폼 관련 커스텀 훅
import { useState, useEffect, useRef } from 'react';
import { IndividualFormData, IdCheckResult, OpenDropdown } from '../types/individual';
import { initialIndividualFormData } from '../types/individual-constants';
import { isFormValid, getIndividualFormValidationErrors } from '../utils/validation';
import { handleInputChange, handleIdCheck, handleAddressSelect } from '../utils/handlers';
import { transformFormDataToApi, transformFormDataToUpdateApi } from '../utils/transformers';
import { submitIndividualRegistration, updateIndividualRegistration, UserData } from '../api/individual';
import { EventRegistrationInfo, CategorySouvenir } from '../types/common';
import { useRouter } from 'next/navigation';
import { formatError } from '../utils/errorHandler';

const isEditPasswordValid = (password: string) => password.length >= 4 && !/\s/.test(password);

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
  // OTP 인증용 스테이징 정보
  const [stagedToken, setStagedToken] = useState<string | null>(null);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  // Refs for dropdowns
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const phone1Ref = useRef<HTMLDivElement>(null);
  const guardianPhone1Ref = useRef<HTMLDivElement>(null);
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
          
          // category가 있으면 해당 category의 distance 찾기
          // eventCategoryName이 "TEST|테스트1 마라톤" 형식일 수 있으므로 분리 필요
          // 항상 | 기준으로 앞부분은 거리, 뒷부분은 세부종목
          const fullCategoryName = editData.eventCategoryName || '';
          let categoryName = fullCategoryName;
          let selectedDistance = '';
          
          // eventCategoryName에서 | 기준으로 분리 (예: "TEST|테스트1 마라톤", "10km|테스트1 마라톤")
          if (fullCategoryName.includes('|')) {
            const parts = fullCategoryName.split('|').map((p: string) => p.trim());
            if (parts.length >= 2) {
              // 항상 첫 번째 부분은 거리, 나머지는 세부종목
              selectedDistance = parts[0];
              categoryName = parts.slice(1).join(' | ').trim();
            } else if (parts.length === 1) {
              // |가 있지만 분리 결과가 1개인 경우 (예: "TEST|")
              selectedDistance = parts[0];
              categoryName = '';
            }
          }
          
          const guardianPhNumFromEditData =
            editData.guardianPhNum ||
            editData.guardianInfo?.guardianPhNum ||
            editData.guardianInfo?.guardian_ph_num ||
            '';
          const guardianRelationshipFromEditData =
            editData.guardianRelationship ||
            editData.guardianRelationShip ||
            editData.guardianInfo?.guardianRelationship ||
            editData.guardianInfo?.guardianRelationShip ||
            editData.guardianInfo?.guardian_relationship ||
            '';

          const guardianPhoneParts = String(guardianPhNumFromEditData || '').split('-');

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
            guardianPhone1: guardianPhoneParts[0] || '010',
            guardianPhone2: guardianPhoneParts[1] || '',
            guardianPhone3: guardianPhoneParts[2] || '',
            guardianRelationship: String(guardianRelationshipFromEditData || ''),
            email1: emailParts[0] || '',
            emailDomain: emailParts[1] || '',
            selectedDistance: selectedDistance,
            category: categoryName,
            souvenir: finalSouvenirId,
            size: finalSouvenirSize,
            // 수정 모드에서 기존 기념품들을 selectedSouvenirs 배열로 변환
            selectedSouvenirs: (() => {
              // editData.souvenir 배열이 있으면 그대로 사용 (API 응답 그대로)
              if (editData.souvenir && Array.isArray(editData.souvenir) && editData.souvenir.length > 0) {
                return editData.souvenir.map((item: any) => ({
                  souvenirId: item.souvenirId || '',
                  souvenirName: item.souvenirName || '기념품',
                  size: item.souvenirSize || ''
                }));
              }
              
              // editData.souvenir 배열이 없으면 첫 번째 기념품으로 변환 (하위 호환성)
              if (finalSouvenirId) {
                return [{
                  souvenirId: finalSouvenirId,
                  souvenirName: '기념품',
                  size: finalSouvenirSize
                }];
              }
              
              return [];
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

  // eventInfo가 로드된 후 category가 있으면 selectedDistance 자동 설정
  useEffect(() => {
    if (formData.category && eventInfo) {
      // category에서 정확히 매칭되는 항목 찾기 (거리와 세부종목 이름을 함께 고려)
      let categoryInfo: CategorySouvenir | undefined;
      
      // selectedDistance가 있으면 거리와 세부종목 이름을 반드시 함께 매칭
      if (formData.selectedDistance) {
        categoryInfo = eventInfo.categorySouvenirList.find(
          c => c.categoryName === formData.category && c.distance === formData.selectedDistance
        );
        
        // 거리와 함께 매칭되지 않으면 사용자가 선택한 거리와 세부종목이 일치하지 않으므로 세부종목 초기화
        if (!categoryInfo) {
          setFormData(prev => ({
            ...prev,
            category: '',
            selectedSouvenirs: [],
            souvenir: '',
            size: ''
          }));
          return;
        }
      } else {
        // selectedDistance가 없을 때만 이름만으로 찾기 (하위 호환성)
        categoryInfo = eventInfo.categorySouvenirList.find(
          c => c.categoryName === formData.category
        );
      }
      
      // 정확히 매칭되지 않으면 부분 매칭 시도 (예: "10km | 너양야아아아"에서 "너양야아아아"만 추출)
      // 단, selectedDistance가 있을 때는 거리와 함께 매칭되어야 함
      if (!categoryInfo && formData.category.includes('|') && !formData.selectedDistance) {
        const parts = formData.category.split('|').map((p: string) => p.trim());
        // 첫 번째 부분이 거리가 아니고, 나머지 부분이 세부종목일 수 있음
        for (const part of parts) {
          if (!part.match(/^\d+km$/i)) {
            const foundCategoryInfo = eventInfo.categorySouvenirList.find(
              c => c.categoryName === part
            );
            if (foundCategoryInfo) {
              // 정확한 category 이름으로 업데이트
              setFormData(prev => ({
                ...prev,
                category: foundCategoryInfo.categoryName,
                selectedDistance: foundCategoryInfo.distance || prev.selectedDistance || ''
              }));
              return;
            }
          }
        }
      }
      
      // categoryInfo를 찾았으면 distance 설정
      // 단, 이미 selectedDistance가 있으면 그대로 유지 (수정 모드에서 이미 올바르게 설정된 경우를 보호)
      if (categoryInfo) {
        // selectedDistance가 없을 때만 업데이트 (이미 있으면 덮어쓰지 않음)
        if (!formData.selectedDistance && categoryInfo.distance) {
          setFormData(prev => ({
            ...prev,
            selectedDistance: categoryInfo.distance
          }));
        }
        // selectedDistance가 있는데 categoryInfo의 distance와 다른 경우는 무시
        // (사용자가 선택한 거리와 세부종목이 일치하지 않으면 이미 위에서 초기화됨)
      }
    }
  }, [formData.category, formData.selectedDistance, eventInfo]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        yearRef.current && !yearRef.current.contains(event.target as Node) &&
        monthRef.current && !monthRef.current.contains(event.target as Node) &&
        dayRef.current && !dayRef.current.contains(event.target as Node) &&
        phone1Ref.current && !phone1Ref.current.contains(event.target as Node) &&
        guardianPhone1Ref.current && !guardianPhone1Ref.current.contains(event.target as Node) &&
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

    const isEditMode = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('mode') === 'edit';
    const sanitizedFormData = isEditMode
      ? { ...formData, password: '123456', confirmPassword: '123456' }
      : formData;
    const isEditPasswordSectionValid = !isEditMode || (
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      isEditPasswordValid(formData.password)
    );

    if (isFormValid(sanitizedFormData as IndividualFormData) && isEditPasswordSectionValid) {
      try {
        setIsSubmitted(true);

        // API 스키마에 맞는 데이터로 변환 (수정 모드에서는 souvenir 필드 제거)
        const apiData = isEditMode ? 
          transformFormDataToUpdateApi(formData, eventInfo) : 
          transformFormDataToApi(formData, eventInfo);
        
        let _result: any;
        if (isEditMode) {
          // 수정 모드: PATCH API 호출
          // sessionStorage 또는 URL 파라미터에서 registrationId 가져오기
          let registrationId: string | null = null;
          
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const registrationIdParam = urlParams.get('registrationId');
            const dataParam = urlParams.get('data');
            
            // URL 파라미터에서 직접 registrationId 가져오기 (가장 우선)
            if (registrationIdParam) {
              registrationId = registrationIdParam;
            }
            
            // sessionStorage에서 확인 (새로운 방식)
            if (!registrationId && registrationIdParam) {
              try {
                const storageKey = `individual_edit_data_${eventId}_${decodeURIComponent(registrationIdParam)}`;
                const storedDataString = sessionStorage.getItem(storageKey);
                if (storedDataString) {
                  const editData = JSON.parse(storedDataString);
                  registrationId = editData.registrationId || registrationIdParam;
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
        // [ncloud 복구 시 복원] 스테이징 성공 시 stageToken 저장 및 OTP 모달 오픈
        // if (_result && _result.stagedToken) {
        //   setStagedToken(_result.stagedToken as string);
        //   const phoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
        //   setOtpPhoneNumber(phoneNumber);
        //   setIsOtpModalOpen(true);
        //   setSubmitError('');
        // } else {
        //   throw new Error('스테이징 토큰을 받지 못했습니다.');
        // }

        // ncloud 임시 대응: stagedToken 없으면 백엔드가 직접 완료 처리 → 성공 페이지로 이동
        if (_result?.stagedToken) {
          setStagedToken(_result.stagedToken as string);
          const phoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
          setOtpPhoneNumber(phoneNumber);
          setIsOtpModalOpen(true);
          setSubmitError('');
        } else {
          const modeParam = isEditMode ? '&mode=edit' : '';
          router.push(
            `/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(
              formData.name
            )}${modeParam}`
          );
        }
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
          // 다른 오류들에 대한 처리 - formatError를 사용하여 서버 메시지 추출
          const errorMessage = formatError(error);
          
          // alert 대신 상태로 오류 메시지 저장
          setSubmitError(errorMessage);
        }
      } finally {
        setIsSubmitted(false);
      }
    } else {
      // 누락된 필드 목록 가져오기 (수정 모드에서는 비밀번호 규칙 별도 처리)
      const errorMessage = (() => {
        if (!isEditMode) return getIndividualFormValidationErrors(formData);

        const pwdErrors: string[] = [];
        if (formData.password.trim() === '') {
          pwdErrors.push('• 비밀번호를 입력해주세요');
        } else if (!isEditPasswordValid(formData.password)) {
          pwdErrors.push('• 신청시 입력했던 비밀번호로 입력해주세요.');
        }
        if (formData.confirmPassword.trim() === '') {
          pwdErrors.push('• 비밀번호 확인을 입력해주세요');
        } else if (formData.password !== formData.confirmPassword) {
          pwdErrors.push('• 비밀번호와 비밀번호 확인이 일치하지 않습니다');
        }

        const baseErrors = getIndividualFormValidationErrors(sanitizedFormData as IndividualFormData);
        if (pwdErrors.length === 0) return baseErrors;
        if (!baseErrors.includes('【기본 정보】')) {
          return `다음 항목을 확인해주세요:\n\n【기본 정보】\n${pwdErrors.join('\n')}`;
        }
        return baseErrors.replace('【기본 정보】', `【기본 정보】\n${pwdErrors.join('\n')}`);
      })();
      setSubmitError(errorMessage);
    }
  };

  // 스마트 정보 불러오기 (로그인 상태 확인 후 자동 처리)
  const handleLoadInfo = async () => {
    setIsLoadingInfo(true);
    try {
      // 먼저 로그인 상태 확인 (GET API)
      const { fetchDefaultInfo } = await import('../api/individual');
      const userData = await fetchDefaultInfo();
      
      // 성공 시 바로 폼에 입력 (로그인 상태이므로 accountId는 없음)
      handleUserDataLoad(userData);
    } catch (error) {
      // 인증 에러(401, 403) 또는 UNAUTHORIZED 에러인 경우에만 모달 열기
      const isUnauthorized = error instanceof Error && 
        (error.message === 'UNAUTHORIZED' || 
         (error as any).status === 401 || 
         (error as any).status === 403);
      
      if (isUnauthorized) {
        // 로그인되지 않은 상태이므로 모달 열기
        setIsIdPasswordModalOpen(true);
      } else {
        // 다른 에러인 경우 에러 메시지 표시
        console.error('정보 불러오기 실패:', error);
        // 필요시 에러 토스트나 알림 표시 가능
      }
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // 사용자 정보 자동 입력 처리
  const handleUserDataLoad = (userData: UserData, accountId?: string) => {
    // 생년월일 분리 (YYYY-MM-DD -> YYYY, MM, DD)
    const birthParts = userData.birth?.split('-') || ['', '', ''];
    
    // 전화번호 분리 (010-1234-5678 -> 010, 1234, 5678)
    const phoneParts = userData.phNum?.split('-') || ['010', '', ''];
    
    // 이메일 분리 (임시 이메일 값 필터링)
    const email = userData.email || '';
    const isTempEmail = !email || email.trim() === '' || email.includes('TEMP_EMAIL') || email.includes('NOT_TRUE_VALUE');
    const emailParts = isTempEmail ? ['', ''] : (email.split('@') || ['', '']);
    
    // 주소 정보 처리 (address.address 또는 roadAddress 사용)
    const fullAddress = userData.address?.address || userData.address?.roadAddress || '';
    const addressDetail = userData.address?.addressDetail || '';
    
    setFormData(prev => ({
      ...prev,
      jeonmahyupId: accountId || prev.jeonmahyupId, // 전마협 아이디 설정
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
      // 입금자명은 실제 입금자와 다를 수 있으므로 자동 변경하지 않음
      depositorName: prev.depositorName
    }));
  };

  // OTP 요청 (스테이징 단계에서 이미 발송되었다고 가정하므로 별도 서버 호출 없음)
  const handleOtpRequest = async () => {
    // 필요 시 서버에 별도 요청을 추가할 수 있으나, 현재는 no-op
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

      // 커밋 성공 시 스테이징 정보 정리 및 모달 닫기
      setStagedToken(null);
      setOtpPhoneNumber(null);
      setIsOtpModalOpen(false);
      // 성공 페이지로 이동 (기존 로직 재사용)
      const isEditMode =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mode') === 'edit';
      const modeParam = isEditMode ? '&mode=edit' : '';
      router.push(
        `/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(
          formData.name
        )}${modeParam}`
      );
    } catch (error) {
      const message = formatError(error);
      setSubmitError(message);
      throw error;
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
  };

  const isCurrentEditMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'edit';
  const isEditPasswordSectionValid = formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword &&
    isEditPasswordValid(formData.password);
  const isSubmitEnabled = isCurrentEditMode
    ? isFormValid({ ...formData, password: '123456', confirmPassword: '123456' } as IndividualFormData) && isEditPasswordSectionValid
    : isFormValid(formData);

  return {
    formData,
    setFormData,
    openDropdown,
    setOpenDropdown,
    idCheckResult,
    setIdCheckResult,
    isSubmitted,
    isFormValid: isSubmitEnabled,
    refs: {
      yearRef,
      monthRef,
      dayRef,
      phone1Ref,
      guardianPhone1Ref,
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
      handleUserDataLoad,
      handleLoadInfo,
      isLoadingInfo,
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
    },
    error: {
      submitError,
      clearSubmitError: () => setSubmitError('')
    }
  };
};
