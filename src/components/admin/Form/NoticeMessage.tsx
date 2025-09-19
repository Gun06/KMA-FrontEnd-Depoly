// src/components/common/NoticeMessage.tsx
import React from "react";
import { cn } from "@/utils/cn";

type NoticeItem = {
  text: string;
  highlight?: boolean; // 강조(빨간색)
};

interface NoticeMessageProps {
  items: NoticeItem[];
  className?: string;
}

export default function NoticeMessage({ items, className }: NoticeMessageProps) {
  return (
    <div className={cn("space-y-1 text-sm leading-6", className)}>
      {items.map((item, idx) => (
        <p
          key={idx}
          className={cn(
            "whitespace-pre-line text-[14px]", // ✅ 고정 14px
            item.highlight ? "text-red-500 font-medium" : "text-gray-500"
          )}
        >
          {item.text}
        </p>
      ))}
    </div>
  );
}
