import React from "react";
import { cn } from "@/utils/cn";

type Props = {
  title?: string;     // 굵은 제목 (옵션)
  message: string;    // 본문 메시지
  className?: string; // 여유 스타일
};

export default function ErrorMessage({ title, message, className }: Props) {
  return (
    <div
      className={cn(
        "text-sm text-[#B42318]",
        className
      )}
    >
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="whitespace-pre-line">{message}</div>
    </div>
  );
}
