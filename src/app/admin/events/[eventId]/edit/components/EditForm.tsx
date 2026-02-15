'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/utils/cn';

import FormTable from '@/components/admin/Form/FormTable';
import Button from '@/components/common/Button/Button';
import InlineLabelPairRow from '@/components/admin/Form/InlineLabelPairRow';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';

// 섹션 (register에서 import)
import BasicInfoSection from '@/app/admin/events/register/components/sections/BasicInfoSection';
import PartiesSection from '@/app/admin/events/register/components/sections/PartiesSection';
import UploadsSection from '@/app/admin/events/register/components/sections/UploadsSection';
import ThemeSection from '@/app/admin/events/register/components/sections/ThemeSection';
import GiftsSection from '@/app/admin/events/register/components/sections/GiftsSection';
import CoursesSection from '@/app/admin/events/register/components/sections/CoursesSection';

// 파츠 (register에서 import)
import EditActionBar from '@/app/admin/events/register/components/parts/EditActionBar';
import ValidationErrorModal from '@/app/admin/events/register/components/parts/ValidationErrorModal';

// 훅/타입 (register에서 import)
import { useCompetitionForm } from '@/app/admin/events/register/hooks/useCompetitionForm';
import type { HydrateSnapshotInput } from '@/app/admin/events/register/hooks/useCompetitionForm';
import { useGiftsHandlers } from '@/app/admin/events/register/hooks/useGiftsHandlers';
import { useCoursesHandlers } from '@/app/admin/events/register/hooks/useCoursesHandlers';
import { useFormValidation } from '@/app/admin/events/register/hooks/useFormValidation';
import { useFormSubmission } from '@/app/admin/events/register/hooks/useFormSubmission';
import type {
  Shuttle,
  EventCreatePayload,
} from '@/app/admin/events/register/api/types';

type Props = {
  onSubmit: (payload: EventCreatePayload) => Promise<void>;
  // STEP 2: 기념품만 저장 (gifts 배열 직접 전달)
  onSaveSouvenirs?: (gifts: Array<{ name: string; size: string; isActive?: boolean }>) => Promise<void>;
  // STEP 3: 종목만 저장 (courses와 gifts 배열 직접 전달)
  onSaveCourses?: (courses: Array<{ name: string; price: string; selectedGifts: number[] }>, gifts: Array<{ name: string; size: string }>) => Promise<void>;
  onBack?: () => void;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
  prefill?: Parameters<typeof useCompetitionForm>[0];
  editHref?: string;
  initialEditing?: boolean;
  existingEventBanners?: Array<{
    id?: string;
    imageUrl: string;
    url: string;
    providerName: string;
    bannerType: string;
    static: boolean;
  }>;
  initialGifts?: Array<{ name: string; size: string; isActive?: boolean }>;
  initialCourses?: Array<{ name: string; price: string; selectedGifts: number[]; isActive?: boolean }>;
};

export default function EditForm({
  onSubmit,
  onSaveSouvenirs,
  onSaveCourses,
  onBack,
  onCancel,
  onDelete,
  prefill,
  editHref,
  initialEditing = true,
  existingEventBanners,
  initialGifts = [],
  initialCourses = [],
}: Props) {
  const searchParams = useSearchParams();
  const step = searchParams?.get('step');
  const [isEditing, setIsEditing] = useState(initialEditing);
  const snapshotRef = useRef<HydrateSnapshotInput | null>(null);
  
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

  const stablePrefill = useMemo(() => prefill, [prefill]);

  // 상태/빌더
  const f = useCompetitionForm(stablePrefill);

  // 기념품 핸들러 (초기값 설정)
  const giftsHandlers = useGiftsHandlers(initialGifts);
  const { gifts, setGifts } = giftsHandlers;

  // 저장된 기념품만 추적하는 상태 (서버에 저장된 기념품만)
  const [savedGifts, setSavedGifts] = useState<Array<{ name: string; size: string; isActive?: boolean }>>(initialGifts);

  // 종목 핸들러 (초기값 설정)
  const coursesHandlers = useCoursesHandlers(initialCourses);
  const { courses, setCourses } = coursesHandlers;

  // initialGifts나 initialCourses가 변경되면 업데이트
  useEffect(() => {
    if (initialGifts.length > 0) {
      setGifts(initialGifts);
      setSavedGifts(initialGifts); // 저장된 기념품도 업데이트
    }
  }, [initialGifts, setGifts]);

  useEffect(() => {
    if (initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses, setCourses]);

  // 검증 로직
  const { validateBasicInfo, validateGiftsAndCourses } = useFormValidation();

  // 제출 로직 (기본 정보 저장용)
  const {
    loading: loadingBasicInfo,
    eventCreated,
    setEventCreated,
  } = useFormSubmission({
    f,
    gifts: [],
    courses: [],
    onSubmit: undefined,
    onSuccess: () => setIsEditing(false),
  });

  // 기념품/종목 저장용 로딩 상태
  const [loadingSouvenirs, setLoadingSouvenirs] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // 쿼리 파라미터로 기념품 섹션으로 스크롤
  useEffect(() => {
    if (step === 'souvenirs') {
      setTimeout(() => {
        const element = document.getElementById('souvenirs-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [step]);

  // 공통 스타일
  const readOnly = !isEditing;
  const inputColorCls = readOnly ? 'text-[#646464]' : 'text-black';
  const fieldCls =
    'w-full text-[16px] bg-transparent border-0 outline-none focus:outline-none focus:ring-0 shadow-none';
  const noop = () => {};

  // 편집 시작
  const startEdit = () => {
    snapshotRef.current = JSON.parse(JSON.stringify(f));
    setIsEditing(true);
  };

  // 내부 롤백
  const rollbackToSnapshot = () => {
    const s = snapshotRef.current;
    if (!s) return;

    const snapshotData: HydrateSnapshotInput = {
      titleKo: s.titleKo,
      titleEn: s.titleEn,
      applyType: s.applyType,
      visibility: s.visibility,
      deliveryMethod: s.deliveryMethod,
      shuttle: s.shuttle,
      date: '',
      hh: undefined,
      mm: undefined,
      place: s.place,
      account: s.account,
      homeUrl: s.homeUrl,
      eventPageUrl: s.eventPageUrl,
      maxParticipants: s.maxParticipants?.toString(),
      groups:
        s.groups?.map(group => ({
          course: {
            name: group.course.name,
            price: String(group.course.price ?? ''),
          },
          gifts: group.gifts.map(gift => ({
            label: gift.label,
            size: gift.size,
          })),
        })) ?? [],
      applyStatus: s.applyStatus,
    };

    f.hydrateSnapshot?.(snapshotData);
    setIsEditing(false);
  };

  // 취소
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    rollbackToSnapshot();
  };

  // 저장 (편집 모드용) - 기본 정보만 저장 (STEP 1)
  const saveEdit = async () => {
    // 기본 정보만 검증 (기념품/종목 제외)
    const v = validateBasicInfo(f);
    if (!v.ok) {
      setValidationErrors(v.errors);
      setValidationModalOpen(true);
      return;
    }

    try {
      // 기본 정보만 저장 (groups 제외)
      const body = f.buildApiBody();
      const basicBody = {
        ...body,
        groups: [], // 기본 정보 저장 시에는 groups 제외
      };
      await onSubmit(basicBody as EventCreatePayload);
    } catch (error) {
      // 에러는 상위에서 처리
    }
  };

  const handleDelete = async () => {
    await onDelete?.();
  };

  // 공통: 기념품/종목 groups 포함한 페이로드 생성
  const buildPayloadWithGroups = (): EventCreatePayload => {
    const body = f.buildApiBody();

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

    return {
      ...(body as EventCreatePayload),
      groups,
    };
  };

  // STEP 2: 기념품만 저장
  const handleSaveSouvenirs = async () => {
    if (!onSaveSouvenirs || readOnly) return;
    
    setLoadingSouvenirs(true);
    try {
      // gifts 배열을 직접 전달
      await onSaveSouvenirs(gifts);
      // 저장 성공 시 저장된 기념품 상태 업데이트
      setSavedGifts([...gifts]);
    } catch (error) {
      // 에러는 상위에서 처리
    } finally {
      setLoadingSouvenirs(false);
    }
  };

  // STEP 3: 종목만 저장
  const handleSaveCourses = async () => {
    if (!onSaveCourses || readOnly) return;
    
    setLoadingCourses(true);
    try {
      // courses와 gifts 배열을 직접 전달
      await onSaveCourses(courses, gifts);
    } catch (error) {
      // 에러는 상위에서 처리
    } finally {
      setLoadingCourses(false);
    }
  };

  const title = isEditing ? '대회 수정' : '대회 상세';

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto px-4 space-y-10 pb-24">
        <FormTable
          title={title}
          labelWidth={200}
          actions={
            <div className="flex items-center gap-3">
              <EditActionBar
                isEditPage={true}
                isEditing={isEditing}
                loading={loadingBasicInfo}
                onBack={onBack}
                onStartEdit={startEdit}
                onCancel={handleCancel}
                onSave={saveEdit}
                onDelete={handleDelete}
                editHref={editHref}
              />
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
              <div
                className={cn(
                  'px-4 py-2',
                  readOnly ? 'text-[#646464] pointer-events-none' : ''
                )}
              >
                <RadioGroup
                  name={`${f.uid}-visibility`}
                  value={f.visibility}
                  onValueChange={readOnly ? noop : f.setVisibility}
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
              <div
                className={cn(
                  'px-4 py-2',
                  readOnly ? 'text-[#646464] pointer-events-none' : ''
                )}
              >
                <RadioGroup
                  name={`${f.uid}-shuttle`}
                  value={f.shuttle}
                  onValueChange={
                    readOnly ? noop : v => f.setShuttle(v as Shuttle)
                  }
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

        {/* 수정 모드에서 기본 정보 저장 버튼 (STEP 1) */}
        {!readOnly && (
          <div className="flex justify-center mx-auto mt-6">
            <div className="relative group">
              <Button
                tone="primary"
                widthType="pager"
                size="sm"
                onClick={saveEdit}
                disabled={loadingBasicInfo}
                aria-busy={loadingBasicInfo}
              >
                {loadingBasicInfo ? '저장 중...' : '기본 정보 저장'}
              </Button>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '320px' }}>
                <div className="bg-gray-900 text-white rounded-lg py-3 px-4 shadow-xl" style={{ minWidth: '280px', width: 'max-content' }}>
                  <div className="font-semibold mb-2 text-sm">1단계: 기본 정보 저장</div>
                  <div className="text-xs text-gray-300 leading-relaxed" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    대회명, 날짜, 장소 등 기본 정보를 입력하고 저장하세요. 기본 정보를 먼저 저장해야 다음 단계로 진행할 수 있습니다.
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 기념품/종목 설정 안내 */}
        <div 
          id="souvenirs-section"
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                기념품 및 종목 설정
              </h3>
              <p className="text-sm text-blue-700">
                대회에 제공할 기념품과 종목을 추가해주세요. 대회 정보는 아래에서 수정할 수 있습니다.
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="ml-4 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                나중에 설정하기
              </button>
            )}
          </div>
        </div>

        {/* 5. 기념품 */}
        <GiftsSection
          gifts={gifts}
          onAddGift={giftsHandlers.handleAddGift}
          onRemoveGift={giftsHandlers.handleRemoveGift}
          onChangeGiftName={giftsHandlers.handleChangeGiftName}
          onChangeGiftSize={giftsHandlers.handleChangeGiftSize}
          onToggleGiftEnabled={giftsHandlers.handleToggleGiftEnabled}
          readOnly={readOnly}
        />

        {/* 기념품 저장 버튼 (STEP 2) */}
        {!readOnly && (
          <div className="flex justify-center mt-4">
            <div className="relative group">
              <Button
                tone="primary"
                size="sm"
                widthType="pager"
                onClick={handleSaveSouvenirs}
                disabled={loadingSouvenirs}
                aria-busy={loadingSouvenirs}
              >
                {loadingSouvenirs ? '저장 중...' : '기념품 저장'}
              </Button>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '320px' }}>
                <div className="bg-gray-900 text-white rounded-lg py-3 px-4 shadow-xl" style={{ minWidth: '280px', width: 'max-content' }}>
                  <div className="font-semibold mb-2 text-sm">2단계: 기념품 저장</div>
                  <div className="text-xs text-gray-300 leading-relaxed" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    대회에서 제공할 기념품을 추가하고 저장하세요. 기념품을 저장해야 종목에서 기념품을 선택할 수 있습니다.
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. 종목 */}
        <CoursesSection
          courses={courses}
          availableGifts={savedGifts}
          onAddCourse={coursesHandlers.handleAddCourse}
          onRemoveCourse={coursesHandlers.handleRemoveCourse}
          onChangeCourseName={coursesHandlers.handleChangeCourseName}
          onChangeCoursePrice={coursesHandlers.handleChangeCoursePrice}
          onToggleCourseEnabled={coursesHandlers.handleToggleCourseEnabled}
          onSelectGifts={coursesHandlers.handleSelectGifts}
          onRemoveGiftFromCourse={coursesHandlers.handleRemoveGiftFromCourse}
          readOnly={readOnly}
        />

        {/* 종목 저장 버튼 (STEP 3) */}
        {!readOnly && (
          <div className="flex justify-center mt-4">
            <div className="relative group">
              <Button
                tone="primary"
                size="sm"
                widthType="pager"
                onClick={handleSaveCourses}
                disabled={loadingCourses}
                aria-busy={loadingCourses}
              >
                {loadingCourses ? '저장 중...' : '종목 저장'}
              </Button>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '320px' }}>
                <div className="bg-gray-900 text-white rounded-lg py-3 px-4 shadow-xl" style={{ minWidth: '280px', width: 'max-content' }}>
                  <div className="font-semibold mb-2 text-sm">3단계: 종목 저장</div>
                  <div className="text-xs text-gray-300 leading-relaxed" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    참가부문(종목)을 추가하고 각 종목에 기념품을 연결한 후 저장하세요. 모든 정보가 저장되면 대회 설정이 완료됩니다.
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        )}
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
