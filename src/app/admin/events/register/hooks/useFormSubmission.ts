// src/app/admin/events/register/hooks/useFormSubmission.ts
'use client';

import { useState } from 'react';
import type { CompetitionFormHandle } from '../components/sections/BasicInfoSection';
import type { CourseItem } from '../components/sections/CoursesSection';
import type { GiftItem } from '../components/sections/GiftsSection';
import type { EventCreatePayload } from '../api/types';

interface UseFormSubmissionOptions {
  f: CompetitionFormHandle;
  gifts: GiftItem[];
  courses: CourseItem[];
  onRegister?: (payload: EventCreatePayload) => Promise<void>;
  onSubmit?: (payload: EventCreatePayload) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * 폼 제출 로직을 관리하는 커스텀 훅
 */
export function useFormSubmission({
  f,
  gifts,
  courses,
  onRegister,
  onSubmit,
  onSuccess,
}: UseFormSubmissionOptions) {
  const [loading, setLoading] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);

  // eventCreated 상태를 외부에서 설정할 수 있도록 setter 노출
  const setEventCreatedState = (value: boolean) => {
    setEventCreated(value);
  };

  /**
   * 저장 (편집 모드용)
   */
  const saveEdit = async () => {
    if (loading) return;

    // ✅ 유효성 검사
    const v = f.validate?.();
    if (v && !v.ok) {
      return { ok: false, errors: v.errors };
    }

    setLoading(true);
    try {
      if (!f.buildApiBody) {
        return { ok: false, errors: ['buildApiBody 메서드가 없습니다.'] };
      }
      const body = f.buildApiBody();
      await Promise.resolve((onRegister ?? onSubmit)?.(body));
      // 성공 시에만 편집 모드 종료
      if (onSuccess) onSuccess();
      return { ok: true };
    } catch (error) {
      // 에러 발생 시에도 편집 모드는 유지 (버튼이 사라지지 않도록)
      throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록
    } finally {
      setLoading(false);
    }
  };

  /**
   * 1차 저장: 대회 기본 정보만 저장 (기념품/종목 제외)
   */
  const saveBasicInfo = async () => {
    if (loading) return { ok: false, errors: [] };

    // 에러 발생 시에도 버튼이 사라지지 않도록 미리 false로 설정
    setEventCreated(false);
    
    setLoading(true);
    try {
      if (!f.buildApiBody) {
        return { ok: false, errors: ['buildApiBody 메서드가 없습니다.'] };
      }
      const body = f.buildApiBody();
      // 1차 저장: 참가부문이 없어도 저장 가능하도록 처리
      // 빈 groups 배열을 포함하여 전달 (handleRegister에서 자동으로 검증 건너뛰기)
      const basicBody = {
        ...body,
        groups: [], // 1차 저장 시에는 빈 배열
      };
      
      await Promise.resolve((onRegister ?? onSubmit)?.(basicBody as any));
      // 성공 시에만 기념품/종목 섹션 활성화
      setEventCreated(true);
      return { ok: true };
    } catch (error) {
      // 에러 발생 시 상태 리셋 (버튼이 사라지지 않도록)
      setEventCreated(false);
      throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록
    } finally {
      setLoading(false);
    }
  };

  /**
   * 최종 등록: 기념품/종목 포함하여 최종 저장
   */
  const finalSubmit = async () => {
    if (loading) return { ok: false, errors: [] };

    // 에러 발생 시에도 버튼이 사라지지 않도록 미리 false로 설정
    setEventCreated(false);

    setLoading(true);
    try {
      if (!f.buildApiBody) {
        return { ok: false, errors: ['buildApiBody 메서드가 없습니다.'] };
      }
      const body = f.buildApiBody();
      
      // 기념품과 종목을 groups 형태로 변환
      const groups = courses.map(course => ({
        course: {
          name: course.name,
          price: parseFloat(course.price.replace(/,/g, '')) || 0,
        },
        gifts: course.selectedGifts.map(giftIndex => ({
          label: gifts[giftIndex].name,
          size: gifts[giftIndex].size,
        })),
      }));

      const finalBody = {
        ...body,
        groups, // 기념품과 종목 데이터 포함
      };

      await Promise.resolve((onRegister ?? onSubmit)?.(finalBody as any));
      // 성공 시에만 완료 처리
      setEventCreated(true);
      return { ok: true };
    } catch (error) {
      // 에러 발생 시 상태 리셋 (버튼이 사라지지 않도록)
      setEventCreated(false);
      throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    eventCreated,
    setEventCreated: setEventCreatedState,
    saveEdit,
    saveBasicInfo,
    finalSubmit,
  };
}
