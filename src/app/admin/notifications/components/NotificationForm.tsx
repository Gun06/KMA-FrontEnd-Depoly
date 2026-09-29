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

  const labelCls = "mb-1.5 flex items-center text-[13px] font-medium text-gray-700";
  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 text-[13px] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const selectCls = "w-full [&>button]:!h-9 [&>button]:!text-[13px]";

  const handleChange = (
    field: keyof NotificationFormData,
    value: string | number | undefined
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {!hideTargetSelection && (
        <div>
          <div className={labelCls}>
            전송 대상 <span className="ml-0.5 text-red-500">*</span>
          </div>
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5" role="radiogroup">
            {([
              { value: "all", label: "전체 유저" },
              { value: "event", label: "대회별 전송" },
            ] as const).map((opt) => {
              const active = formData.targetType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleChange("targetType", opt.value)}
                  className={`h-8 rounded px-4 text-[13px] transition-colors ${
                    active
                      ? "bg-white font-semibold text-[#1E5EFF] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 대회 선택 및 결제 상태 선택 (대회별 전송일 경우) */}
      {formData.targetType === "event" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className={labelCls}>
              대회 선택 <span className="ml-0.5 text-red-500">*</span>
            </div>
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
              className={selectCls}
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
              <div className={labelCls}>결제 상태 선택</div>
              <SearchableSelect
                value={formData.paymentStatus || ""}
                options={paymentStatusOptions}
                onChange={(value) =>
                  handleChange("paymentStatus", value || undefined)
                }
                placeholder="전체 신청자"
                searchable={false}
                className={selectCls}
              />
              <p className="mt-1 text-[12px] text-gray-500">
                결제 상태를 선택하지 않으면 해당 대회의 모든 신청자에게
                전송됩니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 제목 */}
      <div>
        <div className={labelCls}>
          제목 <span className="ml-0.5 text-red-500">*</span>
          <span className="ml-auto text-[12px] font-normal text-gray-400">
            {formData.title.length}/100자
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="알림 제목을 입력하세요"
          className={`${inputCls} h-9`}
          maxLength={100}
        />
      </div>

      {/* 내용 */}
      <div>
        <div className={labelCls}>
          내용 <span className="ml-0.5 text-red-500">*</span>
          <span className="ml-auto text-[12px] font-normal text-gray-400">
            {formData.content.length}자
          </span>
        </div>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder="알림 내용을 입력하세요"
          rows={8}
          className={`${inputCls} resize-y py-2 leading-5`}
        />
      </div>
    </div>
  );
}
