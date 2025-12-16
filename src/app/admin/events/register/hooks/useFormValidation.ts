// src/app/admin/events/register/hooks/useFormValidation.ts
'use client';

import type { CompetitionFormHandle } from '../components/sections/BasicInfoSection';
import type { CourseItem } from '../components/sections/CoursesSection';
import type { GiftItem } from '../components/sections/GiftsSection';

/**
 * 폼 검증 로직을 관리하는 커스텀 훅
 */
export function useFormValidation() {
  /**
   * 대회 기본 정보만 검증 (기념품/종목 제외)
   */
  const validateBasicInfo = (f: CompetitionFormHandle) => {
    const errors: string[] = [];
    if (!f.titleKo.trim()) errors.push('대회명(한글)');
    if (!f.date.trim()) errors.push('개최일(YYYY.MM.DD)');
    if (!f.hh || !f.mm) errors.push('개최 시/분');
    if (!f.registStartDate.trim()) errors.push('신청시작일(YYYY.MM.DD)');
    if (!f.registStartHh || !f.registStartMm) errors.push('신청시작 시/분');
    if (!f.deadlineDate.trim()) errors.push('접수마감일(YYYY.MM.DD)');
    if (!f.deadlineHh || !f.deadlineMm) errors.push('접수마감 시/분');
    if (!f.paymentDeadlineDate.trim()) errors.push('입금마감일(YYYY.MM.DD)');
    if (!f.paymentDeadlineHh || !f.paymentDeadlineMm) errors.push('입금마감 시/분');
    
    return { ok: errors.length === 0, errors };
  };

  /**
   * 기념품/종목 검증
   */
  const validateGiftsAndCourses = (gifts: GiftItem[], courses: CourseItem[]) => {
    const errors: string[] = [];

    // 기념품 검증
    if (gifts.length === 0) {
      errors.push('최소 하나의 기념품이 필요합니다.');
      return { ok: false, errors };
    }

    // 종목 검증
    if (courses.length === 0) {
      errors.push('최소 하나의 종목이 필요합니다.');
      return { ok: false, errors };
    }

    // 각 종목 검증
    courses.forEach((course, index) => {
      if (!course.name.trim()) {
        errors.push(`종목 ${index + 1}: 종목명을 입력해주세요.`);
      }
      if (!course.price || parseFloat(course.price.replace(/,/g, '')) <= 0) {
        errors.push(`종목 ${index + 1}: 참가비를 올바르게 입력해주세요.`);
      }
      if (course.selectedGifts.length === 0) {
        errors.push(`종목 ${index + 1}: 최소 하나의 기념품을 선택해주세요.`);
      }
    });

    return { ok: errors.length === 0, errors };
  };

  return {
    validateBasicInfo,
    validateGiftsAndCourses,
  };
}
