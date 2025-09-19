import React, { useRef } from "react";
import { cn } from "@/utils/cn";

const OpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={cn("inline-block", className)} fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#256EF4" strokeWidth="2" />
    <path d="M9 15L15 9" stroke="#256EF4" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 9H15V14" stroke="#256EF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Props = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected?: (files: FileList) => void;
  label?: React.ReactNode;
  className?: string;

  /** 버튼 크기: md(기존 197×40), compact(70×40) */
  size?: "md" | "compact";
  /** 아이콘 표시 여부 (기본: true) */
  showIcon?: boolean;
};

export default function UploadButton({
  accept,
  multiple = true,
  disabled,
  onFilesSelected,
  label = "대표 이미지 업로드",
  className,
  size = "md",
  showIcon,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => !disabled && inputRef.current?.click();

  // md/compact 모두 기본 아이콘 표시
  const shouldShowIcon = showIcon ?? true;

  // 크기별 클래스
  const containerSizeCls =
    size === "compact"
      ? "h-10 w-[90px]"
      : "h-9 w-[180px] md:h-10 md:w-[197px]";

  const contentCls =
    size === "compact"
      ? "h-6 w-auto px-2 justify-center gap-1"
      : "h-6 w-[150px] md:w-[153px] justify-between";

  // 언더라인은 hover 에만
  const textCls =
    size === "compact"
      ? "text-[14px] leading-[24px] hover:underline text-[#256EF4] whitespace-nowrap"
      : "text-[14px] md:text-[16px] leading-[24px] hover:underline text-[#256EF4] whitespace-nowrap";

  const iconCls = size === "compact" ? "h-4 w-4" : "h-5 w-5 md:h-6 md:w-6";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          if (e.currentTarget.files && onFilesSelected) {
            onFilesSelected(e.currentTarget.files);
            e.currentTarget.value = ""; // 같은 파일 다시 선택 가능하도록 리셋
          }
        }}
      />

      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className={cn(
          "box-border inline-flex items-center justify-center rounded-[12px] border border-[#B1B8BE]",
          containerSizeCls,
          "px-0 disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className={cn("flex items-center", contentCls)}>
          <span className={cn("flex items-center", textCls)}>{label}</span>
          {shouldShowIcon && <OpenIcon className={iconCls} />}
        </span>
      </button>
    </>
  );
}
