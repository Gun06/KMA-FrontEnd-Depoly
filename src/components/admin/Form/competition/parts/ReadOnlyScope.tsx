// src/components/admin/forms/parts/ReadOnlyScope.tsx
"use client";
import React from "react";
import { cn } from "@/utils/cn";

export default function ReadOnlyScope({
  readOnly,
  className,
  children,
}: {
  readOnly: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // 값(필드)만 회색, 라벨 컬럼은 원래 스타일 유지 → 섹션 내부에서 필드에만 색상클래스 주입
  return (
    <div className={cn(readOnly && "pointer-events-none", className)}>
      {children}
    </div>
  );
}
