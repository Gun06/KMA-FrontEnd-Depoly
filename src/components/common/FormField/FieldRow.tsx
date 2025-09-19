import { cn } from "@/utils/cn";
import React from "react";

export function FieldRow({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-12 gap-4 items-center", className)}>
      {children}
    </div>
  );
}

// 1~12 모두 허용 + Tailwind safelist용 매핑
const COL_MAP = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
} as const;

type Span = keyof typeof COL_MAP;

export function Col({
  span = 12,
  className,
  children,
}: {
  span?: Span;
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn(COL_MAP[span], className)}>{children}</div>;
}