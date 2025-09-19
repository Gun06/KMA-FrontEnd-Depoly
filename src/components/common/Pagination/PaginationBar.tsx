// src/components/ui/Pagination/PaginationBar.tsx
import React from "react";
import Pagination from "./Pagination";
import { cn } from "@/utils/cn";

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  /** 바 안에 숫자 페이징을 표시할지 (기본 false: 바 밖에서 따로 배치) */
  showNumbersInBar?: boolean;
  showTotalText?: boolean;
  showPageIndicator?: boolean;
  className?: string;
};

export default function PaginationBar({
  page,
  total,
  pageSize,
  onChange,
  showNumbersInBar = false,
  showTotalText = true,
  showPageIndicator = true,
  className,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className={cn("w-full", className)}>
      {/* 상단 라인만 고정 */}
      <div className="h-px bg-[#E5E7EB]" />

      {/* 바: 항상 좌/우 분리 (모바일에서도 파이프 결합 안 함) */}
      <div className="py-2 sm:py-3">
        <div
          className={cn(
            "flex items-center justify-between",
            "gap-2 sm:gap-4" // 좁아질수록 간격만 줄어듦
          )}
        >
          <div className="text-xs sm:text-sm text-[#111827]">
            {showTotalText && (
              <>총 <b>{total.toLocaleString()}</b>개의 게시물</>
            )}
          </div>

          {showNumbersInBar && (
            <div className="flex-1 flex justify-center">
              <Pagination
                page={page}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                groupSize={10}
                showEdge
              />
            </div>
          )}

          <div className="text-xs sm:text-sm text-[#111827] text-right">
            {showPageIndicator && (
              <>페이지 <b>{page}</b>/{pageCount}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
