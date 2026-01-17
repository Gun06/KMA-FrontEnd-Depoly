// app/admin/local-events/register/hooks/useLocalEventForm.ts
'use client';

import { useState, useMemo, useId } from 'react';
import type { LocalEventCreatePayload } from '../api/types';
import type { LocalEventStatus, LocalEventVisibleStatus } from '../api/types';

export type UseLocalEventFormPrefill = {
  eventName?: string;
  eventUrl?: string;
  eventStatus?: LocalEventStatus;
  visibleStatus?: LocalEventVisibleStatus;
  eventStartDate?: string;
  eventStartHh?: string;
  eventStartMm?: string;
  registStartDate?: string;
  registStartHh?: string;
  registStartMm?: string;
  registDeadline?: string;
  registDeadlineHh?: string;
  registDeadlineMm?: string;
  lowestAmount?: string;
  promotionBanner?: File;
};

export function useLocalEventForm(prefill?: UseLocalEventFormPrefill) {
  const uid = useId();

  // 시간/분 옵션
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  }, []);

  // 폼 상태
  const [eventName, setEventName] = useState(prefill?.eventName || '');
  const [eventUrl, setEventUrl] = useState(prefill?.eventUrl || '');
  const [eventStatus, setEventStatus] = useState<LocalEventStatus>(
    prefill?.eventStatus || 'PENDING'
  );
  const [visibleStatus, setVisibleStatus] = useState<LocalEventVisibleStatus>(
    prefill?.visibleStatus || 'CLOSE'
  );
  const [eventStartDate, setEventStartDate] = useState(prefill?.eventStartDate || '');
  const [eventStartHh, setEventStartHh] = useState(prefill?.eventStartHh || '00');
  const [eventStartMm, setEventStartMm] = useState(prefill?.eventStartMm || '00');
  const [registStartDate, setRegistStartDate] = useState(prefill?.registStartDate || '');
  const [registStartHh, setRegistStartHh] = useState(prefill?.registStartHh || '00');
  const [registStartMm, setRegistStartMm] = useState(prefill?.registStartMm || '00');
  const [registDeadline, setRegistDeadline] = useState(prefill?.registDeadline || '');
  const [registDeadlineHh, setRegistDeadlineHh] = useState(prefill?.registDeadlineHh || '00');
  const [registDeadlineMm, setRegistDeadlineMm] = useState(prefill?.registDeadlineMm || '00');
  const [lowestAmount, setLowestAmount] = useState(prefill?.lowestAmount || '');
  const [promotionBanner, setPromotionBanner] = useState<File | undefined>(
    prefill?.promotionBanner
  );

  // 날짜와 시간을 ISO 8601 형식으로 변환 (점, 하이픈, 슬래시 모두 지원)
  const formatDateTime = (date: string, hh: string, mm: string): string => {
    if (!date) return '';
    
    // YYYY.MM.DD, YYYY-MM-DD, YYYY/MM/DD 형식 모두 처리
    const match = date.trim().match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
    if (!match) {
      // 이미 YYYY-MM-DD 형식이면 그대로 사용
      return `${date}T${hh}:${mm}:00`;
    }
    
    const [, year, month, day] = match;
    const hhNum = Number(hh) || 0;
    const mmNum = Number(mm) || 0;
    
    // ISO 8601 형식으로 변환 (YYYY-MM-DDTHH:mm:ss)
    return `${year}-${month}-${day}T${String(hhNum).padStart(2, '0')}:${String(mmNum).padStart(2, '0')}:00`;
  };

  // 숫자 문자열을 숫자로 변환 (콤마 제거)
  const parseAmount = (amount: string): number => {
    const cleaned = amount.replace(/,/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // 유효성 검사
  const validate = (): { ok: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!eventName.trim()) {
      errors.push('대회명을 입력해주세요.');
    }

    if (!eventUrl.trim()) {
      errors.push('대회 URL을 입력해주세요.');
    }

    if (!eventStartDate) {
      errors.push('대회 시작일을 선택해주세요.');
    }

    if (!registStartDate) {
      errors.push('신청 시작일을 선택해주세요.');
    }

    if (!registDeadline) {
      errors.push('신청 마감일을 선택해주세요.');
    }

    // 날짜 순서 검증
    if (eventStartDate && registStartDate) {
      const eventStart = new Date(formatDateTime(eventStartDate, eventStartHh, eventStartMm));
      const registStart = new Date(formatDateTime(registStartDate, registStartHh, registStartMm));
      if (registStart > eventStart) {
        errors.push('신청 시작일은 대회 시작일보다 이전이어야 합니다.');
      }
    }

    if (registStartDate && registDeadline) {
      const registStart = new Date(formatDateTime(registStartDate, registStartHh, registStartMm));
      const registDeadlineDate = new Date(
        formatDateTime(registDeadline, registDeadlineHh, registDeadlineMm)
      );
      if (registDeadlineDate < registStart) {
        errors.push('신청 마감일은 신청 시작일보다 이후여야 합니다.');
      }
    }

    if (eventStartDate && registDeadline) {
      const eventStart = new Date(formatDateTime(eventStartDate, eventStartHh, eventStartMm));
      const registDeadlineDate = new Date(
        formatDateTime(registDeadline, registDeadlineHh, registDeadlineMm)
      );
      if (registDeadlineDate > eventStart) {
        errors.push('신청 마감일은 대회 시작일보다 이전이어야 합니다.');
      }
    }

    if (!lowestAmount || parseAmount(lowestAmount) <= 0) {
      errors.push('최소 금액을 입력해주세요.');
    }

    return {
      ok: errors.length === 0,
      errors,
    };
  };

  // API 요청 본문 생성
  const buildApiBody = (): LocalEventCreatePayload => {
    return {
      eventName: eventName.trim(),
      eventUrl: eventUrl.trim(),
      eventStatus,
      visibleStatus,
      eventStartDate: formatDateTime(eventStartDate, eventStartHh, eventStartMm),
      registStartDate: formatDateTime(registStartDate, registStartHh, registStartMm),
      registDeadline: formatDateTime(registDeadline, registDeadlineHh, registDeadlineMm),
      lowestAmount: parseAmount(lowestAmount),
      promotionBanner,
    };
  };

  return {
    uid,
    hours,
    minutes,
    eventName,
    setEventName,
    eventUrl,
    setEventUrl,
    eventStatus,
    setEventStatus,
    visibleStatus,
    setVisibleStatus,
    eventStartDate,
    setEventStartDate,
    eventStartHh,
    setEventStartHh,
    eventStartMm,
    setEventStartMm,
    registStartDate,
    setRegistStartDate,
    registStartHh,
    setRegistStartHh,
    registStartMm,
    setRegistStartMm,
    registDeadline,
    setRegistDeadline,
    registDeadlineHh,
    setRegistDeadlineHh,
    registDeadlineMm,
    setRegistDeadlineMm,
    lowestAmount,
    setLowestAmount,
    promotionBanner,
    setPromotionBanner,
    validate,
    buildApiBody,
  };
}

