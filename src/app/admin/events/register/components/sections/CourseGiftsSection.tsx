// src/app/admin/events/register/components/sections/CourseGiftsSection.tsx
'use client';
import React from 'react';
import CourseGiftRows from '@/components/admin/Form/CourseGiftRows';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import { Plus } from 'lucide-react';

export default function CourseGiftsSection({
  f,
  readOnly,
}: {
  f: any;
  readOnly: boolean;
}) {
  const noop = () => {};
  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">참가부문 및 기념품</h2>
      </div>

      {/* 참가부문 및 기념품 카드 목록 */}
    <CourseGiftRows
      groups={f.groups}
        onAddCourse={readOnly ? undefined : f.addCourse}
        onRemoveCourse={readOnly ? undefined : f.removeCourse}
        onChangeCourseName={readOnly ? noop : f.changeCourseName}
      onChangeCoursePrice={readOnly ? undefined : f.changeCoursePrice}
        onToggleCourseEnabled={readOnly ? undefined : f.toggleCourseEnabled}
        onAddGift={readOnly ? undefined : f.addGift}
        onRemoveGift={readOnly ? undefined : f.removeGift}
      onChangeGiftLabel={readOnly ? noop : f.changeGiftLabel}
      onChangeGiftSize={readOnly ? noop : f.changeGiftSize}
        onToggleGiftEnabled={readOnly ? undefined : f.toggleGiftEnabled}
      readOnly={readOnly}
    />

      {/* 참가부문 및 기념품 안내 메시지 */}
      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            {
              text: '※ 기념품 사이즈는 파이프(|)로 구분하여 입력하세요. 예) S | M | L | XL',
            },
            {
              text: '※ 하나의 참가부문에 여러 기념품을 추가할 수 있습니다.',
            },
            {
              text: '※ 참가비는 숫자만 입력하세요. 예) 50000',
            },
          ]}
        />
      </div>
    </div>
  );
}
