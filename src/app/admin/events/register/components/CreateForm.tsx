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
        {/* 제목과 취소 버튼 */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">대회 기본 정보</h1>
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

        {/* 기념품/종목 설정 안내 - 대회 기본 정보 제목 아래 */}
        <div className="w-full bg-gray-100 rounded-lg p-6 mb-4 text-center">
          <p className="text-gray-700 text-[14px] leading-6">
            기념품과 종목은 대회 등록 페이지에서 보이지 않으며,<br />
            대회 등록을 완료한 후 기념품 설정 단계로 안내됩니다.
            대회생성을 먼저 진행해주세요.
          </p>
        </div>

        <FormTable
          labelWidth={200}
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
                    { value: '테스트', label: '테스트' },
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

        {/* 기념품/종목 설정 안내 - 저장하기 버튼 위 */}
        <div className="mx-auto px-4 mb-4">
          <NoticeMessage
            items={[
              {
                text: '※ 기념품과 종목은 현재 페이지에서 설정할 수 없으며, 대회 등록이 완료된 후에만 설정할 수 있습니다.',
                highlight: true,
              },
              {
                text: '※ 저장하기를 누르면 대회가 등록되며, 설정 페이지로 바로 이동하여 기념품과 종목을 설정할 수 있습니다.',
                highlight: false,
              },
            ]}
          />
        </div>

        {/* 1차 저장 버튼 */}
        <div className="flex justify-center mx-auto">
          <div className="relative group">
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
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '320px' }}>
              <div className="bg-gray-900 text-white rounded-lg py-3 px-4 shadow-xl" style={{ minWidth: '280px', width: 'max-content' }}>
                <div className="font-semibold mb-2 text-sm">대회 등록 저장</div>
                <div className="text-xs text-gray-300 leading-relaxed" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                  저장하기를 누르면 대회가 등록되며, 이후 기념품 설정 단계로 안내됩니다. 대회 생성을 먼저 진행해주세요.
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
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
