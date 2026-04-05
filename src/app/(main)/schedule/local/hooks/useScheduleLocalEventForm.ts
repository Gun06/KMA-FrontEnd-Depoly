'use client';

import { useState, useMemo, useId } from 'react';
import type { LocalEventVisibleStatus, ScheduleLocalEventFormPayload } from '../types/localEvent';

export type ScheduleLocalEventFormPrefill = {
  eventName?: string;
  eventUrl?: string;
  /** 수정 시 API eventStatus 그대로 (등록 시 생략하면 PENDING) */
  eventStatus?: string;
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
  eventCategoryCsv?: string;
  lowestAmount?: number;
  applicantCompany?: string;
  promotionBanner?: File;
};

export function useScheduleLocalEventForm(prefill?: ScheduleLocalEventFormPrefill) {
  const uid = useId();

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')),
    []
  );

  const [eventName, setEventName] = useState(prefill?.eventName || '');
  const [eventUrl, setEventUrl] = useState(prefill?.eventUrl || '');
  const [eventStatus] = useState<string>(prefill?.eventStatus || 'PENDING');
  const [visibleStatus, setVisibleStatus] = useState<LocalEventVisibleStatus>(
    prefill?.visibleStatus || 'OPEN'
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
  const [eventCategoryCsv, setEventCategoryCsv] = useState(prefill?.eventCategoryCsv || '');
  const [lowestAmountStr] = useState(
    prefill?.lowestAmount != null ? String(prefill.lowestAmount) : '0'
  );
  const [applicantCompany, setApplicantCompany] = useState(prefill?.applicantCompany || '');
  const [promotionBanner, setPromotionBanner] = useState<File | undefined>(
    prefill?.promotionBanner
  );

  const formatDateTime = (date: string, hh: string, mm: string): string => {
    if (!date) return '';
    const match = date.trim().match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
    if (!match) {
      return `${date}T${hh}:${mm}:00`;
    }
    const [, year, month, day] = match;
    const hhNum = Number(hh) || 0;
    const mmNum = Number(mm) || 0;
    return `${year}-${month}-${day}T${String(hhNum).padStart(2, '0')}:${String(mmNum).padStart(2, '0')}:00`;
  };

  const validate = (): { ok: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!eventName.trim()) errors.push('대회명을 입력해주세요.');
    if (!eventUrl.trim()) errors.push('대회 URL을 입력해주세요.');
    if (!eventStartDate) errors.push('대회 시작일을 선택해주세요.');
    if (!registStartDate) errors.push('신청 시작일을 선택해주세요.');
    if (!registDeadline) errors.push('신청 마감일을 선택해주세요.');

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

    if (!eventCategoryCsv.trim()) {
      errors.push('거리/코스를 입력해주세요. (여러 종목은 | 로 구분)');
    }

    return { ok: errors.length === 0, errors };
  };

  const buildApiBody = (): ScheduleLocalEventFormPayload => {
    const lowest = Number(lowestAmountStr.replace(/,/g, '')) || 0;
    return {
      eventName: eventName.trim(),
      eventUrl: eventUrl.trim(),
      eventStatus,
      visibleStatus,
      eventStartDate: formatDateTime(eventStartDate, eventStartHh, eventStartMm),
      registStartDate: formatDateTime(registStartDate, registStartHh, registStartMm),
      registDeadline: formatDateTime(registDeadline, registDeadlineHh, registDeadlineMm),
      eventCategoryCsv: eventCategoryCsv.trim(),
      lowestAmount: lowest,
      applicantCompany: applicantCompany.trim() || undefined,
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
    eventCategoryCsv,
    setEventCategoryCsv,
    applicantCompany,
    setApplicantCompany,
    promotionBanner,
    setPromotionBanner,
    validate,
    buildApiBody,
  };
}
