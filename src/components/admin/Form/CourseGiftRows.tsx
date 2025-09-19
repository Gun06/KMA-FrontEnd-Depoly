// src/components/admin/Form/CourseGiftRows.tsx
'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { useFormLayout } from '@/components/admin/Form/FormLayoutContext';
import TextField from '@/components/common/TextField/TextField';
import { Plus, Minus } from 'lucide-react';

export type CourseItem = { name: string; price: string };
export type GiftItem = { label: string; size: string };
export type CourseGroup = { course: CourseItem; gifts: GiftItem[] };

const ACTION_COL_W = 56;
// const GIFT_ACTION_W = ACTION_COL_W * 3;
const VLINE = '#C3C3C3';

type Props = {
  groups: CourseGroup[];
  // 코스
  onAddCourse?: () => void;
  onRemoveCourse?: (groupIndex: number) => void;
  onChangeCourseName: (groupIndex: number, value: string) => void;
  onChangeCoursePrice?: (groupIndex: number, value: string) => void;
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

  /** 읽기 모드 */
  readOnly?: boolean;

  labelCellWidth?: number;
  rowHeight?: number;
  className?: string;
};

export default function CourseGiftRows({
  groups,
  onAddCourse,
  onRemoveCourse,
  onChangeCourseName,
  onChangeCoursePrice,
  onAddGift,
  onRemoveGift,
  onChangeGiftLabel,
  onChangeGiftSize,
  readOnly = false,
  labelCellWidth,
  rowHeight = 56,
  className,
}: Props) {
  const { labelWidth } = useFormLayout();
  const lw = labelCellWidth ?? labelWidth;

  const textCls = readOnly ? 'text-[#646464]' : 'text-neutral-900';
  const fieldBase =
    'w-full text-[16px] bg-white border-0 outline-none focus:ring-0 shadow-none';

  return (
    <div
      className={cn('grid items-stretch', className)}
      style={{
        gridTemplateColumns: `${lw}px minmax(0,1fr) ${lw}px minmax(0,1fr) ${ACTION_COL_W}px`,
      }}
      aria-readonly={readOnly}
    >
      {groups.map((g, gi) => {
        const topBorder = gi > 0 ? 'border-t border-neutral-300' : '';
        const courseBottom = 'border-b border-neutral-300';

        const showAddCourse = !!onAddCourse && !readOnly && gi === 0;
        const showRemoveCourse = !!onRemoveCourse && !readOnly && gi > 0;

        return (
          <React.Fragment key={gi}>
            {/* 참가부문 라벨 */}
            <div
              className={cn(
                'bg-[#4D4D4D] text-white text-[16px] flex items-center justify-center text-center border-r',
                topBorder,
                courseBottom
              )}
              style={{ minHeight: rowHeight, borderRightColor: VLINE }}
            >
              참가부문
            </div>

            {/* 참가부문 입력 (빈 셀 제거, 1열) */}
            <div
              className={cn(
                'bg-white flex items-center',
                topBorder,
                courseBottom
              )}
              style={{ minHeight: rowHeight }}
            >
              <TextField
                value={g.course.name}
                onChange={e => onChangeCourseName(gi, e.currentTarget.value)}
                className={cn(fieldBase, textCls)}
                readOnly={readOnly}
                placeholder="코스를 입력하세요. 예) 하프 22km"
              />
            </div>

            {/* 참가비 라벨 */}
            <div
              className={cn(
                'bg-[#4D4D4D] text-white text-[16px] flex items-center justify-center text-center border-r',
                topBorder,
                courseBottom
              )}
              style={{ minHeight: rowHeight, borderRightColor: VLINE }}
            >
              참가비
            </div>

            {/* 참가비 입력 */}
            <div
              className={cn(
                'bg-white flex items-center',
                topBorder,
                courseBottom
              )}
              style={{ minHeight: rowHeight }}
            >
              <TextField
                inputMode="numeric"
                value={g.course.price}
                onChange={e => onChangeCoursePrice?.(gi, e.currentTarget.value)}
                className={cn(fieldBase, 'text-left', textCls)}
                readOnly={readOnly}
                placeholder="금액(숫자만)"
              />
            </div>

            {/* 코스 + / - */}
            <div
              className={cn(
                'bg-white flex items-center justify-center',
                topBorder,
                courseBottom
              )}
              style={{ minHeight: rowHeight, width: ACTION_COL_W }}
            >
              {showAddCourse && (
                <button
                  type="button"
                  onClick={onAddCourse}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#4D4D4D] text-white hover:opacity-90"
                >
                  <Plus size={16} strokeWidth={2.25} />
                </button>
              )}
              {showRemoveCourse && (
                <button
                  type="button"
                  onClick={() => onRemoveCourse?.(gi)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#4D4D4D] text-white hover:opacity-90"
                >
                  <Minus size={16} strokeWidth={2.25} />
                </button>
              )}
            </div>

            {/* ===== 기념품들 (기념품-사이즈 쌍) ===== */}
            {g.gifts.map((gift, gj) => {
              const isFirstGift = gj === 0;
              const giftRowBorder = isFirstGift
                ? ''
                : 'border-t border-neutral-300';

              const canAddGift = !!onAddGift && !readOnly && isFirstGift;
              const canRemoveGift = !!onRemoveGift && !readOnly && !isFirstGift;

              return (
                <React.Fragment key={`${gi}-${gj}`}>
                  <div
                    className={cn(
                      'bg-[#5B5B5B] text-white text-[16px] flex items-center justify-center text-center border-r',
                      giftRowBorder
                    )}
                    style={{ minHeight: rowHeight, borderRightColor: VLINE }}
                  >
                    기념품
                  </div>

                  {/* 기념품명 입력 */}
                  <div
                    className={cn(
                      'bg-white flex items-center border-r',
                      giftRowBorder
                    )}
                    style={{ minHeight: rowHeight, borderRightColor: VLINE }}
                  >
                    <TextField
                      value={gift.label}
                      onChange={e =>
                        onChangeGiftLabel(gi, gj, e.currentTarget.value)
                      }
                      className={cn(fieldBase, textCls)}
                      readOnly={readOnly}
                      placeholder="기념품을 입력하세요. 예) 나이키 운동화 240"
                    />
                  </div>

                  {/* 사이즈 라벨 */}
                  <div
                    className={cn(
                      'bg-[#5B5B5B] text-white text-[16px] flex items-center justify-center text-center border-r',
                      giftRowBorder
                    )}
                    style={{ minHeight: rowHeight, borderRightColor: VLINE }}
                  >
                    사이즈
                  </div>

                  {/* 사이즈 입력 */}
                  <div
                    className={cn('bg-white flex items-center', giftRowBorder)}
                    style={{ minHeight: rowHeight }}
                  >
                    <TextField
                      value={gift.size}
                      onChange={e =>
                        onChangeGiftSize(gi, gj, e.currentTarget.value)
                      }
                      className={cn(fieldBase, 'text-left', textCls)}
                      readOnly={readOnly}
                      placeholder="사이즈(예: S|M|240 등)"
                    />
                  </div>

                  <div
                    className={cn(
                      'bg-white flex items-center justify-center',
                      giftRowBorder
                    )}
                    style={{
                      minHeight: rowHeight,
                      width: ACTION_COL_W,
                      gridColumn: '5 / span 1',
                    }}
                  >
                    {canAddGift && (
                      <button
                        type="button"
                        onClick={() => onAddGift?.(gi)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#4D4D4D] text-white hover:opacity-90"
                      >
                        <Plus size={16} strokeWidth={2.25} />
                      </button>
                    )}
                    {canRemoveGift && (
                      <button
                        type="button"
                        onClick={() => onRemoveGift?.(gi, gj)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#4D4D4D] text-white hover:opacity-90"
                      >
                        <Minus size={16} strokeWidth={2.25} />
                      </button>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
