import React from "react";
import { cn } from "@/utils/cn";
import PaginationBar from "./PaginationBar";
import Pagination from "./Pagination";

type BarExtraProps = Omit<
  React.ComponentProps<typeof PaginationBar>,
  "page" | "total" | "pageSize" | "onChange"
>;

type PagerExtraProps = Omit<
  React.ComponentProps<typeof Pagination>,
  "page" | "total" | "pageSize" | "onChange"
> & {
  /** 숫자 페이징 정렬 (기본 center) */
  align?: "left" | "center" | "right";
};

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;

  /** 상단 바 커스터마이즈 (기본: 숫자는 바 밖에서) */
  bar?: BarExtraProps;

  /** 하단 숫자 페이징 커스터마이즈 */
  pager?: PagerExtraProps;

  className?: string;
};

export default function PaginationFull({
  page,
  total,
  pageSize,
  onChange,
  bar,
  pager,
  className,
}: Props) {
  const { align = "center", ...pagerRest } = pager ?? {};

  return (
    <div className={cn("w-full", className)}>
      {/* 상단 바 */}
      <PaginationBar
        page={page}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showNumbersInBar={false}
        {...bar}
      />

      {/* 하단 숫자 페이징 */}
      <div
        className={cn("mt-4", {
          "flex justify-start": align === "left",
          "flex justify-center": align === "center",
          "flex justify-end": align === "right",
        })}
      >
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onChange={onChange}
          {...pagerRest}
        />
      </div>
    </div>
  );
}
