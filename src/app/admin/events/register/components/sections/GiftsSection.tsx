// src/app/admin/events/register/components/sections/GiftsSection.tsx
'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import FormRow from '@/components/admin/Form/FormRow';
import { FormLayoutProvider } from '@/components/admin/Form/FormLayoutContext';
import TextField from '@/components/common/TextField/TextField';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import { Plus, Minus, Gift } from 'lucide-react';
import MiniToggle from '@/components/common/Toggle/MiniToggle';

export type GiftItem = { name: string; size: string; isActive?: boolean };

type GiftsSectionProps = {
  gifts: GiftItem[];
  onAddGift: () => void;
  onRemoveGift: (index: number) => void;
  onChangeGiftName: (index: number, value: string) => void;
  onChangeGiftSize: (index: number, value: string) => void;
  onToggleGiftEnabled?: (index: number, enabled: boolean) => void;
  readOnly?: boolean;
};

export default function GiftsSection({
  gifts,
  onAddGift,
  onRemoveGift,
  onChangeGiftName,
  onChangeGiftSize,
  onToggleGiftEnabled,
  readOnly = false,
}: GiftsSectionProps) {
  const noop = () => {};
  const textCls = readOnly ? 'text-[#646464]' : 'text-neutral-900';
  const fieldCls =
    'w-full text-[16px] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 shadow-none';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold mb-3 text-left">기념품</h1>
        <FormLayoutProvider labelWidth={200} tightRows={false}>
          <div className="w-full border border-neutral-300 rounded-sm overflow-hidden">
            {gifts.length === 0 ? (
              <div className="bg-white">
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div className="text-neutral-600 text-base font-medium mb-2">
                    등록된 기념품이 없습니다
                  </div>
                  <div className="text-neutral-500 text-sm mb-6">
                    첫 번째 기념품을 추가해보세요
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={onAddGift}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
                      aria-label="기념품 추가"
                    >
                      <Plus size={16} strokeWidth={2.25} />
                      기념품 추가
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-300">
                {gifts.map((gift, index) => {
                  const isActive = gift.isActive !== false; // 기본값은 true
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-stretch",
                        !isActive && "bg-gray-200 opacity-70"
                      )}
                    >
                      <div className="flex-1">
                        <FormRow
                          label={
                            <div className="flex items-center justify-center w-full gap-3">
                              <span>기념품 {index + 1}</span>
                              {!readOnly && onToggleGiftEnabled && (
                                <MiniToggle
                                  value={isActive}
                                  onChange={(enabled) => onToggleGiftEnabled(index, enabled)}
                                  disabled={readOnly}
                                />
                              )}
                            </div>
                          }
                          contentClassName="items-center"
                        >
                        <div className="flex items-center w-full">
                          <div className="flex-1">
                            <TextField
                              placeholder="기념품을 입력하세요. 예) 나이키 운동화 240"
                              value={gift.name}
                              onChange={(e) =>
                                readOnly
                                  ? noop()
                                  : onChangeGiftName(index, e.currentTarget.value)
                              }
                              className={cn(fieldCls, textCls)}
                              readOnly={readOnly || !isActive}
                            />
                          </div>
                          <div className="w-px h-8 bg-neutral-300 mx-3" />
                          <div className="flex-1">
                            <TextField
                              placeholder="사이즈(예: S|M|240 등)"
                              value={gift.size}
                              onChange={(e) =>
                                readOnly
                                  ? noop()
                                  : onChangeGiftSize(index, e.currentTarget.value)
                              }
                              className={cn(fieldCls, textCls)}
                              readOnly={readOnly || !isActive}
                            />
                          </div>
                        </div>
                      </FormRow>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center px-3 border-l border-neutral-300 bg-white">
                        <button
                          type="button"
                          onClick={() => onRemoveGift(index)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                          aria-label="기념품 삭제"
                        >
                          <Minus size={14} strokeWidth={2.25} />
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </FormLayoutProvider>
        
        {!readOnly && gifts.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={onAddGift}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="기념품 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              기념품 추가
            </button>
          </div>
        )}
      </div>

      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            {
              text: '※ 기념품 사이즈는 파이프(|)로 구분하여 입력하세요. 예) S | M | L | XL',
            },
            {
              text: '※ 종목 생성 전에 기념품을 먼저 생성해야 합니다.',
              highlight: true,
            },
            {
              text: '※ 마감하고 싶은 기념품은 OFF로 설정한 후 "기념품 저장" 버튼을 눌러주세요.',
            },
          ]}
        />
      </div>
    </div>
  );
}
