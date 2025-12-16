'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { cn } from '@/utils/cn';

import FormTable from '@/components/admin/Form/FormTable';
import Button from '@/components/common/Button/Button';
import InlineLabelPairRow from '@/components/admin/Form/InlineLabelPairRow';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';

// 섹션
import BasicInfoSection from './sections/BasicInfoSection';
import PartiesSection from './sections/PartiesSection';
import UploadsSection from './sections/UploadsSection';
import ThemeSection from './sections/ThemeSection';

// 파츠
import ValidationErrorModal from './parts/ValidationErrorModal';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';

// 훅/타입
import { useCompetitionForm } from '../hooks/useCompetitionForm';
import { useFormStatePersistence } from '../hooks/useFormStatePersistence';
import { FormStateStorage } from '../utils/formStateStorage';
import { useFormValidation } from '../hooks/useFormValidation';
import { useFormSubmission } from '../hooks/useFormSubmission';
import type {
  Shuttle,
  EventCreatePayload,
} from '../api/types';

type Props = {
  onRegister: (payload: EventCreatePayload) => Promise<void>;
  onBack?: () => void;
  prefill?: Parameters<typeof useCompetitionForm>[0];
};

export default function CreateForm({
  onRegister,
  onBack,
  prefill,
}: Props) {
  // 커스텀 모달 상태
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 필드 ref 생성
  const fieldRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<HTMLElement>>();
    refs.set('date', React.createRef<HTMLDivElement>());
    refs.set('registStartDate', React.createRef<HTMLDivElement>());
    refs.set('deadlineDate', React.createRef<HTMLDivElement>());
    refs.set('paymentDeadlineDate', React.createRef<HTMLDivElement>());
    refs.set('titleKo', React.createRef<HTMLInputElement>());
    return refs;
  }, []);

  // prefill을 useMemo로 감싸서 불필요한 재렌더링 방지
  const stablePrefill = useMemo(() => prefill, [prefill]);

  // 상태/빌더
  const f = useCompetitionForm(stablePrefill);

  // 검증 로직
  const { validateBasicInfo } = useFormValidation();

  // 제출 로직
  const {
    loading,
    eventCreated,
    setEventCreated,
    saveBasicInfo: submitSaveBasicInfo,
  } = useFormSubmission({
    f,
    gifts: [],
    courses: [],
    onRegister,
    onSubmit: undefined,
    onSuccess: () => {},
  });

  // 폼 상태 자동 저장 (생성 모드에서만)
  // 새로고침 시 localStorage 비우기 (초기화)
  useEffect(() => {
    FormStateStorage.clear();
  }, []);

  const { clearSavedState } = useFormStatePersistence({
    shouldRestore: false,
    getFormState: () => {
      const body = f.buildApiBody();
      const stateToSave = {
        ...body,
        groups: [],
        date: f.date,
        hh: f.hh,
        mm: f.mm,
        registStartDate: f.registStartDate,
        registStartHh: f.registStartHh,
        registStartMm: f.registStartMm,
        deadlineDate: f.deadlineDate,
        deadlineHh: f.deadlineHh,
        deadlineMm: f.deadlineMm,
        paymentDeadlineDate: f.paymentDeadlineDate,
        paymentDeadlineHh: f.paymentDeadlineHh,
        paymentDeadlineMm: f.paymentDeadlineMm,
        bank: f.bank,
        virtualAccount: f.virtualAccount,
      } as EventCreatePayload & {
        date: string;
        hh: string;
        mm: string;
        registStartDate: string;
        registStartHh: string;
        registStartMm: string;
        deadlineDate: string;
        deadlineHh: string;
        deadlineMm: string;
        paymentDeadlineDate: string;
        paymentDeadlineHh: string;
        paymentDeadlineMm: string;
        bank?: string;
        virtualAccount?: string;
      };
      
      return stateToSave;
    },
    restoreFormState: () => {},
    saveInterval: 2000,
  });

  // 공통 스타일
  const readOnly = false;
  const inputColorCls = 'text-black';
  const fieldCls =
    'w-full text-[16px] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 shadow-none';
  const noop = () => {};

  // 1차 저장: 대회 기본 정보만 저장 (기념품/종목 제외)
  const saveBasicInfo = async () => {
    const v = validateBasicInfo(f);
    if (!v.ok) {
      setValidationErrors(v.errors);
      setValidationModalOpen(true);
      return;
    }

    setEventCreated(false);
    
    try {
      await submitSaveBasicInfo();
    } catch (error) {
      setEventCreated(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto px-4 space-y-10 pb-12">
        <FormTable
          title="대회 기본 정보"
          labelWidth={200}
          actions={
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
          }
        >
          {/* 1. 대회 기본 정보 */}
          <BasicInfoSection
            f={f}
            readOnly={readOnly}
            fieldCls={fieldCls}
            inputColorCls={inputColorCls}
            fieldRefs={fieldRefs}
          />

          {/* 공개여부 / 셔틀 */}
          <InlineLabelPairRow
            leftLabel="공개여부"
            rightLabel="셔틀 운행여부"
            reserveTailAction
            leftField={
              <div className="px-4 py-2">
                <RadioGroup
                  name={`${f.uid}-visibility`}
                  value={f.visibility}
                  onValueChange={f.setVisibility}
                  gapPx={40}
                  options={[
                    { value: '공개', label: '공개' },
                    { value: '비공개', label: '비공개' },
                  ]}
                />
              </div>
            }
            rightField={
              <div className="px-4 py-2">
                <RadioGroup
                  name={`${f.uid}-shuttle`}
                  value={f.shuttle}
                  onValueChange={v => f.setShuttle(v as Shuttle)}
                  gapPx={40}
                  options={[
                    { value: '운행', label: '운행' },
                    { value: '비운행', label: '비운행' },
                  ]}
                />
                <span className="text-xs text-[#646464]">
                  (현재는 사용되지 않습니다)
                </span>
              </div>
            }
          />
        </FormTable>

        {/* 2. 배너 */}
        <PartiesSection f={f} readOnly={readOnly} />

        {/* 3. 각 페이지별 이미지 등록 */}
        <UploadsSection f={f} readOnly={readOnly} />

        {/* 색상 섹션 */}
        <ThemeSection f={f} readOnly={readOnly} />

        {/* 기념품/종목 설정 안내 */}
        <div className="mx-auto px-4 mb-6">
          <NoticeMessage
            items={[
              {
                text: '※ 대회 등록이 완료되면 기념품과 종목을 설정할 수 있습니다.',
                highlight: false,
              },
              {
                text: '※ 기념품/종목 설정하기를 선택하면 대회 수정 페이지로 이동하여 바로 설정할 수 있습니다.',
                highlight: false,
              },
              {
                text: '※ 나중에 설정하기를 선택하면 대회 상세 페이지로 이동하며, 이후 대회 수정 페이지에서 기념품과 종목을 설정할 수 있습니다.',
                highlight: false,
              },
            ]}
          />
        </div>

        {/* 1차 저장 버튼 */}
        <div className="flex justify-center mx-auto">
          <Button
            tone="primary"
            widthType="pager"
            size="sm"
            onClick={saveBasicInfo}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>

      {/* 커스텀 모달들 */}
      <ValidationErrorModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        errors={validationErrors}
        fieldRefs={fieldRefs}
      />
      <ValidationErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="알림"
        errors={[errorMessage]}
      />
    </div>
  );
}
