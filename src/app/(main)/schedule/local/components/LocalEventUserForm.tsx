'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/common/Button/Button';
import TextField from '@/components/common/TextField/TextField';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';
import BirthDateInput from '@/components/common/FormField/BirthDateInput';
import { TimeSelect } from '@/components/common/Dropdown/TimeSelect';
import type { UploadItem } from '@/components/common/Upload/types';
import LocalEventResponsiveFileField from './LocalEventResponsiveFileField';
import { useScheduleLocalEventForm } from '../hooks/useScheduleLocalEventForm';
import type { ScheduleLocalEventFormPrefill } from '../hooks/useScheduleLocalEventForm';
import type { ScheduleLocalEventFormPayload } from '../types/localEvent';
import { toast } from 'react-toastify';
import { ChevronLeft } from 'lucide-react';

type Props = {
  mode: 'create' | 'edit';
  prefill?: ScheduleLocalEventFormPrefill;
  existingPromotionBannerUrl?: string;
  submitLabel?: string;
  onSubmit: (payload: ScheduleLocalEventFormPayload) => Promise<void>;
  onBack: () => void;
};

/** 바깥 카드 — 페이지와 확실히 구분 */
const cardClass =
  'rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)] border border-gray-200 ring-1 ring-gray-900/5 p-4 sm:p-6 md:p-8';

/** 안쪽 필드 그룹 박스 */
function FormBlock({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm',
        className
      )}
    >
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description ? <p className="mt-1 text-xs text-gray-500">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const labelCls = 'block text-sm font-medium text-gray-800 mb-2';

/** 단일 텍스트 입력 — 테두리 있는 필드 */
function BorderedInput(props: React.ComponentProps<typeof TextField>) {
  return (
    <TextField
      variant="default"
      borderTone="light"
      {...props}
      className={cn(
        'w-full text-[14px] text-gray-900 placeholder:text-gray-400',
        props.className
      )}
    />
  );
}

export default function LocalEventUserForm({
  mode,
  prefill,
  existingPromotionBannerUrl,
  submitLabel,
  onSubmit,
  onBack,
}: Props) {
  const f = useScheduleLocalEventForm(prefill);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const v = f.validate();
    if (!v.ok) {
      if (v.errors.length === 1) {
        toast.error(v.errors[0]);
      } else {
        toast.error(
          <div className="text-left text-sm">
            <p className="font-semibold text-white mb-2">입력 내용을 확인해 주세요.</p>
            <ul className="list-disc pl-4 space-y-1 text-white/95">
              {v.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>,
          { autoClose: Math.min(12000, 4000 + v.errors.length * 1500) }
        );
      }
      return;
    }
    setLoading(true);
    try {
      await onSubmit(f.buildApiBody());
    } catch {
      // API 실패는 QueryProvider MutationCache에서 toast 처리
    } finally {
      setLoading(false);
    }
  };

  const showExistingBanner =
    mode === 'edit' && existingPromotionBannerUrl && !f.promotionBanner;

  const defaultSubmit =
    mode === 'edit' ? (loading ? '수정 중...' : '수정하기') : loading ? '등록 중...' : '등록하기';

  const pageTitle = mode === 'edit' ? '지역대회 수정' : '지역대회 등록';
  const compactSubmitLabel =
    loading
      ? mode === 'edit'
        ? '수정 중...'
        : '등록 중...'
      : mode === 'edit'
        ? '수정'
        : '등록';

  const timeSelectShell =
    'min-h-10 h-10 rounded-lg border border-gray-200 bg-white shadow-sm flex items-stretch sm:min-h-12 sm:h-12';
  const timeSelectBtnCls =
    // TimeSelect 내부의 옵션 버튼까지 같이 건드리지 않도록, 트리거 버튼(직접 자식)만 선택
    'w-full h-full [&>button]:h-full [&>button]:min-h-10 [&>button]:sm:min-h-12 [&>button]:rounded-lg [&>button]:border-0 [&>button]:text-[12px] sm:[&>button]:text-[13px]';

  return (
    <div className={cn(cardClass)}>
      {/* 모바일·태블릿: 뒤로 = 취소, 제목과 한 줄 (데스크톱보다 위·아래 여백 축소) */}
      <div className="mb-4 border-b border-gray-200 pb-3 sm:mb-5 sm:pb-4 md:mb-6 md:pb-4 lg:hidden">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className={cn(
            'flex w-full min-h-10 items-center gap-0.5 rounded-lg py-0.5 pl-0.5 pr-2 text-left text-base font-semibold text-gray-900 sm:min-h-11 sm:text-lg',
            'hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]'
          )}
        >
          <ChevronLeft className="h-6 w-6 shrink-0 text-gray-800" aria-hidden />
          <span>{pageTitle}</span>
        </button>
      </div>

      {/* 데스크톱: 제목 + 상단 취소 */}
      <div className="mb-8 hidden flex-row items-center justify-between gap-3 border-b border-gray-200 pb-5 lg:flex">
        <h2 className="text-xl font-semibold text-gray-900">{pageTitle}</h2>
        <Button
          type="button"
          tone="dark"
          size="sm"
          widthType="pager"
          onClick={onBack}
          disabled={loading}
        >
          취소
        </Button>
      </div>

      <div className="space-y-6">
        <FormBlock title="기본 정보" description="대회 이름과 공식 링크를 입력해 주세요.">
          <div>
            <label className={labelCls} htmlFor={`${f.uid}-name`}>
              대회명
            </label>
            <BorderedInput
              id={`${f.uid}-name`}
              placeholder="대회명을 입력하세요"
              value={f.eventName}
              onChange={(e) => f.setEventName(e.currentTarget.value)}
              fontSizePx={14}
              heightPx={48}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor={`${f.uid}-url`}>
              대회 URL
            </label>
            <BorderedInput
              id={`${f.uid}-url`}
              placeholder="https://..."
              value={f.eventUrl}
              onChange={(e) => f.setEventUrl(e.currentTarget.value)}
              fontSizePx={14}
              heightPx={48}
            />
          </div>
        </FormBlock>

        <FormBlock title="상태 설정" description="사이트 노출 방식만 선택합니다. 신청 상태는 협회 검토·처리에 따라 반영됩니다.">
          <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 sm:p-4">
            <span className="block text-xs font-medium text-gray-600 mb-2">공개 여부</span>
            <RadioGroup
              name={`${f.uid}-visible`}
              value={f.visibleStatus}
              onValueChange={f.setVisibleStatus}
              className="text-[13px]"
              gapPx={14}
              options={[
                { value: 'OPEN', label: '공개' },
                { value: 'TEST', label: '테스트' },
                { value: 'CLOSE', label: '비공개' },
              ]}
            />
          </div>
        </FormBlock>

        <FormBlock title="일정" description="날짜를 눌러 선택한 뒤 시·분을 지정합니다.">
          {(['eventStart', 'registStart', 'registDeadline'] as const).map((key) => {
            const config =
              key === 'eventStart'
                ? {
                    label: '대회 시작일',
                    date: f.eventStartDate,
                    setDate: f.setEventStartDate,
                    hh: f.eventStartHh,
                    setHh: f.setEventStartHh,
                    mm: f.eventStartMm,
                    setMm: f.setEventStartMm,
                  }
                : key === 'registStart'
                  ? {
                      label: '신청 시작일',
                      date: f.registStartDate,
                      setDate: f.setRegistStartDate,
                      hh: f.registStartHh,
                      setHh: f.setRegistStartHh,
                      mm: f.registStartMm,
                      setMm: f.setRegistStartMm,
                    }
                  : {
                      label: '신청 마감일',
                      date: f.registDeadline,
                      setDate: f.setRegistDeadline,
                      hh: f.registDeadlineHh,
                      setHh: f.setRegistDeadlineHh,
                      mm: f.registDeadlineMm,
                      setMm: f.setRegistDeadlineMm,
                    };
            return (
              <div
                key={key}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:p-4 space-y-3 min-w-0"
              >
                <span className="block text-sm font-medium text-gray-800">{config.label}</span>
                <div className="flex flex-col gap-3 min-w-0 max-w-2xl md:grid md:grid-cols-[minmax(0,1fr)_88px_14px_88px_14px] md:gap-2 md:items-center">
                  <BirthDateInput
                    value={config.date}
                    onChange={config.setDate}
                    placeholder="날짜 선택"
                    variant="default"
                    borderTone="light"
                    fontSizePx={14}
                    heightPx={48}
                    className="min-w-0 w-full text-gray-900 text-[13px] sm:text-[14px]"
                    readOnly
                  />
                  <div className="flex flex-row flex-wrap items-stretch gap-x-1.5 gap-y-2 min-w-0 md:contents">
                    <div className={cn(timeSelectShell, 'w-[4.75rem] shrink-0 md:w-[88px]')}>
                      <TimeSelect
                        className={timeSelectBtnCls}
                        value={config.hh}
                        options={f.hours}
                        onChange={config.setHh}
                      />
                    </div>
                    <span className="flex w-3 shrink-0 items-center justify-center text-[11px] font-medium text-gray-500 sm:text-xs md:w-[14px]">
                      시
                    </span>
                    <div className={cn(timeSelectShell, 'w-[4.75rem] shrink-0 md:w-[88px]')}>
                      <TimeSelect
                        className={timeSelectBtnCls}
                        value={config.mm}
                        options={f.minutes}
                        onChange={config.setMm}
                      />
                    </div>
                    <span className="flex w-3 shrink-0 items-center justify-center text-[11px] font-medium text-gray-500 sm:text-xs md:w-[14px]">
                      분
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </FormBlock>

        <FormBlock
          title="종목·소속"
          description="종목은 반드시 | 로 구분합니다. (예: 5km | 10km)"
        >
          <div>
            <label className={labelCls} htmlFor={`${f.uid}-cat`}>
              거리·종목
            </label>
            <BorderedInput
              id={`${f.uid}-cat`}
              placeholder="예) 5km | 10km | Half"
              value={f.eventCategoryCsv}
              onChange={(e) => f.setEventCategoryCsv(e.currentTarget.value)}
              fontSizePx={14}
              heightPx={48}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor={`${f.uid}-co`}>
              신청자 소속 (회사명)
            </label>
            <BorderedInput
              id={`${f.uid}-co`}
              placeholder="회사 또는 단체명"
              value={f.applicantCompany}
              onChange={(e) => f.setApplicantCompany(e.currentTarget.value)}
              fontSizePx={14}
              heightPx={48}
            />
          </div>
        </FormBlock>

        <FormBlock title="홍보 배너" description="선택 사항입니다. 이미지 파일만 업로드할 수 있습니다.">
          {showExistingBanner ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-2">
              <p className="text-xs font-medium text-gray-600 mb-2">현재 등록된 배너</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingPromotionBannerUrl}
                alt="홍보 배너"
                className="max-h-40 rounded-lg object-contain border border-gray-200"
              />
            </div>
          ) : null}
          <LocalEventResponsiveFileField
            single
            accept="image/*"
            maxSizeMB={20}
            value={
              f.promotionBanner
                ? [
                    {
                      id: 'banner',
                      file: f.promotionBanner,
                      name: f.promotionBanner.name,
                      size: f.promotionBanner.size,
                      sizeMB: Math.round((f.promotionBanner.size / 1024 / 1024) * 100) / 100,
                      tooLarge: false,
                    },
                  ]
                : []
            }
            onChange={(items: UploadItem[]) => {
              if (items[0]?.file) f.setPromotionBanner(items[0].file as File);
              else f.setPromotionBanner(undefined);
            }}
          />
        </FormBlock>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        {/* 모바일·태블릿: 취소 / 등록(수정) — 데스크톱과 동일 120px 고정 너비, 가운데 정렬 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:hidden">
          <Button
            type="button"
            tone="dark"
            size="sm"
            widthType="pager"
            className="max-[440px]:!w-[88px] max-[440px]:!min-w-[88px] max-[440px]:!px-2 max-[440px]:text-[13px]"
            onClick={onBack}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="button"
            tone="primary"
            size="sm"
            widthType="pager"
            className="max-[440px]:!w-[88px] max-[440px]:!min-w-[88px] max-[440px]:!px-2 max-[440px]:text-[13px]"
            onClick={handleSave}
            disabled={loading}
          >
            {submitLabel ?? compactSubmitLabel}
          </Button>
        </div>
        <div className="hidden justify-center lg:flex">
          <Button
            type="button"
            tone="primary"
            size="sm"
            widthType="pager"
            onClick={handleSave}
            disabled={loading}
          >
            {submitLabel ?? defaultSubmit}
          </Button>
        </div>
      </div>
    </div>
  );
}
