// src/components/common/Form/FormTable.tsx
"use client";
import React from "react";
import { FormLayoutProvider } from "./FormLayoutContext";
import { cn } from "@/utils/cn";

export default function FormTable({
  title,
  children,
  className,
  labelWidth = 240,
  tightRows = false,
  maxWidth,
  center = false,
  actions,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  labelWidth?: number;
  tightRows?: boolean;
  maxWidth?: number;
  center?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <section
      className={cn("w-full", className)}
      style={{
        maxWidth: maxWidth ?? undefined,
        marginInline: center ? "auto" : undefined,
      }}
    >
      {/* 타이틀 + 액션(우측 정렬) */}
      {title && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {typeof title === 'string' ? (
              <h1 className="text-lg font-semibold">{title}</h1>
            ) : (
              title
            )}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}

      <FormLayoutProvider labelWidth={labelWidth} tightRows={tightRows}>
        {/* overflow-hidden 제거: 드롭다운/팝오버가 테이블 밖으로 자연스럽게 보이도록 */}
        <div className="w-full border border-neutral-300 rounded-sm">
          <div className="w-full divide-y divide-neutral-300 bg-white">{children}</div>
        </div>
      </FormLayoutProvider>
    </section>
  );
}
