"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useEventRegistration } from "../../shared/hooks/useEventRegistration";
import { useIndividualForm } from "../../shared/hooks/useIndividualForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ErrorAlert from "../../shared/components/ErrorAlert";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import NoticeSection from "../../individual/components/NoticeSection";
import PersonalInfoSection from "../../individual/components/PersonalInfoSection";
import ContactInfoSection from "../../individual/components/ContactInfoSection";
import RegistrationInfoSection from "../../individual/components/RegistrationInfoSection";
import BottomNoticeSection from "../../individual/components/BottomNoticeSection";
import FormField from "../../shared/components/FormField";
import AddressField from "../../shared/components/AddressField";
import IdPasswordModal from "@/components/event/Registration/IdPasswordModal";
import RegistrationOtpModal from "@/components/event/Registration/RegistrationOtpModal";
import { updateOwnedRegistration, OwnedRegistrationUpdatePayload } from "../../shared/api/owned";
import { commitStagedRegistration, reissueStagedOtp } from "../../shared/api/individual";
import { formatEmail } from "../../shared/utils/formatters";
import { fetchOwnedRegistrationView } from "../../../confirm/group/api";

interface OwnedRegistrationEditClientProps {
  eventId: string;
  registrationId: string;
}

export default function OwnedRegistrationEditClient({ eventId, registrationId }: OwnedRegistrationEditClientProps) {
  const router = useRouter();
  const { eventInfo, isLoading: isLoadingEvent, error: eventError, refetch } = useEventRegistration(eventId);
  const {
    formData,
    setFormData,
    openDropdown,
    setOpenDropdown,
    isFormValid: _isFormValid,
    refs,
    handlers,
    modal,
    error
  } = useIndividualForm(eventId, eventInfo);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedToken, setStagedToken] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState<string | null>(null);
  const [addressIsBasedOnOrganization, setAddressIsBasedOnOrganization] = useState(false);
  const [guardianIsBasedOnOrgLeader, setGuardianIsBasedOnOrgLeader] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 원래 주소 정보 저장 (체크박스 해제 시 복원용)
  const [originalAddress, setOriginalAddress] = useState<{
    postalCode: string;
    address: string;
    detailedAddress: string;
  } | null>(null);

  // 페이지 로드 시 소유 신청 데이터 가져오기
  const loadOwnedData = async () => {
      try {
        setIsLoadingData(true);
        setLoadError(null);

        // 쿼리 파라미터에서 인증 정보 가져오기
        const currentSearchParams = new URLSearchParams(window.location.search);
        const name = currentSearchParams.get('name');
        const birth = currentSearchParams.get('birth');
        const phNum = currentSearchParams.get('phNum');
        const password = currentSearchParams.get('password'); // 쿼리 파라미터에서 가져올 수도 있음

        if (!name || !birth || !phNum) {
          throw new Error('인증 정보가 누락되었습니다.');
        }

        // sessionStorage에서 비밀번호 확인 (인증 시 저장했을 수 있음)
        const storageKey = `owned_auth_${eventId}_${registrationId}`;
        let eventPw = password || '';
        
        try {
          const storedAuth = sessionStorage.getItem(storageKey);
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            eventPw = authData.password || eventPw;
            // 페이지 새로고침 시에도 사용할 수 있도록 삭제하지 않음
            // (수정 완료 후에는 삭제하거나, 일정 시간 후 자동 삭제 가능)
          }
        } catch (_e) {
          // 무시
        }

        // 비밀번호가 없으면 에러
        if (!eventPw) {
          throw new Error('비밀번호가 필요합니다. 다시 인증해주세요.');
        }

        // 소유 신청 데이터 가져오기
        let ownedData;
        try {
          ownedData = await fetchOwnedRegistrationView(eventId, {
            name: decodeURIComponent(name),
            phNum: decodeURIComponent(phNum),
            birth: decodeURIComponent(birth),
            eventPw: eventPw
          });
        } catch (apiError) {
          // API 에러는 그대로 전달
          throw apiError;
        }

        // API 응답 데이터 유효성 검증
        if (!ownedData || !ownedData.registrationId) {
          throw new Error('신청 정보를 불러올 수 없습니다.');
        }

        // 폼 데이터 채우기
        const phoneParts = ownedData.phNum.split('-');
        const birthParts = ownedData.birth.split('-');
        const emailParts = ownedData.email ? ownedData.email.split('@') : ['', ''];
        
        // 기념품 처리
        const selectedSouvenirs = ownedData.souvenir.map(s => ({
          souvenirId: s.souvenirId,
          souvenirName: s.souvenirName,
          size: s.souvenirSize
        }));

        // 종목 파싱 (예: "10km | 테스트1 마라톤")
        const categoryParts = ownedData.eventCategoryName.split('|').map(p => p.trim());
        const distance = categoryParts[0] || '';
        const categoryName = categoryParts.length > 1 ? categoryParts.slice(1).join(' | ') : categoryParts[0];

        const isGuardianDelegated = ownedData.checkGuardianBasedOnOrgLeader === true;
        const guardianPhoneParts = String(isGuardianDelegated ? '' : (ownedData.guardianPhNum || '')).split('-');

        setFormData((prev) => ({
          ...prev,
          name: ownedData.name,
          birthYear: birthParts[0] || '',
          birthMonth: birthParts[1] || '',
          birthDay: birthParts[2] || '',
          gender: ownedData.gender === 'M' ? 'male' : 'female',
          phone1: phoneParts[0] || '010',
          phone2: phoneParts[1] || '',
          phone3: phoneParts[2] || '',
          guardianPhone1: guardianPhoneParts[0] || '010',
          guardianPhone2: guardianPhoneParts[1] || '',
          guardianPhone3: guardianPhoneParts[2] || '',
          guardianRelationship: isGuardianDelegated ? '' : String(ownedData.guardianRelationship || ownedData.guardianRelationShip || ''),
          email1: emailParts[0] || '',
          emailDomain: emailParts[1] || 'naver.com',
          jeonmahyupId: ownedData.personalAccount || '',
          selectedDistance: distance,
          category: categoryName,
          selectedSouvenirs: selectedSouvenirs,
          souvenir: selectedSouvenirs[0]?.souvenirId || '',
          size: selectedSouvenirs[0]?.size || '',
          postalCode: ownedData.address?.zipCode || '',
          address: ownedData.address?.address || '',
          detailedAddress: ownedData.address?.addressDetail || '',
          note: ''
        }));

        // addressIsBasedOnOrganization 설정
        setAddressIsBasedOnOrganization(ownedData.checkAddressBasedOnOrganization || false);
        setGuardianIsBasedOnOrgLeader(isGuardianDelegated);

        // 원래 주소 정보 저장 (체크박스 해제 시 복원용)
        if (ownedData.address) {
          setOriginalAddress({
            postalCode: ownedData.address.zipCode || '',
            address: ownedData.address.address || '',
            detailedAddress: ownedData.address.addressDetail || ''
          });
        }

        setIsLoadingData(false);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
        setIsLoadingData(false);
      }
    };

  useEffect(() => {
    if (eventInfo && !isLoadingEvent) {
      loadOwnedData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventInfo, isLoadingEvent, eventId, registrationId]);

  // 오류 메시지가 변경되면 모달 열기
  useEffect(() => {
    if (error.submitError) {
      setIsErrorModalOpen(true);
    }
  }, [error.submitError]);

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  // 소유 신청 전용 유효성 검사 (결제 정보 제외)
  const isOwnedFormValid = (): { valid: boolean; message: string } => {
    if (!formData.name.trim()) return { valid: false, message: '이름을 입력해주세요.' };
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) return { valid: false, message: '생년월일을 모두 선택해주세요.' };
    if (!formData.password || formData.password.length < 4 || /\s/.test(formData.password)) return { valid: false, message: '신청시 입력했던 비밀번호로 입력해주세요.' };
    if (!formData.gender) return { valid: false, message: '성별을 선택해주세요.' };
    if (!addressIsBasedOnOrganization) {
      if (!formData.postalCode.trim()) return { valid: false, message: '우편번호를 입력해주세요.' };
      if (!formData.address.trim()) return { valid: false, message: '주소를 입력해주세요.' };
    }
    if (!formData.phone1 || !formData.phone2 || !formData.phone3) return { valid: false, message: '휴대폰번호를 모두 입력해주세요.' };
    if (!formData.category) return { valid: false, message: '참가종목을 선택해주세요.' };
    return { valid: true, message: '' };
  };

  // 소유 신청 수정 제출 핸들러
  const handleOwnedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = isOwnedFormValid();
    if (!validation.valid) {
      setSubmitErrorMessage(validation.message);
      setIsErrorModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage('');
    error.clearSubmitError();

    try {
      // eventCategoryId 찾기
      if (!eventInfo) {
        throw new Error('이벤트 정보가 없습니다.');
      }

      const selectedCategory = eventInfo.categorySouvenirList.find(
        c => {
          if (formData.selectedDistance) {
            return c.categoryName === formData.category && c.distance === formData.selectedDistance;
          }
          return c.categoryName === formData.category;
        }
      );

      if (!selectedCategory) {
        throw new Error('선택된 카테고리를 찾을 수 없습니다.');
      }

      // 기념품 처리
      const souvenirs = formData.selectedSouvenirs && formData.selectedSouvenirs.length > 0
        ? formData.selectedSouvenirs.map(s => ({
            souvenirId: s.souvenirId,
            selectedSize: s.size
          }))
        : [];

      // 소유 신청 수정 데이터 변환
      const updatePayload: OwnedRegistrationUpdatePayload = {
        registrationPersonalInfo: {
          registerMustInfo: {
            personalInfo: {
              birth: `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`,
              name: formData.name,
              phNum: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
              email: formatEmail(formData.email1, formData.emailDomain),
              gender: formData.gender === 'male' ? 'M' : 'F',
              guardianPhNum:
                guardianIsBasedOnOrgLeader
                  ? null
                  : formData.guardianPhone2?.trim() && formData.guardianPhone3?.trim()
                    ? `${formData.guardianPhone1}-${formData.guardianPhone2}-${formData.guardianPhone3}`
                    : null,
              guardianRelationship: guardianIsBasedOnOrgLeader ? null : (formData.guardianRelationship?.trim() ? formData.guardianRelationship.trim() : null),
              guardianRelationShip: guardianIsBasedOnOrgLeader ? null : (formData.guardianRelationship?.trim() ? formData.guardianRelationship.trim() : null),
            },
            registrationInfo: {
              eventCategoryId: selectedCategory.categoryId,
              souvenir: souvenirs,
              note: formData.note || ''
            }
          },
          checkAddressIsBasedOnOrganization: addressIsBasedOnOrganization,
          checkGuardianIsBasedOnOrganization: guardianIsBasedOnOrgLeader,
          address: addressIsBasedOnOrganization
            ? null
            : {
                address: formData.address || '',
                zipCode: formData.postalCode || '',
                addressDetail: formData.detailedAddress || ''
              }
        },
        registrationPw: formData.password,
        note: formData.note || ''
      };

      // 소유 신청 수정 스테이징
      const stagingResult = await updateOwnedRegistration(
        eventId,
        registrationId,
        updatePayload
      );

      setStagedToken(stagingResult.stagedToken);
      setOtpPhoneNumber(`${formData.phone1}-${formData.phone2}-${formData.phone3}`);
      setIsOtpModalOpen(true);
      setIsSubmitting(false);
    } catch (_err) {
      setIsSubmitting(false);
      const msg = _err instanceof Error ? _err.message : '오류가 발생했습니다.';
      setSubmitErrorMessage(msg);
      setIsErrorModalOpen(true);
    }
  };

  // OTP 제출 핸들러
  const handleOtpSubmit = async (otp: string) => {
    if (!stagedToken || !otpPhoneNumber) {
      throw new Error('스테이징 토큰 또는 전화번호가 없습니다.');
    }

    setIsOtpSubmitting(true);
    try {
      await commitStagedRegistration(
        stagedToken,
        otp,
        otpPhoneNumber
      );

      // 성공 시 완료 페이지로 이동
      router.push(`/event/${eventId}/registration/apply/individual/success?name=${encodeURIComponent(formData.name)}&mode=owned-edit`);
    } catch (_err) {
      throw _err;
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  // OTP 재발급 핸들러
  const handleOtpReissue = async () => {
    if (!stagedToken || !otpPhoneNumber) {
      throw new Error('스테이징 토큰 또는 전화번호가 없습니다.');
    }
    setIsOtpReissuing(true);
    try {
      await reissueStagedOtp(stagedToken, otpPhoneNumber);
    } finally {
      setIsOtpReissuing(false);
    }
  };

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "소유 신청 수정"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 소유 신청 설명문 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-3">소유 신청 안내</h3>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
              <p>• 단체 내 개별 신청에 대해 비밀번호가 재발급되어 관리 및 소유권을 이전받은 신청은 소유 신청으로 명명합니다.</p>
              <p>• 소유 신청으로 전환된 신청은, 단체장이 아닌 본인이 신청 내역의 수정 책임을 담당합니다.</p>
              <p>• 소유 신청은 개인정보와 참여 정보, 기념품 배송 주소를 수정 가능합니다.</p>
              <p>• 소유 신청은 결제 정보를 수정할 수 없습니다.</p>
              <p>• 결제 후 종목 변경 시도 등의 동작을 위한 환불 신청이나, 단순 환불 신청은 단체장에게 문의바랍니다.</p>
            </div>
          </div>

          {/* 상단 안내사항 */}
          <NoticeSection isEditMode={true} />

          {/* 소유 신청 수정 폼 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* 로딩 상태 - 이벤트 정보 또는 신청 정보 로딩 중 */}
            {(isLoadingEvent || isLoadingData) && (
              <LoadingSpinner 
                text={isLoadingEvent ? "이벤트 정보를 불러오는 중..." : "신청 정보를 불러오는 중..."} 
              />
            )}
            
            {/* 이벤트 에러 상태 */}
            {eventError && !isLoadingEvent && (
              <ErrorAlert message={eventError} onRetry={refetch} />
            )}

            {/* 데이터 로딩 에러 상태 */}
            {loadError && !isLoadingData && (
              <ErrorAlert message={loadError} onRetry={loadOwnedData} />
            )}

            {/* 폼 - 이벤트 정보와 데이터가 로드된 후에만 표시 */}
            {eventInfo && !isLoadingEvent && !isLoadingData && !loadError && (
            <form className="space-y-12 sm:space-y-16" onSubmit={handleOwnedSubmit} autoComplete="off" noValidate>
              {/* 개인정보 섹션 */}
              <PersonalInfoSection
                formData={formData}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onAddressSelect={handlers.handleAddressSelect}
                onDropdownToggle={setOpenDropdown}
                onOpenIdPasswordModal={() => modal.setIsIdPasswordModalOpen(true)}
                onLoadInfo={modal.handleLoadInfo}
                isLoadingInfo={modal.isLoadingInfo}
                hideAddress={true}
                hideLoadInfo={true}
                refs={refs}
              />
              
              {/* 소유 신청 전용: 배송 주소 섹션 */}
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-black text-left">배송 주소</h2>
                  <hr className="border-black border-[1.5px] mt-2" />
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* 단체와 동일한 주소 사용 체크박스 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="addressIsBasedOnOrganization"
                      checked={addressIsBasedOnOrganization}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAddressIsBasedOnOrganization(isChecked);
                        
                        if (isChecked) {
                          // 체크 시: 원래 주소 복원 (필드에 데이터 표시)
                          if (originalAddress) {
                            handlers.handleInputChange('postalCode', originalAddress.postalCode);
                            handlers.handleInputChange('address', originalAddress.address);
                            handlers.handleInputChange('detailedAddress', originalAddress.detailedAddress);
                          }
                        } else {
                          // 체크 해제 시: 현재 주소를 저장하고 초기화 (필드는 보이지만 데이터 없음)
                          if (!originalAddress) {
                            setOriginalAddress({
                              postalCode: formData.postalCode || '',
                              address: formData.address || '',
                              detailedAddress: formData.detailedAddress || ''
                            });
                          }
                          handlers.handleInputChange('postalCode', '');
                          handlers.handleInputChange('address', '');
                          handlers.handleInputChange('detailedAddress', '');
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="addressIsBasedOnOrganization" className="ml-2 text-sm sm:text-base text-gray-700">
                      단체와 동일한 주소로 설정
                    </label>
                  </div>
                  
                  {/* 주소 필드 - 체크박스 해제 시에만 표시 */}
                  {!addressIsBasedOnOrganization && (
                    <FormField label="주소" required>
                      <AddressField
                        postalCode={formData.postalCode}
                        address={formData.address}
                        detailedAddress={formData.detailedAddress}
                        onPostalCodeChange={(value) => handlers.handleInputChange('postalCode', value)}
                        onAddressChange={(value) => handlers.handleInputChange('address', value)}
                        onDetailedAddressChange={(value) => handlers.handleInputChange('detailedAddress', value)}
                        onAddressSelect={handlers.handleAddressSelect}
                        disabled={false}
                      />
                    </FormField>
                  )}
                  <hr className="border-gray-200" />
                </div>
              </div>

              {/* 연락처 정보 섹션 (항상 수정 가능) */}
              <ContactInfoSection
                formData={formData}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onDropdownToggle={setOpenDropdown}
                showGuardianSection={true}
                guardianDisabled={guardianIsBasedOnOrgLeader}
                hideGuardianFields={guardianIsBasedOnOrgLeader}
                guardianHelpTextOn="단체장 정보로 위임 중입니다. 직접 입력하려면 위임 체크를 해제해 주세요."
                guardianHeaderRight={
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={guardianIsBasedOnOrgLeader}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setGuardianIsBasedOnOrgLeader(checked);
                        if (checked) {
                          setFormData((prev) => ({ ...prev, guardianPhone2: '', guardianPhone3: '', guardianRelationship: '' }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    단체장 위임
                  </label>
                }
                refs={refs}
              />

              {/* 신청 정보 섹션 */}
              <RegistrationInfoSection
                formData={formData}
                eventInfo={eventInfo}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onDropdownToggle={setOpenDropdown}
                refs={refs}
              />

              {/* 결제 정보 섹션 제거 - 소유 신청은 결제 정보 수정 불가 */}

              {/* 하단 안내사항 */}
              <BottomNoticeSection />

              {/* 제출 버튼 */}
              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors font-medium text-base sm:text-lg ${
                    !isSubmitting
                      ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>처리 중...</span>
                    </div>
                  ) : (
                    '수정 완료'
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>

      {/* 아이디/비밀번호 모달 */}
      <IdPasswordModal
        isOpen={modal.isIdPasswordModalOpen}
        onClose={() => modal.setIsIdPasswordModalOpen(false)}
        onSuccess={modal.handleUserDataLoad}
        initialAccountId={formData.jeonmahyupId}
      />
      
      {/* 신청용 전화번호 OTP 모달 */}
      <RegistrationOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
        onReissue={handleOtpReissue}
        onRequestOtp={() => {}}
        phoneNumber={otpPhoneNumber || undefined}
        isSubmitting={isOtpSubmitting}
        isReissuing={isOtpReissuing}
        isEditMode={true}
      />
      
      {/* 오류 모달 */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          error.clearSubmitError();
        }}
        title="입력 정보 확인"
        message={submitErrorMessage || error.submitError || '오류가 발생했습니다.'}
        confirmText="확인"
      />
    </SubmenuLayout>
  );
}
