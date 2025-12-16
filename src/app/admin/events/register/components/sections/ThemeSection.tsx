// src/app/admin/events/register/components/sections/ThemeSection.tsx
"use client";
import React from "react";
import { cn } from "@/utils/cn";
import FormTable from "@/components/admin/Form/FormTable";
import { RadioGroup } from "@/components/common/Radio/RadioGroup";
import Segmented from "../parts/Segmented";
import { PREVIEW_BG, THEME_BASE_OPTIONS, THEME_GRAD_OPTIONS } from "../parts/theme";
import type { useCompetitionForm } from "../../hooks/useCompetitionForm";

type FormHandle = ReturnType<typeof useCompetitionForm>;

export default function ThemeSection({
  f,
  readOnly,
}: {
  f: FormHandle;
  readOnly: boolean;
}) {
  const noop = () => {};
  const optionTextCls = readOnly ? "text-[#646464]" : "text-black";

  return (
    <FormTable title="대회 색상" labelWidth={200} center>
      <div className="grid" style={{ gridTemplateColumns: `200px 1fr` }}>
        <div
          className="bg-[#4D4D4D] text-white text-[16px] flex items-center justify-center border-right border-neutral-300"
          style={{ gridRow: "span 2", minHeight: 120 }}
        >
          대회색상
        </div>

        <div className="bg-white flex items-center px-4 min-h-[60px]">
          <div className={readOnly ? "pointer-events-none opacity-70" : ""}>
            <Segmented
              value={f.themeStyle}
              onChange={readOnly ? noop : (v) => f.setThemeStyle(v as "base" | "grad")}
              items={[
                { value: "base", label: "일반" },
                { value: "grad", label: "그라데이션" },
              ]}
            />
          </div>
        </div>

        <div className="bg-white flex items-center px-4 pt-2 min-h-[60px]">
          <div className="flex flex-col gap-4 w-full pb-2">
            {f.themeStyle === "base" ? (
              <div className={optionTextCls}>
                <RadioGroup
                  name={`${f.uid}-theme-base`}
                  value={f.baseColor}
                  onValueChange={readOnly ? noop : f.setBaseColor}
                  gapPx={40}
                  options={THEME_BASE_OPTIONS}
                  className={optionTextCls}        // (RadioGroup이 className 받으면 적용)
                />
              </div>
            ) : (
              <div className={optionTextCls}>
                <RadioGroup
                  name={`${f.uid}-theme-grad`}
                  value={f.gradColor}
                  onValueChange={readOnly ? noop : f.setGradColor}
                  gapPx={40}
                  options={THEME_GRAD_OPTIONS}
                  className={optionTextCls}        // (RadioGroup이 className 받으면 적용)
                />
              </div>
            )}

            <div
              className={cn(
                "w-full h-8 rounded-md ring-1 ring-black/10",
                PREVIEW_BG[f.finalEventTheme]
              )}
            />
          </div>
        </div>
      </div>
    </FormTable>
  );
}
