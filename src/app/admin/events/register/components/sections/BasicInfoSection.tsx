// src/app/admin/events/register/components/sections/BasicInfoSection.tsx
'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import InlineLabelPairRow from '@/components/admin/Form/InlineLabelPairRow';
import FormRow from '@/components/admin/Form/FormRow';
import TextField from '@/components/common/TextField/TextField';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';
import BirthDateInput from '@/components/common/FormField/BirthDateInput';
import { TimeSelect } from '@/components/common/Dropdown/TimeSelect';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

// useCompetitionForm의 반환 타입을 정의
export type CompetitionFormHandle = {
  uid: string;
  titleKo: string;
  setTitleKo: (value: string) => void;
  titleEn: string;
  setTitleEn: (value: string) => void;
  applyStatus: RegStatus;
  setApplyStatus: (value: RegStatus) => void;
  date: string;
  setDate: (value: string) => void;
  hh: string;
  setHh: (value: string) => void;
  mm: string;
  setMm: (value: string) => void;
  registStartDate: string;
  setRegistStartDate: (value: string) => void;
  registStartHh: string;
  setRegistStartHh: (value: string) => void;
  registStartMm: string;
  setRegistStartMm: (value: string) => void;
  deadlineDate: string;
  setDeadlineDate: (value: string) => void;
  deadlineHh: string;
  setDeadlineHh: (value: string) => void;
  deadlineMm: string;
  setDeadlineMm: (value: string) => void;
  place: string;
  setPlace: (value: string) => void;
  bank?: string;
  setBank?: (value: string) => void;
  virtualAccount?: string;
  setVirtualAccount?: (value: string) => void;
  eventPageUrl: string;
  setEventPageUrl: (value: string) => void;
  maxParticipants: string;
  setMaxParticipants: (value: string) => void;
  hours: string[];
  minutes: string[];
  paymentDeadlineDate: string;
  setPaymentDeadlineDate: (value: string) => void;
  paymentDeadlineHh: string;
  setPaymentDeadlineHh: (value: string) => void;
  paymentDeadlineMm: string;
  setPaymentDeadlineMm: (value: string) => void;
  validate?: () => { ok: boolean; errors: string[] };
  buildApiBody?: () => any;
};

export default function BasicInfoSection({
  f,
  readOnly,
  fieldCls,
  inputColorCls,
  fieldRefs,
}: {
  f: CompetitionFormHandle;
  readOnly: boolean;
  fieldCls: string;
  inputColorCls: string;
  fieldRefs?: Map<string, React.RefObject<HTMLElement>>;
}) {
  const noop = () => {};
  const dimCls = readOnly ? 'text-[#646464]' : 'text-black';

  return (
    <>
      <InlineLabelPairRow
        leftLabel="대회명(한글)"
        rightLabel="대회명(영문)"
        reserveTailAction
        leftField={
          <TextField
            ref={fieldRefs?.get('titleKo') as React.RefObject<HTMLInputElement>}
            placeholder="대회명을 입력하세요."
            value={f.titleKo}
            onChange={e =>
              readOnly ? noop() : f.setTitleKo(e.currentTarget.value)
            }
            className={cn(fieldCls, inputColorCls)}
            readOnly={readOnly}
          />
        }
        rightField={
          <TextField
            placeholder="대회명을 입력하세요."
            value={f.titleEn}
            onChange={e =>
              readOnly ? noop() : f.setTitleEn(e.currentTarget.value)
            }
            className={cn(fieldCls, inputColorCls)}
            readOnly={readOnly}
          />
        }
      />

      {/* 신청여부 */}
      <FormRow label="신청상태" contentClassName="items-center pl-4">
        <div className={dimCls}>
          <RadioGroup
            name={`${f.uid}-applyStatus`}
            value={f.applyStatus}
            onValueChange={readOnly ? noop : f.setApplyStatus}
            gapPx={40}
            options={[
              { value: '접수중', label: '접수중' },
              { value: '비접수', label: '비접수' },
              { value: '접수마감', label: '접수마감' },
            ]}
          />
        </div>
      </FormRow>

      {/* 신청시작일 */}
      <FormRow label="신청시작일" contentClassName="items-left mr-auto">
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

      {/* 접수마감일자 */}
      <FormRow label="접수마감" contentClassName="items-left mr-auto">
        <div
          ref={fieldRefs?.get('deadlineDate') as React.RefObject<HTMLDivElement>}
          className="grid w-full items-center gap-3 mr-20"
          style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
        >
          <BirthDateInput
            value={f.deadlineDate}
            onChange={readOnly ? noop : f.setDeadlineDate}
            placeholder="날짜를 선택하세요"
            variant="flat"
            className={cn('min-w-[280px]', dimCls)}
            disabled={readOnly}
            readOnly={true}
          />

          <TimeSelect
            value={f.deadlineHh}
            options={f.hours}
            onChange={f.setDeadlineHh}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            시
          </span>

          <TimeSelect
            value={f.deadlineMm}
            options={f.minutes}
            onChange={f.setDeadlineMm}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            분
          </span>
        </div>
      </FormRow>

      {/* 입금마감일자 */}
      <FormRow label="입금마감" contentClassName="items-left mr-auto">
        <div
          ref={fieldRefs?.get('paymentDeadlineDate') as React.RefObject<HTMLDivElement>}
          className="grid w-full items-center gap-3 mr-20"
          style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
        >
          <BirthDateInput
            value={f.paymentDeadlineDate}
            onChange={readOnly ? noop : f.setPaymentDeadlineDate}
            placeholder="날짜를 선택하세요"
            variant="flat"
            className={cn('min-w-[280px]', dimCls)}
            disabled={readOnly}
            readOnly={true}
          />

          <TimeSelect
            value={f.paymentDeadlineHh}
            options={f.hours}
            onChange={f.setPaymentDeadlineHh}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            시
          </span>

          <TimeSelect
            value={f.paymentDeadlineMm}
            options={f.minutes}
            onChange={f.setPaymentDeadlineMm}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            분
          </span>
        </div>
      </FormRow>

      {/* 개최일시 */}
      <FormRow label="개최일시" contentClassName="items-left mr-auto">
        <div
          ref={fieldRefs?.get('date') as React.RefObject<HTMLDivElement>}
          className="grid w-full items-center gap-3 mr-20"
          style={{ gridTemplateColumns: '1fr 90px 20px 90px 20px' }}
        >
          <BirthDateInput
            value={f.date}
            onChange={readOnly ? noop : f.setDate}
            placeholder="날짜를 선택하세요"
            variant="flat"
            className={cn('min-w-[280px]', dimCls)}
            disabled={readOnly}
            readOnly={true}
          />

          <TimeSelect
            value={f.hh}
            options={f.hours}
            onChange={f.setHh}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            시
          </span>

          <TimeSelect
            value={f.mm}
            options={f.minutes}
            onChange={f.setMm}
            className={cn(dimCls)}
            disabled={readOnly}
          />

          <span className={cn('text-center', readOnly && 'text-[#646464]')}>
            분
          </span>
        </div>
      </FormRow>

      {/* 선착순 접수 인원수 */}
      <FormRow label="선착순 접수 인원수">
        <TextField
          placeholder="최대 접수 가능 인원수를 입력하세요. (미입력시 제한없음)"
          value={f.maxParticipants}
          onChange={e =>
            readOnly ? noop() : f.setMaxParticipants(e.currentTarget.value)
          }
          className={cn(fieldCls, inputColorCls)}
          readOnly={readOnly}
          type="number"
          min="1"
        />
      </FormRow>

      {/* 개최장소 */}
      <FormRow label="개최장소">
        <TextField
          placeholder="개최장소를 입력하세요."
          value={f.place}
          onChange={e =>
            readOnly ? noop() : f.setPlace(e.currentTarget.value)
          }
      className={cn(fieldCls, inputColorCls)}
      readOnly={readOnly}
    />
  </FormRow>

      {/* 대회 페이지 주소명 */}
      <FormRow label="대회 페이지 주소명">
        <TextField
          placeholder="대회 페이지 주소명을 입력하세요. (예: seoul-marathon-2025)"
          value={f.eventPageUrl}
          onChange={e =>
            readOnly ? noop() : f.setEventPageUrl(e.currentTarget.value)
          }
          className={cn(fieldCls, inputColorCls)}
          readOnly={readOnly}
        />
      </FormRow>

  {/* 결제 정보: 은행명 / 계좌번호 */}
  <InlineLabelPairRow
    leftLabel="은행명"
    rightLabel="계좌번호"
    reserveTailAction
    leftField={
    <TextField
      placeholder="예: 국민은행"
      value={f.bank ?? ''}
      onChange={e => (readOnly || !f.setBank ? noop() : f.setBank(e.currentTarget.value))}
      className={cn(fieldCls, inputColorCls)}
      readOnly={readOnly}
    />
    }
    rightField={
    <TextField
      placeholder="예: 123456-01-123456"
      value={f.virtualAccount ?? ''}
      onChange={e => (readOnly || !f.setVirtualAccount ? noop() : f.setVirtualAccount(e.currentTarget.value))}
      className={cn(fieldCls, inputColorCls)}
      readOnly={readOnly}
    />
    }
  />
    </>
  );
}
