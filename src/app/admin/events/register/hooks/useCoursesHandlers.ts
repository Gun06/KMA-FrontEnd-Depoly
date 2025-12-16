// src/app/admin/events/register/hooks/useCoursesHandlers.ts
'use client';

import { useState } from 'react';
import type { CourseItem } from '../components/sections/CoursesSection';

/**
 * 종목 상태 및 핸들러를 관리하는 커스텀 훅
 */
export function useCoursesHandlers(initialCourses: CourseItem[] = []) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);

  const handleAddCourse = () => {
    setCourses([...courses, { name: '', price: '', selectedGifts: [] }]);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleChangeCourseName = (index: number, value: string) => {
    setCourses(courses.map((c, i) => (i === index ? { ...c, name: value } : c)));
  };

  const handleChangeCoursePrice = (index: number, value: string) => {
    setCourses(courses.map((c, i) => (i === index ? { ...c, price: value } : c)));
  };

  const handleSelectGifts = (courseIndex: number, selectedIndices: number[]) => {
    setCourses(courses.map((c, i) => {
      if (i === courseIndex) {
        return {
          ...c,
          selectedGifts: selectedIndices,
        };
      }
      return c;
    }));
  };

  const handleRemoveGiftFromCourse = (courseIndex: number, giftIndex: number) => {
    setCourses(courses.map((c, i) => {
      if (i === courseIndex) {
        return {
          ...c,
          selectedGifts: c.selectedGifts.filter(idx => idx !== giftIndex),
        };
      }
      return c;
    }));
  };

  return {
    courses,
    setCourses,
    handleAddCourse,
    handleRemoveCourse,
    handleChangeCourseName,
    handleChangeCoursePrice,
    handleSelectGifts,
    handleRemoveGiftFromCourse,
  };
}
