"use client";

import React from "react";
import InlineLabelPairRow from "@/components/admin/Form/InlineLabelPairRow";
import FormRow from "@/components/admin/Form/FormRow";
import TextField from "@/components/common/TextField/TextField";
import { RadioGroup } from "@/components/common/Radio/RadioGroup";
import BirthDateInput from "@/components/common/FormField/BirthDateInput";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import type { Gallery } from "@/data/gallery/types";

type Props = {
  value: Gallery;
  onChange?: (next: Gallery) => void;
  readOnly?: boolean;
  fieldCls?: string;
  inputColorCls?: string;
  dense?: boolean;
  className?: string;
};

export default function GalleryForm({
  value,
  onChange,
  readOnly = false,
  fieldCls = "w-full",
  inputColorCls,
  dense = false,
  className,
}: Props) {
  const patch = (p: Partial<Gallery>) => onChange?.({ ...value, ...p });

  const dimCls = readOnly ? "text-[#646464]" : "text-black";
  const readOnlyInputCls = "!border-0 !ring-0 !outline-none bg-transparent";
  const computedInputCls = inputColorCls ?? (readOnly ? readOnlyInputCls : "");
  const pad = dense ? "p-0" : "p-4";

  // 텍스트 입력 전용 회색 톤(placeholder 포함)
  const textDimCls = readOnly ? "text-[#646464] placeholder:text-[#9CA3AF]" : "";

  type Visible = "on" | "off";
  const visibleValue: Visible = value.visible ? "on" : "off";
  const visibleNoop = (_v: Visible) => {};

  return (
    <div className={`max-w-[1300px] mx-auto w-full ${className ?? ""}`}>
      <div className="border-t border-r border-b border-[#E5E7EB]">
        <div className="divide-y divide-[#E5E7EB]">
          {/* 1) 대회 태그명 / 대회명 */}
          <div className={pad}>
            <InlineLabelPairRow
              leftLabel="대회 태그명"
              rightLabel="대회명"
              leftField={
                <TextField
                  placeholder="대회 태그명을 입력하세요."
                  value={value.tagName}
                  onChange={(e) =>
                    readOnly ? undefined : patch({ tagName: e.currentTarget.value })
                  }
                  className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                  readOnly={readOnly}
                />
              }
              rightField={
                <TextField
                  placeholder="하단에 표시될 대회명을 입력하세요."
                  value={value.title}
                  onChange={(e) =>
                    readOnly ? undefined : patch({ title: e.currentTarget.value })
                  }
                  className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                  readOnly={readOnly}
                />
              }
            />
          </div>

          {/* 2) 공개여부 */}
          <div className={pad}>
            <FormRow label="공개여부" contentClassName="items-center pl-4">
              <div
                className={
                  readOnly
                    ? "text-[#646464] [&_label]:text-[#646464] [&_label]:opacity-100 [&_input:disabled+label]:opacity-100"
                    : ""
                }
              >
                <RadioGroup<Visible>
                  name={`gallery-visible-${value.eventId}`}
                  value={visibleValue}
                  onValueChange={readOnly ? visibleNoop : (v) => patch({ visible: v === "on" })}
                  gapPx={40}
                  options={[
                    { value: "on", label: "공개" },
                    { value: "off", label: "비공개" },
                  ]}
                  disabled={readOnly}
                />
              </div>
            </FormRow>
          </div>

          {/* 3) 대회기간 */}
          <div className={pad}>
            <FormRow label="대회기간" contentClassName="items-left mr-auto">
              <div className="flex items-center gap-3">
                <div className="min-w-[240px]">
                  <BirthDateInput
                    value={value.periodFrom}
                    onChange={readOnly ? undefined : (v) => patch({ periodFrom: v })}
                    placeholder="YYYY.MM.DD"
                    variant="flat"
                    className={`w-full ${dimCls}`}
                    disabled={readOnly}
                    readOnly={readOnly}
                  />
                </div>
                <span className="text-center">~</span>
                <div className="min-w-[240px]">
                  <BirthDateInput
                    value={value.periodTo}
                    onChange={readOnly ? undefined : (v) => patch({ periodTo: v })}
                    placeholder="YYYY.MM.DD"
                    variant="flat"
                    className={`w-full ${dimCls}`}
                    disabled={readOnly}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </FormRow>
          </div>

          {/* 4) 구글포토 URL */}
          <div className={pad}>
            <FormRow label="구글포토 URL">
              <TextField
                placeholder="https://photos.google.com/..."
                value={value.googlePhotosUrl ?? ""}
                onChange={(e) =>
                  readOnly ? undefined : patch({ googlePhotosUrl: e.currentTarget.value })
                }
                className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                readOnly={readOnly}
              />
            </FormRow>
          </div>
        </div>
      </div>

      {/* 하단 노티스 */}
      <div className="flex mx-auto px-4 mt-10 mb-10">
        <NoticeMessage
          items={[
            { text: "※ 이미지는 jpg, jpeg, png만 지원합니다." },
            { text: "※ 실제 사이즈는 1200px × 200px을 지원합니다." },
            {
              text:
                "다만, 해상도 문제로 인하여 업로드는 각 2배인 2400px × 400px로 작업하여 업로드 부탁드립니다.",
              highlight: true,
            },
          ]}
        />
      </div>
    </div>
  );
}
