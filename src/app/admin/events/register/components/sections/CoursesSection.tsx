// src/app/admin/events/register/components/sections/CoursesSection.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import GiftSelectionModal from '../parts/GiftSelectionModal';
import { Plus, Trophy } from 'lucide-react';
import MiniToggle from '@/components/common/Toggle/MiniToggle';
import type { GiftItem } from './GiftsSection';

export type CourseItem = {
  id?: string; // 서버 종목 ID (수정 시 유지, 없으면 생성)
  name: string;
  price: string;
  selectedGifts: number[]; // 기념품 인덱스 배열
  isActive?: boolean;
};

type CoursesSectionProps = {
  courses: CourseItem[];
  availableGifts: GiftItem[]; // 선택 가능한 기념품 목록
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onChangeCourseName: (index: number, value: string) => void;
  onChangeCoursePrice: (index: number, value: string) => void;
  onSelectGifts: (courseIndex: number, selectedIndices: number[]) => void;
  onRemoveGiftFromCourse?: (courseIndex: number, giftIndex: number) => void;
  onToggleCourseEnabled?: (index: number, enabled: boolean) => void;
  readOnly?: boolean;
};

const headerFieldCls =
  'h-9 bg-transparent border-0 border-b border-white/35 px-0 text-[13px] text-white outline-none focus:border-white placeholder:text-white/40 read-only:border-transparent';

function formatGiftSize(size?: string) {
  if (!size?.trim()) return '';
  return size
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' · ');
}

export default function CoursesSection({
  courses,
  availableGifts,
  onAddCourse,
  onRemoveCourse,
  onChangeCourseName,
  onChangeCoursePrice,
  onSelectGifts,
  onRemoveGiftFromCourse,
  onToggleCourseEnabled,
  readOnly = false,
}: CoursesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCourseIndex, setCurrentCourseIndex] = useState<number | null>(null);

  const noop = () => {};

  const handleOpenModal = (courseIndex: number) => {
    setCurrentCourseIndex(courseIndex);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCourseIndex(null);
  };

  const handleConfirmGifts = (selectedIndices: number[]) => {
    if (currentCourseIndex !== null) {
      onSelectGifts(currentCourseIndex, selectedIndices);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-[17px] font-semibold text-left">종목</h1>
          {!readOnly && courses.length > 0 && (
            <button
              type="button"
              onClick={onAddCourse}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[13px] font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="종목 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              추가
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-neutral-300 rounded-sm">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-neutral-400" />
              </div>
              <div className="text-neutral-600 text-[13px] font-medium mb-2">
                등록된 종목이 없습니다
              </div>
              <div className="text-neutral-500 text-[13px] mb-6">
                첫 번째 종목을 추가해보세요
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onAddCourse}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
                  aria-label="종목 추가"
                >
                  <Plus size={16} strokeWidth={2.25} />
                  종목 추가
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, courseIndex) => {
              const isCourseActive = course.isActive !== false;
              const selectedGifts = course.selectedGifts
                .map((giftIndex) => ({ giftIndex, gift: availableGifts[giftIndex] }))
                .filter((item) => item.gift);

              return (
                <div
                  key={course.id ?? courseIndex}
                  className={cn(
                    'border border-neutral-300 rounded-sm bg-white',
                    !isCourseActive && 'bg-[#FAFAFA]'
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 bg-[#4D4D4D]">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[13px] text-white">참가부문</span>
                      {!readOnly && onToggleCourseEnabled && (
                        <MiniToggle
                          value={isCourseActive}
                          onChange={(enabled) => onToggleCourseEnabled(courseIndex, enabled)}
                          disabled={readOnly}
                        />
                      )}
                      {!isCourseActive && (
                        <span className="text-[12px] text-white/60">마감</span>
                      )}
                    </div>

                    <input
                      placeholder="예) 1|5km|일반"
                      value={course.name}
                      onChange={(e) =>
                        readOnly ? noop() : onChangeCourseName(courseIndex, e.currentTarget.value)
                      }
                      readOnly={readOnly || !isCourseActive}
                      className={cn(headerFieldCls, 'flex-1 min-w-[160px]')}
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[13px] text-white">참가비</span>
                      <input
                        inputMode="numeric"
                        placeholder="0"
                        value={course.price}
                        onChange={(e) =>
                          readOnly
                            ? noop()
                            : onChangeCoursePrice(
                                courseIndex,
                                e.currentTarget.value.replace(/[^\d]/g, '')
                              )
                        }
                        readOnly={readOnly || !isCourseActive}
                        className={cn(headerFieldCls, 'w-[108px] text-right tabular-nums')}
                      />
                      <span className="text-[13px] text-white/60">원</span>
                    </div>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => onRemoveCourse(courseIndex)}
                        className="shrink-0 ml-auto text-[13px] text-white/55 hover:text-white"
                        aria-label="종목 삭제"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-3 min-h-[28px]">
                      <span className="text-[13px] text-[#6B7280]">기념품</span>
                      {!readOnly && availableGifts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenModal(courseIndex)}
                          className="text-[13px] text-[#256EF4] font-medium hover:underline"
                        >
                          기념품 추가
                        </button>
                      )}
                    </div>

                    {availableGifts.length === 0 ? (
                      <p className="mt-1 text-[13px] text-[#8A949E]">
                        먼저 기념품을 생성해주세요.
                      </p>
                    ) : selectedGifts.length === 0 ? (
                      <p className="mt-1 text-[13px] text-[#8A949E]">
                        기념품을 선택해주세요.
                      </p>
                    ) : (
                      <div className="mt-1">
                        {selectedGifts.map(({ giftIndex, gift }) => {
                          const isGiftActive = gift.isActive !== false;
                          const sizeText = formatGiftSize(gift.size);
                          return (
                            <div
                              key={giftIndex}
                              className={cn(
                                'flex items-start gap-3 py-2 border-b border-[#EEE] last:border-b-0',
                                !isGiftActive && 'opacity-50'
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] text-[#111827]">
                                  {gift.name}
                                  {!isGiftActive && (
                                    <span className="ml-1.5 text-[12px] text-[#9CA3AF]">
                                      마감
                                    </span>
                                  )}
                                </p>
                                {sizeText && (
                                  <p className="mt-0.5 text-[12px] text-[#8A949E] leading-relaxed">
                                    {sizeText}
                                  </p>
                                )}
                              </div>
                              {!readOnly && onRemoveGiftFromCourse && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveGiftFromCourse(courseIndex, giftIndex)}
                                  className="shrink-0 text-[13px] text-[#9CA3AF] hover:text-[#DC2626]"
                                  aria-label={`${gift.name} 제거`}
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex mx-auto px-3">
        <NoticeMessage
          items={[
            {
              text: '※ 기념품 섹션에서 만든 기념품을 조합하여 종목을 생성합니다.',
            },
            {
              text: '※ 하나의 종목에 여러 기념품을 선택할 수 있습니다.',
            },
            {
              text: "※ 참가부문은 '순서|종목|세부종목' 형식으로 입력하세요. 순서 번호에 따라 표시 순서가 결정됩니다. 예) 1|22km|짝궁마라톤, 2|22km|풀코스",
            },
            {
              text: '※ 참가비는 숫자만 입력하세요. 예) 50000',
            },
            {
              text: '※ 마감하고 싶은 종목은 OFF로 설정한 후 "종목 저장" 버튼을 눌러주세요.',
            },
          ]}
        />
      </div>

      {currentCourseIndex !== null && (
        <GiftSelectionModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmGifts}
          availableGifts={availableGifts}
          selectedIndices={courses[currentCourseIndex]?.selectedGifts || []}
        />
      )}
    </div>
  );
}
