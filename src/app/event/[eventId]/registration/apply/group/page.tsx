"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useEventRegistration } from "../shared/hooks/useEventRegistration";
import { useGroupForm } from "../shared/hooks/useGroupForm";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import ErrorAlert from "../shared/components/ErrorAlert";
import NoticeSection from "./components/NoticeSection";
import GroupInfoSection from "./components/GroupInfoSection";
import GroupContactInfoSection from "./components/GroupContactInfoSection";
import GroupPaymentInfoSection from "./components/GroupPaymentInfoSection";
import BottomNoticeSection from "./components/BottomNoticeSection";
import SubmitButton from "./components/SubmitButton";
import ParticipantsSection from "@/components/event/GroupRegistration/ParticipantsSection";

export default function GroupApplyPage({ params }: { params: { eventId: string } }) {
  const { eventInfo, isLoading: isLoadingEvent, error: eventError, refetch } = useEventRegistration(params.eventId);
  const {
    formData,
    setFormData,
    isGroupNameChecked,
    isGroupIdChecked,
    groupNameCheckResult,
    groupIdCheckResult,
    isEditMode,
    isLoading,
    isFormValid,
    openDropdown,
    setOpenDropdown,
    refs,
    handlers,
    error
  } = useGroupForm(params.eventId, eventInfo);

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체신청"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 상단 안내사항 */}
          <NoticeSection isEditMode={isEditMode} />

          {/* 단체신청 폼 */}
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
            <form className="space-y-12 sm:space-y-16" onSubmit={handlers.handleSubmit}>
              {/* 단체 정보 섹션 */}
              <GroupInfoSection
                formData={formData}
                onInputChange={handlers.handleInputChange}
                onAddressSelect={handlers.handleAddressSelect}
                onGroupNameCheck={handlers.handleGroupNameCheck}
                onGroupIdCheck={handlers.handleGroupIdCheck}
                groupNameCheckResult={groupNameCheckResult}
                groupIdCheckResult={groupIdCheckResult}
              />

              {/* 연락처 정보 섹션 */}
              <GroupContactInfoSection
                formData={formData}
                openDropdown={openDropdown}
                onInputChange={handlers.handleInputChange}
                onDropdownToggle={setOpenDropdown}
                refs={refs}
              />
                  
              {/* 참가자 정보 섹션 */}
              <ParticipantsSection
                participants={formData.participants}
                eventInfo={eventInfo}
                onParticipantsChange={handlers.handleParticipantsChange}
              />

              {/* 결제 정보 섹션 */}
              <GroupPaymentInfoSection
                formData={formData}
                onInputChange={handlers.handleInputChange}
                eventId={params.eventId}
              />

              {/* 하단 안내사항 */}
              <BottomNoticeSection />

              {/* 오류 메시지 */}
              {error.submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-red-600 text-sm">{error.submitError}</span>
                  </div>
                </div>
              )}

              {/* 제출 버튼 */}
              <SubmitButton
                isFormValid={isFormValid}
                isSubmitted={isLoading}
                isEditMode={isEditMode}
              />
            </form>
            )}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}