// app/admin/local-events/components/LocalEventForm.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';

import FormTable from '@/components/admin/Form/FormTable';
import Button from '@/components/common/Button/Button';
import InlineLabelPairRow from '@/components/admin/Form/InlineLabelPairRow';
import FormRow from '@/components/admin/Form/FormRow';
import TextField from '@/components/common/TextField/TextField';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';
import BirthDateInput from '@/components/common/FormField/BirthDateInput';
import { TimeSelect } from '@/components/common/Dropdown/TimeSelect';
import FileUploader from '@/components/common/Upload/FileUploader';
import type { UploadItem } from '@/components/common/Upload/types';

// 훅/타입
import { useLocalEventForm } from '../register/hooks/useLocalEventForm';
import type { LocalEventCreatePayload } from '../register/api/types';
import type { LocalEventUpdatePayload } from '../[eventId]/edit/api/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  onSubmit: (payload: LocalEventCreatePayload | LocalEventUpdatePayload) => Promise<void>;
  onBack?: () => void;
  prefill?: Parameters<typeof useLocalEventForm>[0] & {
    existingPromotionBanner?: string;
  };
};

export default function LocalEventForm({
  mode,
  onSubmit,
  onBack,
  prefill,
}: Props) {
  // 커스텀 모달 상태
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingPromotionBanner] = useState(prefill?.existingPromotionBanner);

  // 필드 ref 생성
  const fieldRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<HTMLElement>>();
    refs.set('eventStartDate', React.createRef<HTMLDivElement>());
    refs.set('registStartDate', React.createRef<HTMLDivElement>());
    refs.set('registDeadline', React.createRef<HTMLDivElement>());
    refs.set('eventName', React.createRef<HTMLInputElement>());
    return refs;
  }, []);

  // 상태/빌더
  const f = useLocalEventForm(prefill);

  // 공통 스타일
  const readOnly = false;
  const inputColorCls = 'text-black';
  const fieldCls =
    'w-full text-[16px] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 shadow-none';
  const noop = () => {};
  const dimCls = readOnly ? 'text-[#646464]' : 'text-black';

  // 저장 핸들러
  const handleSave = async () => {
    const validation = f.validate();
    if (!validation.ok) {
      setValidationErrors(validation.errors);
      setValidationModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = f.buildApiBody();
      
      // 수정 모드일 때는 existingPromotionBanner 포함
      if (mode === 'edit') {
        const updatePayload: LocalEventUpdatePayload = {
          ...payload,
          existingPromotionBanner: existingPromotionBanner,
        };
        await onSubmit(updatePayload);
      } else {
        await onSubmit(payload);
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : mode === 'edit' 
          ? '지역대회 수정 중 오류가 발생했습니다.'
          : '지역대회 등록 중 오류가 발생했습니다.';
      setValidationErrors([errorMsg]);
      setValidationModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'edit' ? '지역대회 수정' : '지역대회 기본 정보';
  const submitButtonText = mode === 'edit' ? (loading ? '수정 중...' : '수정하기') : (loading ? '저장 중...' : '저장하기');

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto px-4 space-y-5 pb-6">
        {/* 제목과 취소 버튼 */}
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <Button
                tone="dark"
                size="sm"
                widthType="pager"
                onClick={onBack}
                disabled={loading}
              >
                취소하기
              </Button>
            </div>
          </div>
        </div>

        <FormTable labelWidth={200}>
          {/* 대회명 */}
          <FormRow label="대회명" contentClassName="items-center">
            <TextField
              ref={fieldRefs?.get('eventName') as React.RefObject<HTMLInputElement>}
              placeholder="대회명을 입력하세요."
              value={f.eventName}
              onChange={e =>
                readOnly ? noop() : f.setEventName(e.currentTarget.value)
              }
              className={cn(fieldCls, inputColorCls)}
              readOnly={readOnly}
            />
          </FormRow>

          {/* 대회 URL */}
          <FormRow label="대회 URL" contentClassName="items-center">
            <TextField
              placeholder="대회 URL을 입력하세요."
              value={f.eventUrl}
              onChange={e =>
                readOnly ? noop() : f.setEventUrl(e.currentTarget.value)
              }
              className={cn(fieldCls, inputColorCls)}
              readOnly={readOnly}
            />
          </FormRow>

          {/* 대회 상태 / 공개 여부 */}
          <InlineLabelPairRow
            leftLabel="대회 상태"
            rightLabel="공개 여부"
            reserveTailAction
            leftField={
              <div className="px-4 py-2">
                <RadioGroup
                  name={`${f.uid}-eventStatus`}
                  value={f.eventStatus}
                  onValueChange={f.setEventStatus}
                  gapPx={40}
                  options={[
                    { value: 'PENDING', label: '대기' },
                    { value: 'OPEN', label: '진행중' },
                    { value: 'CLOSED', label: '종료' },
                  ]}
                />
              </div>
            }
            rightField={
              <div className="px-4 py-2">
                <RadioGroup
                  name={`${f.uid}-visibleStatus`}
                  value={f.visibleStatus}
                  onValueChange={f.setVisibleStatus}
                  gapPx={40}
                  options={[
                    { value: 'OPEN', label: '공개' },
                    { value: 'TEST', label: '테스트' },
                    { value: 'CLOSE', label: '비공개' },
                  ]}
                />
              </div>
            }
          />

          {/* 대회 시작일 */}
          <FormRow label="대회 시작일" contentClassName="items-left mr-auto">
            <div
              ref={fieldRefs?.get('eventStartDate') as React.RefObject<HTMLDivElement>}
              className="grid w-full items-center gap-3 mr-20"
              style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
            >
              <BirthDateInput
                value={f.eventStartDate}
                onChange={readOnly ? noop : f.setEventStartDate}
                placeholder="날짜를 선택하세요"
                variant="flat"
                className={cn('min-w-[280px]', dimCls)}
                disabled={readOnly}
                readOnly={true}
              />

              <TimeSelect
                value={f.eventStartHh}
                options={f.hours}
                onChange={f.setEventStartHh}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                시
              </span>

              <TimeSelect
                value={f.eventStartMm}
                options={f.minutes}
                onChange={f.setEventStartMm}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                분
              </span>
            </div>
          </FormRow>

          {/* 신청 시작일 */}
          <FormRow label="신청 시작일" contentClassName="items-left mr-auto">
            <div
              ref={fieldRefs?.get('registStartDate') as React.RefObject<HTMLDivElement>}
              className="grid w-full items-center gap-3 mr-20"
              style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
            >
              <BirthDateInput
                value={f.registStartDate}
                onChange={readOnly ? noop : f.setRegistStartDate}
                placeholder="날짜를 선택하세요"
                variant="flat"
                className={cn('min-w-[280px]', dimCls)}
                disabled={readOnly}
                readOnly={true}
              />

              <TimeSelect
                value={f.registStartHh}
                options={f.hours}
                onChange={f.setRegistStartHh}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                시
              </span>

              <TimeSelect
                value={f.registStartMm}
                options={f.minutes}
                onChange={f.setRegistStartMm}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                분
              </span>
            </div>
          </FormRow>

          {/* 신청 마감일 */}
          <FormRow label="신청 마감일" contentClassName="items-left mr-auto">
            <div
              ref={fieldRefs?.get('registDeadline') as React.RefObject<HTMLDivElement>}
              className="grid w-full items-center gap-3 mr-20"
              style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
            >
              <BirthDateInput
                value={f.registDeadline}
                onChange={readOnly ? noop : f.setRegistDeadline}
                placeholder="날짜를 선택하세요"
                variant="flat"
                className={cn('min-w-[280px]', dimCls)}
                disabled={readOnly}
                readOnly={true}
              />

              <TimeSelect
                value={f.registDeadlineHh}
                options={f.hours}
                onChange={f.setRegistDeadlineHh}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                시
              </span>

              <TimeSelect
                value={f.registDeadlineMm}
                options={f.minutes}
                onChange={f.setRegistDeadlineMm}
                className={cn(dimCls)}
                disabled={readOnly}
              />

              <span className={cn('text-center', readOnly && 'text-[#646464]')}>
                분
              </span>
            </div>
          </FormRow>

          {/* 거리/코스 (CSV 단일 문자열) */}
          <FormRow label="거리/코스" contentClassName="items-center">
            <TextField
              placeholder='예) 5km | 10km | Half'
              value={f.eventCategoryCsv}
              onChange={e => {
                f.setEventCategoryCsv(e.currentTarget.value);
              }}
              className={cn(fieldCls, inputColorCls)}
              readOnly={readOnly}
            />
          </FormRow>

          {/* 홍보 배너 */}
          <FormRow label="홍보 배너" contentClassName="items-start pl-4">
            <div className="w-full pt-2 pr-4 pb-4">
              {/* 수정 모드일 때만 기존 이미지 표시 */}
              {mode === 'edit' && existingPromotionBanner && !f.promotionBanner && (
                <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">현재 홍보 배너</p>
                  <img
                    src={existingPromotionBanner}
                    alt="현재 홍보 배너"
                    className="max-h-48 rounded-lg object-contain"
                  />
                </div>
              )}
              
              <FileUploader
                single={true}
                accept="image/*"
                maxSizeMB={20}
                value={f.promotionBanner ? [{
                  id: 'promotion-banner',
                  file: f.promotionBanner,
                  name: f.promotionBanner.name,
                  size: f.promotionBanner.size,
                  sizeMB: Math.round(f.promotionBanner.size / 1024 / 1024 * 100) / 100,
                  tooLarge: false,
                }] : []}
                onChange={(items: UploadItem[]) => {
                  if (items.length > 0 && items[0].file) {
                    f.setPromotionBanner(items[0].file as File);
                  } else {
                    f.setPromotionBanner(undefined);
                  }
                }}
                disabled={readOnly}
              />
            </div>
          </FormRow>
        </FormTable>

        {/* 저장 버튼 */}
        <div className="flex justify-center mx-auto">
          <Button
            tone="primary"
            widthType="pager"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            aria-busy={loading}
          >
            {submitButtonText}
          </Button>
        </div>
      </div>

      {/* 검증 에러 모달 */}
      {validationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">입력 오류</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-gray-700">{error}</li>
              ))}
            </ul>
            <Button
              tone="primary"
              widthType="pager"
              size="sm"
              onClick={() => setValidationModalOpen(false)}
            >
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

