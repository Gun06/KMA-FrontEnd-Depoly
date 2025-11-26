// src/components/admin/Table/BannerTable.tsx
// BaseTable을 복사해서 배너/스폰서/팝업 전용으로 수정
import React from "react";
import clsx from "clsx";

export type Column<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  width?: number | string;
  minWidth?: number; 
  /** TD(본문) 정렬: 기본 'left' */
  align?: "left" | "center" | "right";
  /** TH(헤더) 정렬: 기본 'center' */
  headerAlign?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => React.Key;
  headRowClassName?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
  zebra?: boolean;
  minWidth?: number | string;
};

export default function BannerTable<T>({
  columns,
  data,
  rowKey,
  headRowClassName,
  rowClassName,
  zebra = false,
  minWidth,
}: Props<T>) {
  const thAlign = (a?: "left" | "center" | "right") =>
    a === "left" ? "text-left" : a === "right" ? "text-right" : "text-center";

  const tdAlign = (a?: "left" | "center" | "right") =>
    a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

  return (
    <div className="hidden md:block w-full overflow-x-auto">
      <table
        className="w-full border-t border-[#E5E7EB]"
        style={minWidth ? { minWidth } : undefined}
      >
        <thead>
          <tr className={clsx(headRowClassName)}>
            {columns.map((c, i) => (
              <th
                key={String(c.key) + i}
                scope="col"
                style={{ width: c.width }}
                className={clsx(
                  "h-12 px-3 lg:px-4 font-medium",
                  // ✅ 헤더는 기본 '가운데'. 필요하면 column.headerAlign으로 개별 지정
                  thAlign(c.headerAlign ?? "center"),
                  c.headerClassName
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => {
            const zebraBg = zebra
              ? idx % 2 === 0
                ? "bg-white"
                : "bg-[#FAFAFA]"
              : "bg-white";
            return (
              <tr
                key={rowKey(row, idx)}
                tabIndex={-1}
                className={clsx(
                  "border-b border-[#F1F3F5] text-center outline-none hover:bg-[#F8FAFF] active:bg-transparent focus:bg-transparent",
                  zebraBg,
                  rowClassName?.(row, idx)
                )}
                onMouseDown={(e) => {
                  // 🔥 배너/스폰서/팝업 전용: input 요소에서는 preventDefault 하지 않음
                  const target = e.target as HTMLElement;
                  if (target.closest('input, textarea, select, button')) {
                    return;
                  }
                  e.preventDefault();
                }}
              >
                {columns.map((c, ci) => (
                  <td
                    key={String(c.key) + ci}
                    className={clsx(
                      "px-3 lg:px-4 py-3 text-[14px]",
                      // ✅ 본문은 기본 '왼쪽'. 필요하면 column.align으로 개별 지정
                      tdAlign(c.align ?? "left"),
                      c.className
                    )}
                  >
                    {c.render ? c.render(row, idx) : String(row[c.key as keyof T] || '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
