import React from "react";
import { cn } from "@/utils/cn";

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  groupSize?: number;          // 수동 고정값
  responsive?: boolean;        // ✅ 뷰포트에 따라 자동으로 개수 조절
  showEdge?: boolean;
  className?: string;
};

export default function Pagination({
  page,
  total,
  pageSize,
  onChange,
  groupSize = 10,
  responsive = true,          // 기본 켬
  showEdge = true,
  className,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);

  // ✅ 뷰포트에 따른 groupSize 계산 (Tailwind 기본 브레이크포인트 기준)
  const [vw, setVw] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const effGroup =
    responsive
      ? (vw < 640 ? 5 : vw < 768 ? 6 : vw < 1024 ? 7 : 10)
      : groupSize;

  // 그룹 계산
  const start = Math.floor((current - 1) / effGroup) * effGroup + 1;
  const end = Math.min(start + effGroup - 1, pageCount);

  const canPrevPage = current > 1;
  const canNextPage = current < pageCount;
  const canPrevGroup = start > 1;
  const canNextGroup = end < pageCount;

  const goto = (p: number) => {
    const clamped = Math.min(Math.max(1, p), pageCount);
    if (clamped !== current) onChange(clamped);
  };

  // 버튼 스타일
  const numBtn = (active: boolean) =>
    cn(
      "inline-flex items-center justify-center rounded-full",
      // 크기도 살짝 반응형
      "w-[26px] h-[26px] text-xs font-extrabold",
      "sm:w-7 sm:h-7 sm:text-[13px]",
      "md:w-[30px] md:h-[30px] md:text-[15px]",
      active ? "bg-black text-white" : "text-[#111827] hover:bg-[#F3F4F6] bg-white"
    );

  const iconBtn = (disabled: boolean) =>
    cn(
      "inline-flex items-center justify-center rounded-full",
      "w-[26px] h-[26px] sm:w-7 sm:h-7 md:w-[30px] md:h-[30px]",
      "text-[#9CA3AF] hover:bg-[#F3F4F6]",
      disabled && "opacity-40 pointer-events-none"
    );

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn(
        "flex items-center",
        // 컨테이너 간격도 축소
        "gap-2 sm:gap-3 md:gap-4 xl:gap-[60px]",
        className
      )}
    >
      {/* 왼쪽 아이콘들 */}
      <div className="flex items-center gap-[9px]">
        {showEdge && (
          <button
            aria-label="첫 페이지"
            className={iconBtn(!canPrevPage)}
            onClick={() => goto(1)}
            disabled={!canPrevPage}
          >
            <IconEnd dir="left" />
          </button>
        )}
        <button
          aria-label="이전 그룹"
          className={iconBtn(!canPrevGroup)}
          onClick={() => goto(Math.max(1, start - effGroup))}
          disabled={!canPrevGroup}
        >
          <IconDblChevron dir="left" />
        </button>
      </div>

      {/* 숫자 버튼들 */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 md:h-[30px]">
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
          <button
            key={p}
            aria-current={p === current ? "page" : undefined}
            className={numBtn(p === current)}
            onClick={() => goto(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-[9px]">
        <button
          aria-label="다음 그룹"
          className={iconBtn(!canNextGroup)}
          onClick={() => goto(Math.min(pageCount, start + effGroup))}
          disabled={!canNextGroup}
        >
          <IconDblChevron />
        </button>
        {showEdge && (
          <button
            aria-label="마지막 페이지"
            className={iconBtn(!canNextPage)}
            onClick={() => goto(pageCount)}
            disabled={!canNextPage}
          >
            <IconEnd />
          </button>
        )}
      </div>
    </nav>
  );
}

// »» / ««
function IconDblChevron({ dir = "right" }: { dir?: "left" | "right" }) {
  const isLeft = dir === "left";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {isLeft ? (
        <g transform="matrix(-1 0 0 1 24 0)">
          <path d="M8 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <>
          <path d="M8 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

// >| / |<
function IconEnd({ dir = "right" }: { dir?: "left" | "right" }) {
  const isLeft = dir === "left";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {isLeft ? (
        <g transform="matrix(-1 0 0 1 24 0)">
          <path d="M4 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : (
        <>
          <path d="M4 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
