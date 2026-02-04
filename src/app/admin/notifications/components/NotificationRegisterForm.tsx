"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/common/Button/Button";
import NotificationForm from "./NotificationForm";
import {
  sendNotificationToAllUsers,
  sendNotificationToEvent,
} from "../api/notificationApi";
import type { NotificationFormData } from "../types/notification";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";

type Props = {
  initialTargetType?: "all" | "event";
  initialEventId?: string;
  hideTargetSelection?: boolean;
  onSuccessRedirect?: (formData: NotificationFormData) => string;
};

export default function NotificationRegisterForm({
  initialTargetType = "all",
  initialEventId,
  hideTargetSelection = false,
  onSuccessRedirect,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState<NotificationFormData>({
    title: "",
    content: "",
    targetType: initialTargetType,
    eventId: initialEventId,
    paymentStatus: undefined,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successModal, setSuccessModal] = React.useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });
  const [errorModal, setErrorModal] = React.useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      setErrorModal({
        isOpen: true,
        message: "제목과 내용을 모두 입력해주세요.",
      });
      return;
    }

    if (formData.targetType === "event" && !formData.eventId) {
      setErrorModal({
        isOpen: true,
        message: "대회를 선택해주세요.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        title: formData.title,
        content: formData.content,
        ...(formData.paymentStatus && { paymentStatus: formData.paymentStatus }),
      };

      if (formData.targetType === "event" && formData.eventId) {
        await sendNotificationToEvent(formData.eventId, requestData);
        // 대회별 알림 목록 캐시 무효화
        queryClient.invalidateQueries({ 
          queryKey: ['notifications', 'event', formData.eventId] 
        });
      } else {
        await sendNotificationToAllUsers(requestData);
        // 전체 알림 목록 캐시 무효화
        queryClient.invalidateQueries({ 
          queryKey: ['notifications', 'global'] 
        });
      }

      setSuccessModal({
        isOpen: true,
        message: "알림이 성공적으로 전송되었습니다.",
      });
    } catch (error) {
      console.error("알림 전송 실패:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알림 전송 중 오류가 발생했습니다.";
      setErrorModal({
        isOpen: true,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getRedirectPath = () => {
    if (onSuccessRedirect) {
      return onSuccessRedirect(formData);
    }
    if (formData.targetType === "event" && formData.eventId) {
      return `/admin/notifications/events/${formData.eventId}`;
    }
    return "/admin/notifications/all";
  };

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">알림 등록</h1>
        <p className="mt-1 text-sm text-gray-600">
          {formData.targetType === "event"
            ? "대회 신청자에게 알림을 전송합니다."
            : "전체 유저에게 알림을 전송합니다."}
        </p>
      </div>

      {/* 알림 등록 폼 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <NotificationForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          hideTargetSelection={hideTargetSelection}
        />

        {/* 버튼 영역 */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.content}
            className="px-6 py-2"
          >
            {isSubmitting ? "전송 중..." : "알림 전송"}
          </Button>
        </div>
      </div>

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={successModal.isOpen}
        title="알림 전송 완료"
        message={successModal.message}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: "" });
          router.push(getRedirectPath());
        }}
      />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
      />
    </div>
  );
}
