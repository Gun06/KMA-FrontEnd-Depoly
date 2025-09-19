// src/components/admin/forms/sections/CourseGiftsSection.tsx
'use client';
import React from 'react';
import CourseGiftRows from '@/components/admin/Form/CourseGiftRows';

export default function CourseGiftsSection({
  f,
  readOnly,
}: {
  f: any;
  readOnly: boolean;
}) {
  const noop = () => {};
  return (
    <CourseGiftRows
      groups={f.groups}
      onAddCourse={readOnly ? undefined : f.addCourse} // ← 버튼 숨김
      onRemoveCourse={readOnly ? undefined : f.removeCourse} // ← 버튼 숨김
      onChangeCourseName={readOnly ? noop : f.changeCourseName} // ← 필수라 noop
      onChangeCoursePrice={readOnly ? undefined : f.changeCoursePrice}
      onAddGift={readOnly ? undefined : f.addGift} // ← 버튼 숨김
      onRemoveGift={readOnly ? undefined : f.removeGift} // ← 버튼 숨김
      onChangeGiftLabel={readOnly ? noop : f.changeGiftLabel}
      onChangeGiftSize={readOnly ? noop : f.changeGiftSize}
      readOnly={readOnly}
    />
  );
}
