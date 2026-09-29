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
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-200 px-4 py-3">
            <h3 className="text-[15px] font-semibold text-gray-900">알림 등록</h3>
            <p className="text-[13px] text-gray-500">
              {formData.targetType === "event"
                ? "대회 신청자에게 알림을 전송합니다."
                : "전체 유저에게 알림을 전송합니다."}
            </p>
          </div>

          <div className="px-4 py-4">
            <NotificationForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              hideTargetSelection={hideTargetSelection}
            />
          </div>

          <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-gray-50/60 px-4 py-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="!h-9 !px-4 !text-[13px]"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.content}
              className="!h-9 !px-4 !text-[13px]"
            >
              {isSubmitting ? "전송 중..." : "알림 전송"}
            </Button>
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white xl:sticky xl:top-16">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-[15px] font-semibold text-gray-900">푸시 미리보기</h3>
          </div>
          <div className="bg-gray-50/60 p-4">
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-[#1E5EFF] text-[9px] font-bold text-white">
                  전
                </span>
                전마협
                <span className="ml-auto">지금</span>
              </div>
              <p className="truncate text-[13px] font-semibold text-gray-900">
                {formData.title || "알림 제목"}
              </p>
              <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-[12px] leading-[18px] text-gray-600">
                {formData.content || "알림 내용이 여기에 표시됩니다."}
              </p>
            </div>
            <p className="mt-3 text-[12px] text-gray-500">
              기기·OS에 따라 제목과 내용이 잘려 보일 수 있습니다.
            </p>
          </div>
        </aside>
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
    </main>
  );
}
