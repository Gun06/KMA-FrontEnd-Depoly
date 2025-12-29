"use client";

import { useState, useEffect } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useEventRegistration } from "../shared/hooks/useEventRegistration";
import { useIndividualForm } from "../shared/hooks/useIndividualForm";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import ErrorAlert from "../shared/components/ErrorAlert";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import NoticeSection from "./components/NoticeSection";
import PersonalInfoSection from "./components/PersonalInfoSection";
import ContactInfoSection from "./components/ContactInfoSection";
import RegistrationInfoSection from "./components/RegistrationInfoSection";
import PaymentInfoSection from "./components/PaymentInfoSection";
import BottomNoticeSection from "./components/BottomNoticeSection";
import SubmitButton from "./components/SubmitButton";
import IdPasswordModal from "@/components/event/Registration/IdPasswordModal";

export default function IndividualApplyPage({ params }: { params: { eventId: string } }) {
  const { eventInfo, isLoading: isLoadingEvent, error: eventError, refetch } = useEventRegistration(params.eventId);
  const {
    formData,
    setFormData: _setFormData,
    openDropdown,
    setOpenDropdown,
    idCheckResult,
    isSubmitted,
    isFormValid,
    refs,
    handlers,
    modal,
    error
  } = useIndividualForm(params.eventId, eventInfo);

  // 편집 모드 확인
  const isEditMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('mode') === 'edit';
  
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  // 오류 메시지가 변경되면 모달 열기
  useEffect(() => {
    if (error.submitError) {
      setIsErrorModalOpen(true);
    }
  }, [error.submitError]);

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "개인신청"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 상단 안내사항 */}
          <NoticeSection isEditMode={isEditMode} />

          {/* 개인신청 폼 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* 이벤트 정보 로딩 상태 */}
            {isLoadingEvent && (
              <LoadingSpinner text="이벤트 정보를 불러오는 중..." />
            )}
            
            {/* 이벤트 에러 상태 */}
            {eventError && (
              <ErrorAlert message={eventError} onRetry={refetch} />
            )}
            
            {/* 폼 - 이벤트 정보가 로드된 후에만 표시 */}
            {eventInfo && !isLoadingEvent && (
            <form className="space-y-12 sm:space-y-16" onSubmit={handlers.handleSubmit} autoComplete="off" noValidate>
              {/* 개인정보 섹션 */}
              <PersonalInfoSection
                formData={formData}
                idCheckResult={idCheckResult}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onIdCheck={handlers.handleIdCheck}
                onAddressSelect={handlers.handleAddressSelect}
                onDropdownToggle={setOpenDropdown}
                onOpenIdPasswordModal={() => modal.setIsIdPasswordModalOpen(true)}
                refs={refs}
              />

              {/* 연락처 정보 섹션 */}
              <ContactInfoSection
                formData={formData}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onDropdownToggle={setOpenDropdown}
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

              {/* 결제 정보 섹션 */}
              <PaymentInfoSection
                formData={formData}
                onInputChange={handlers.handleInputChange}
                eventId={params.eventId}
              />


              {/* 하단 안내사항 */}
              <BottomNoticeSection />

              {/* 제출 버튼 */}
              <SubmitButton
                isFormValid={isFormValid}
                isSubmitted={isSubmitted}
                isEditMode={isEditMode}
              />
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
      />
      
      {/* 오류 모달 */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          error.clearSubmitError();
        }}
        title="입력 정보 확인"
        message={error.submitError || ''}
        confirmText="확인"
      />
    </SubmenuLayout>
  );
}