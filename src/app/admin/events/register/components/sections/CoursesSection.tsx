// src/app/admin/events/register/components/sections/CoursesSection.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import TextField from '@/components/common/TextField/TextField';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import GiftSelectionModal from '../parts/GiftSelectionModal';
import { Plus, Minus, Trophy } from 'lucide-react';
import MiniToggle from '@/components/common/Toggle/MiniToggle';

export type CourseItem = {
  name: string;
  price: string;
  selectedGifts: number[]; // 기념품 인덱스 배열
  isActive?: boolean;
};

type CoursesSectionProps = {
  courses: CourseItem[];
  availableGifts: Array<{ name: string; size: string; isActive?: boolean }>; // 선택 가능한 기념품 목록
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onChangeCourseName: (index: number, value: string) => void;
  onChangeCoursePrice: (index: number, value: string) => void;
  onSelectGifts: (courseIndex: number, selectedIndices: number[]) => void;
  onRemoveGiftFromCourse?: (courseIndex: number, giftIndex: number) => void;
  onToggleCourseEnabled?: (index: number, enabled: boolean) => void;
  readOnly?: boolean;
};

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

  const noop = () => { };

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
        <h1 className="text-lg font-semibold mb-3 text-left">종목</h1>
        {courses.length === 0 ? (
          <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-neutral-400" />
              </div>
              <div className="text-neutral-600 text-base font-medium mb-2">
                등록된 종목이 없습니다
              </div>
              <div className="text-neutral-500 text-sm mb-6">
                첫 번째 종목을 추가해보세요
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onAddCourse}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
                  aria-label="종목 추가"
                >
                  <Plus size={16} strokeWidth={2.25} />
                  종목 추가
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pr-12">
            {courses.map((course, courseIndex) => {
              const isCourseActive = course.isActive !== false; // 기본값은 true
              return (
              <div key={courseIndex} className="relative">
                {/* 종목 블록 */}
                <div className={cn(
                  "border border-neutral-300 rounded-lg overflow-hidden",
                  isCourseActive ? "bg-white" : "bg-gray-200 opacity-70"
                )}>
                  {/* 참가부문 및 참가비 헤더 */}
                  <div className={cn(
                    "flex items-stretch",
                    isCourseActive ? "bg-[#4D4D4D]" : "bg-[#4D4D4D]"
                  )}>
                    {/* 참가부문 */}
                    <div className="flex-1 flex items-center">
                      <div className="min-w-[140px] bg-transparent text-white text-[16px] flex items-center justify-center gap-3 px-4 py-2 border-r border-neutral-300">
                        <span className="whitespace-nowrap">참가부문</span>
                        {!readOnly && onToggleCourseEnabled && (
                          <MiniToggle
                            value={isCourseActive}
                            onChange={(enabled) => onToggleCourseEnabled(courseIndex, enabled)}
                            disabled={readOnly}
                          />
                        )}
                      </div>
                      <div className="flex-1 bg-transparent px-4 py-2">
                  <TextField
                    placeholder="참가부문을 입력하세요. 예) 22km|짝궁마라톤"
                    value={course.name}
                    onChange={(e) =>
                      readOnly
                        ? noop()
                        : onChangeCourseName(courseIndex, e.currentTarget.value)
                    }
                          className="w-full text-[16px] bg-white text-neutral-900 placeholder:text-neutral-400 border-0 outline-none focus:outline-none focus:ring-0 shadow-none rounded"
                    readOnly={readOnly || !isCourseActive}
                  />
                      </div>
                    </div>
                    {/* 참가비 */}
                    <div className="flex items-center border-l border-neutral-300">
                      <div className="w-[100px] bg-transparent text-white text-[16px] flex items-center justify-center px-4 py-2 border-r border-neutral-300">
                        참가비
                </div>
                      <div className="w-[200px] bg-transparent px-4 py-2">
                <TextField
                  inputMode="numeric"
                  placeholder="금액(숫자만)"
                  value={course.price}
                  onChange={(e) =>
                    readOnly
                      ? noop()
                      : onChangeCoursePrice(courseIndex, e.currentTarget.value)
                  }
                          className="w-full text-[16px] bg-white text-neutral-900 placeholder:text-neutral-400 border-0 outline-none focus:outline-none focus:ring-0 shadow-none rounded"
                  readOnly={readOnly || !isCourseActive}
                />
                      </div>
                    </div>
                  </div>

                  {/* 기념품 섹션 */}
                  <div>
                    {/* 기념품 제목 행 */}
                    <div className="bg-[#F5F5F5] flex items-center justify-between px-4 py-1 border-b border-neutral-200">
                      <div className="text-[16px] font-medium text-neutral-900">기념품</div>
                      {!readOnly && availableGifts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenModal(courseIndex)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                        >
                          <Plus size={14} strokeWidth={2} />
                          기념품 추가
                        </button>
                      )}
                    </div>

                    {/* 선택된 기념품 표시 */}
                    <div className="bg-white px-4 py-3">
                  {availableGifts.length === 0 ? (
                        <div className="text-sm text-neutral-500">
                      먼저 기념품을 생성해주세요.
                        </div>
                      ) : course.selectedGifts.length === 0 ? (
                        <div className="text-sm text-neutral-500">
                          기념품을 선택해주세요.
                    </div>
                  ) : (
                        <div className="flex flex-wrap gap-2">
                          {course.selectedGifts.map((giftIndex) => {
                            const gift = availableGifts[giftIndex];
                            if (!gift) return null;
                            const isGiftActive = gift.isActive !== false; // 기본값은 true
                        return (
                              <div
                            key={giftIndex}
                                className={cn(
                                  "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded",
                                  isGiftActive
                                    ? "text-neutral-700 bg-white border border-neutral-200"
                                    : "text-neutral-400 bg-neutral-100 border border-neutral-300 opacity-60"
                                )}
                              >
                                <span>
                              {gift.name} {gift.size && `(${gift.size})`}
                            </span>
                                {!readOnly && onRemoveGiftFromCourse && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveGiftFromCourse(courseIndex, giftIndex)}
                                    className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                                    aria-label="기념품 제거"
                                  >
                                    <Minus size={12} strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                  </div>
                </div>

                {/* 종목 삭제 버튼 (외부) */}
                {!readOnly && (
                  <div className="absolute -right-12 top-0 flex items-center h-full">
                    <button
                      type="button"
                      onClick={() => onRemoveCourse(courseIndex)}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                      aria-label="종목 삭제"
                    >
                      <Minus size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
              );
            })}
            </div>
        )}

        {!readOnly && courses.length > 0 && (
          <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={onAddCourse}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
                aria-label="종목 추가"
              >
                <Plus size={16} strokeWidth={2.25} />
                종목 추가
              </button>
            </div>
        )}
      </div>

      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            {
              text: '※ 기념품 섹션에서 만든 기념품을 조합하여 종목을 생성합니다.',
            },
            {
              text: '※ 하나의 종목에 여러 기념품을 선택할 수 있습니다.',
            },
            {
              text: '※ 참가부문은 \'순서|종목|세부종목\' 형식으로 입력하세요. 순서 번호에 따라 표시 순서가 결정됩니다. 예) 1|22km|짝궁마라톤, 2|22km|풀코스',
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

      {/* 기념품 선택 모달 */}
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
