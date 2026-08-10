"use client";

import React from "react";
import type { NotificationFormData } from "../types/notification";
import { SearchableSelect } from "@/components/common/Dropdown/SearchableSelect";
import {
  pinSelectedEventOption,
  useAdminEventSelect,
} from "@/hooks/useAdminEventSelect";

type Props = {
  formData: NotificationFormData;
  onChange: (data: NotificationFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  hideTargetSelection?: boolean;
};

export default function NotificationForm({
  formData,
  onChange,
  onSubmit: _onSubmit,
  isSubmitting: _isSubmitting = false,
  hideTargetSelection = false,
}: Props) {
  const {
    options: eventOptionsBase,
    eventsLoading,
    setKeyword: setEventSearchKeyword,
    hasMore,
    isLoadingMore,
    fetchNextPage,
    loadMoreLabel,
  } = useAdminEventSelect();

  const [selectedEventLabel, setSelectedEventLabel] = React.useState<
    string | null
  >(null);

  const eventOptions = React.useMemo(
    () =>
      pinSelectedEventOption(
        eventOptionsBase,
        formData.eventId != null ? String(formData.eventId) : null,
        selectedEventLabel
      ),
    [eventOptionsBase, formData.eventId, selectedEventLabel]
  );

  const paymentStatusOptions = React.useMemo(
    () => [
      { value: "", label: "전체 신청자" },
      { value: "UNPAID", label: "미결제" },
      { value: "COMPLETED", label: "결제완료" },
      { value: "MUST_CHECK", label: "확인필요" },
      { value: "NEED_PARTITIAL_REFUND", label: "차액환불요청" },
      { value: "NEED_REFUND", label: "전액환불요청" },
      { value: "REFUNDED", label: "전액환불완료" },
    ],
    []
  );

  const handleChange = (
    field: keyof NotificationFormData,
    value: string | number | undefined
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* 대상 선택 */}
      {!hideTargetSelection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전송 대상 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="targetType"
                value="all"
                checked={formData.targetType === "all"}
                onChange={(e) => handleChange("targetType", e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">전체 유저</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="targetType"
                value="event"
                checked={formData.targetType === "event"}
                onChange={(e) => handleChange("targetType", e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">대회별 전송</span>
            </label>
          </div>
        </div>
      )}

      {/* 대회 선택 및 결제 상태 선택 (대회별 전송일 경우) */}
      {formData.targetType === "event" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대회 선택 <span className="text-red-500">*</span>
            </label>
            <SearchableSelect<string | number>
              value={formData.eventId || null}
              options={eventOptions}
              onChange={(value) => {
                handleChange("eventId", value || undefined);
                setSelectedEventLabel(
                  eventOptions.find((o) => o.value === String(value))?.label ??
                    null
                );
              }}
              placeholder={
                eventsLoading ? "대회 목록 불러오는 중…" : "대회를 선택하세요"
              }
              searchable
              searchPlaceholder="대회명 검색..."
              className="w-full"
              onSearchChange={setEventSearchKeyword}
              onLoadMore={() => {
                void fetchNextPage();
              }}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              loadMoreLabel={loadMoreLabel}
              emptyMessage={
                eventsLoading ? "불러오는 중…" : "검색 결과가 없습니다."
              }
            />
          </div>

          {formData.eventId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 상태 선택
              </label>
              <SearchableSelect
                value={formData.paymentStatus || ""}
                options={paymentStatusOptions}
                onChange={(value) =>
                  handleChange("paymentStatus", value || undefined)
                }
                placeholder="전체 신청자"
                searchable={false}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                결제 상태를 선택하지 않으면 해당 대회의 모든 신청자에게
                전송됩니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="알림 제목을 입력하세요"
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/100자
        </p>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder="알림 내용을 입력하세요"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}
