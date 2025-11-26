'use client';

import React, { useState, useRef } from "react";

type Option = { label: string; onClick: () => void };
type Align = "left" | "center" | "right";

/** 문서 전역 리스너 없이 백드롭으로 외부 클릭 닫기 (폼 안에서도 안전) */
export const Dropdown = ({
  buttonLabel,
  options,
  trigger,
  align = "right",
  className = "",
}: {
  buttonLabel?: string;
  options: Option[];
  trigger?: React.ReactNode;
  align?: Align;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pos =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "left"
      ? "left-0"
      : "right-0";

  return (
    <div className={`relative ${className}`}>
      {trigger ? (
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
        >
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          {buttonLabel ?? "메뉴"}
        </button>
      )}

      {/* 백드롭: 외부 클릭 닫기 */}
      {isOpen && (
        <button
          type="button"
          aria-hidden
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 메뉴 */}
      {isOpen && (
        <div
          role="menu"
          className={`absolute ${pos} mt-2 min-w-44 bg-white border rounded-xl shadow-lg ring-1 ring-black/5 z-50`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-2">
            {options.map((opt) => (
              <li key={opt.label}>
                <button
                  type="button"  // ✅ 폼 제출 방지
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    opt.onClick();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
