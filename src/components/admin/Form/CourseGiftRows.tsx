// src/components/admin/Form/CourseGiftRows.tsx
'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import TextField from '@/components/common/TextField/TextField';
import { Plus, Minus } from 'lucide-react';
import MiniToggle from '@/components/common/Toggle/MiniToggle';

export type CourseItem = { name: string; price: string; isActive?: boolean };
export type GiftItem = { label: string; size: string; isActive?: boolean };
export type CourseGroup = { course: CourseItem; gifts: GiftItem[] };

type Props = {
  groups: CourseGroup[];
  // 코스
  onAddCourse?: () => void;
  onRemoveCourse?: (groupIndex: number) => void;
  onChangeCourseName: (groupIndex: number, value: string) => void;
  onChangeCoursePrice?: (groupIndex: number, value: string) => void;
  onToggleCourseEnabled?: (groupIndex: number, enabled: boolean) => void;
  // 기념품
  onAddGift?: (groupIndex: number) => void;
  onRemoveGift?: (groupIndex: number, giftIndex: number) => void;
  onChangeGiftLabel: (
    groupIndex: number,
    giftIndex: number,
    value: string
  ) => void;
  onChangeGiftSize: (
    groupIndex: number,
    giftIndex: number,
    value: string
  ) => void;
  onToggleGiftEnabled?: (
    groupIndex: number,
    giftIndex: number,
    enabled: boolean
  ) => void;

  /** 읽기 모드 */
  readOnly?: boolean;
  className?: string;
};

export default function CourseGiftRows({
  groups,
  onAddCourse,
  onRemoveCourse,
  onChangeCourseName,
  onChangeCoursePrice,
  onToggleCourseEnabled,
  onAddGift,
  onRemoveGift,
  onChangeGiftLabel,
  onChangeGiftSize,
  onToggleGiftEnabled,
  readOnly = false,
  className,
}: Props) {
  const textCls = readOnly ? 'text-[#646464]' : 'text-neutral-900';
  const fieldBase =
    'w-full text-[16px] bg-white border-0 outline-none focus:ring-0 shadow-none';

  const isLastGroup = (index: number) => index === groups.length - 1;
  const showAddCourseAtBottom = !!onAddCourse && !readOnly;

  return (
    <div className={cn('space-y-4', className)} aria-readonly={readOnly}>
      {groups.map((g, gi) => {
        const showRemoveCourse = !!onRemoveCourse && !readOnly;
        const isCourseActive = g.course.isActive !== false; // 기본값은 true

        return (
          <div key={gi} className="flex items-start gap-3">
            {/* 참가부문 카드 */}
            <div className={cn(
              "flex-1 border border-neutral-300 rounded-lg overflow-hidden",
              isCourseActive ? "bg-white" : "bg-gray-200 opacity-70"
            )}>
              {/* 참가부문 헤더 */}
              <div className={cn(
                "text-white px-4 py-1.5 grid items-center gap-4",
                isCourseActive ? "bg-[#4D4D4D]" : "bg-[#3D3D3D]",
                !readOnly && onToggleCourseEnabled
                  ? "grid-cols-[auto_auto_1fr_auto_1fr_auto]"
                  : "grid-cols-[auto_1fr_auto_1fr_auto]"
              )}>
                {/* 토글 (수정 모드에서만 표시) */}
                {!readOnly && onToggleCourseEnabled && (
                  <div className="shrink-0">
                    <MiniToggle
                      value={isCourseActive}
                      onChange={(enabled) => onToggleCourseEnabled?.(gi, enabled)}
                      disabled={readOnly}
                    />
                  </div>
                )}
                <span className="text-sm font-medium whitespace-nowrap shrink-0">참가부문</span>
                <TextField
                  value={g.course.name}
                  onChange={e => onChangeCourseName(gi, e.currentTarget.value)}
                  variant="flat"
                  size="sm"
                  className="w-full !text-white placeholder:text-white/50 !bg-white/10 rounded border border-white/20 outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 shadow-none"
                  readOnly={readOnly || !isCourseActive}
                  placeholder="참가부문을 입력하세요. 예) 22km|짝궁마라톤"
                />
                <span className="text-sm font-medium whitespace-nowrap shrink-0">참가비</span>
                <TextField
                  inputMode="numeric"
                  value={g.course.price}
                  onChange={e => onChangeCoursePrice?.(gi, e.currentTarget.value)}
                  variant="flat"
                  size="sm"
                  className="w-full !text-white placeholder:text-white/50 !bg-white/10 rounded border border-white/20 outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 shadow-none"
                  readOnly={readOnly || !isCourseActive}
                  placeholder="금액(숫자만)"
                />
                {/* 삭제 버튼 영역을 위한 빈 공간 (기념품 삭제 버튼과 동일한 크기) */}
                <div className="h-7 w-7 shrink-0" />
              </div>

              {/* 기념품 섹션 */}
              <div className="bg-neutral-50 border-t border-neutral-200">
                <div className="px-4 py-1.5 border-b border-neutral-200 bg-neutral-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">기념품</span>
                    {onAddGift && !readOnly && (
                      <button
                        type="button"
                        onClick={() => onAddGift?.(gi)}
                        className="h-6 px-2.5 inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-md transition-colors"
                        aria-label="기념품 추가"
                      >
                        <Plus size={12} strokeWidth={2.25} />
                        기념품 추가
                      </button>
                    )}
                  </div>
                </div>

                {/* 기념품 목록 */}
                <div className="divide-y divide-neutral-200">
                  {g.gifts.map((gift, gj) => {
                    const isGiftActive = gift.isActive !== false; // 기본값은 true
                    return (
                      <div
                        key={gj}
                        className={cn(
                          "px-4 py-1.5 grid items-center gap-4 border-l-2",
                          !isCourseActive 
                            ? "bg-neutral-50/50 border-l-red-300 opacity-70" // 종목이 마감된 경우: 원래 배경색 + 빨간색 왼쪽 테두리 + 반투명
                            : isGiftActive 
                              ? "bg-neutral-50/50 border-l-transparent" 
                              : "bg-gray-200 border-l-red-300 opacity-70", // 기념품만 마감된 경우: 진한 회색 배경 + 빨간색 왼쪽 테두리 + 반투명
                          !readOnly && onToggleGiftEnabled
                            ? "grid-cols-[auto_auto_1fr_auto_1fr_auto]"
                            : "grid-cols-[auto_1fr_auto_1fr_auto]"
                        )}
                      >
                        {/* 토글 (수정 모드에서만 표시) */}
                        {!readOnly && onToggleGiftEnabled && (
                          <div className="shrink-0">
                            <MiniToggle
                              value={isGiftActive}
                              onChange={(enabled) => onToggleGiftEnabled?.(gi, gj, enabled)}
                              disabled={readOnly || !isCourseActive}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">기념품명</span>
                        </div>
                      <TextField
                        value={gift.label}
                        onChange={e =>
                          onChangeGiftLabel(gi, gj, e.currentTarget.value)
                        }
                        size="sm"
                        className={cn(
                          fieldBase,
                          'w-full border border-neutral-300 rounded-md px-2.5 py-1 text-sm',
                          textCls
                        )}
                        readOnly={readOnly || !isGiftActive || !isCourseActive}
                        placeholder="기념품을 입력하세요. 예) 나이키 운동화 240"
                      />
                      <span className="text-sm font-medium text-neutral-700 whitespace-nowrap shrink-0">사이즈</span>
                      <TextField
                        value={gift.size}
                        onChange={e =>
                          onChangeGiftSize(gi, gj, e.currentTarget.value)
                        }
                        size="sm"
                        className={cn(
                          fieldBase,
                          'w-full border border-neutral-300 rounded-md px-2.5 py-1 text-sm',
                          textCls
                        )}
                        readOnly={readOnly || !isGiftActive || !isCourseActive}
                        placeholder="사이즈(예: S|M|240 등)"
                      />
                      {onRemoveGift && !readOnly && (
                        <button
                          type="button"
                          onClick={() => onRemoveGift?.(gi, gj)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                          aria-label="기념품 삭제"
                        >
                          <Minus size={14} strokeWidth={2.25} />
                        </button>
                      )}
                    </div>
                    );
                  })}
                  {g.gifts.length === 0 && (
                    <div className="px-4 py-4 text-center text-sm text-neutral-500">
                      등록된 기념품이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 참가부문 삭제 버튼 - 카드 바깥쪽 */}
            {showRemoveCourse && (
              <div className="flex items-center h-[70px]">
                <button
                  type="button"
                  onClick={() => onRemoveCourse?.(gi)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={readOnly}
                  aria-label="참가부문 삭제"
                >
                  <Minus size={16} strokeWidth={2.25} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      
      {/* 참가부문 추가 버튼 - 제일 아래 */}
      {showAddCourseAtBottom && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onAddCourse}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-blue-100 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={readOnly}
            aria-label="참가부문 추가"
          >
            <Plus size={16} strokeWidth={2.25} />
          </button>
        </div>
      )}
    </div>
  );
}
