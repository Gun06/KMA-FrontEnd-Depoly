'use client';

import React, { useState, useRef, useMemo } from 'react';
import { cn } from '@/utils/cn';

import FormTable from '@/components/admin/Form/FormTable';
import Button from '@/components/common/Button/Button';
import FormRow from '@/components/admin/Form/FormRow';
import { RadioGroup } from '@/components/common/Radio/RadioGroup';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';

// 섹션
import BasicInfoSection from './sections/BasicInfoSection';
import CourseGiftsSection from './sections/CourseGiftsSection';
import PartiesSection from './sections/PartiesSection';
import UploadsSection from './sections/UploadsSection';
import ThemeSection from './sections/ThemeSection';

// 파츠
import EditActionBar from './parts/EditActionBar';

// 훅/타입
import { useCompetitionForm } from '@/features/registration/admin';
import type { HydrateSnapshotInput } from '@/features/registration/admin';
import type {
  Shuttle,
  EventCreatePayload,
} from '@/features/registration/admin';

type Props = {
  onRegister?: (payload: EventCreatePayload) => Promise<void>;
  onBack?: () => void;
  onSubmit?: (payload: EventCreatePayload) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
  prefill?: Parameters<typeof useCompetitionForm>[0];
  mode?: 'create' | 'edit';
  hideBottomPrimary?: boolean;
  editHref?: string;
  initialEditing?: boolean;
};

export default function CompetitionCreateForm({
  onRegister,
  onBack,
  onSubmit,
  onCancel,
  onDelete,
  prefill,
  mode = 'create',
  hideBottomPrimary,
  editHref,
  initialEditing = false,
}: Props) {
  const isEditPage = mode === 'edit';
  const [isEditing, setIsEditing] = useState(
    initialEditing || mode === 'create'
  );
  const [loading, setLoading] = useState(false);
  const snapshotRef = useRef<HydrateSnapshotInput | null>(null);

  // prefill을 useMemo로 감싸서 불필요한 재렌더링 방지
  const stablePrefill = useMemo(() => prefill, [prefill]);

  // 상태/빌더
  const f = useCompetitionForm(stablePrefill);

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

  // 내부 롤백(상세 화면 인라인 취소 시 사용)
  const rollbackToSnapshot = () => {
    const s = snapshotRef.current;
    if (!s) return;

    // EventCreatePayload -> HydrateSnapshotInput으로 최소 변환
    const snapshotData: HydrateSnapshotInput = {
      titleKo: s.titleKo,
      titleEn: s.titleEn,
      applyType: s.applyType,
      visibility: s.visibility,
      deliveryMethod: s.deliveryMethod,
      shuttle: s.shuttle,
      // 날짜/시간은 buildApiBody에서 합쳐 보냄. 여기선 문자열 상태만 유지
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

  // 취소(상세-편집모드에서만 사용)
  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // 외부 라우팅 등 (앱에서 핸들)
      return;
    }
    rollbackToSnapshot();
  };

  // 저장
  const saveEdit = async () => {
    if (loading) return;

    // ✅ 유효성 검사
    const v = f.validate?.();
    if (v && !v.ok) {
      window.alert(`필수 항목을 확인해 주세요.\n- ${v.errors.join('\n- ')}`); // 운영 시 토스트로 교체
      return;
    }

    setLoading(true);
    try {
      const body = f.buildApiBody();
      await Promise.resolve((onRegister ?? onSubmit)?.(body));
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  // 신규 등록
  const submit = async () => {
    if (loading) return;

    // ✅ 유효성 검사
    const v = f.validate?.();
    if (v && !v.ok) {
      window.alert(`필수 항목을 확인해 주세요.\n- ${v.errors.join('\n- ')}`); // 운영 시 토스트로 교체
      return;
    }

    setLoading(true);
    try {
      const body = f.buildApiBody();
      await Promise.resolve((onRegister ?? onSubmit)?.(body));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await onDelete?.();
  };

  // 테스트용 이미지 일괄 업로드 함수
  const handleTestImageUpload = async () => {
    try {
      // test.png 파일을 fetch로 가져오기
      const response = await fetch('/test.png');
      const blob = await response.blob();
      const file = new File([blob], 'test.png', { type: 'image/png' });

      // UploadItem 형태로 변환
      const uploadItem = {
        id: Date.now().toString(),
        file: file,
        name: 'test.png',
        size: file.size,
        sizeMB: Math.round((file.size / (1024 * 1024)) * 100) / 100, // MB로 변환
        tooLarge: false, // 테스트 이미지는 작으므로 false
        url: URL.createObjectURL(file),
      };

      // 모든 이미지 필드에 test.png 설정
      f.setBannerHost([uploadItem]);
      f.setBannerOrganizer([uploadItem]);
      f.setBannerSponsor([uploadItem]);
      f.setBannerInstagram([uploadItem]);
      f.setBannerGuideDesktop([uploadItem]);
      f.setBannerGuideMobile([uploadItem]);
      f.setBannerMainDesktop([uploadItem]);
      f.setBannerMainMobile([uploadItem]);
      f.setImgNotice([uploadItem]);
      f.setImgPost([uploadItem]);
      f.setImgCourse([uploadItem]);
      f.setImgGift([uploadItem]);
      f.setImgConfirm([uploadItem]);
      f.setImgResult([uploadItem]);

      alert('테스트 이미지가 모든 필드에 업로드되었습니다!');
    } catch (error) {
      console.error('테스트 이미지 업로드 실패:', error);
      alert('테스트 이미지 업로드에 실패했습니다.');
    }
  };

  // 하단 버튼 노출 여부 및 타이틀
  const actuallyHideBottom = isEditPage ? true : !!hideBottomPrimary;
  const showBottomPrimary = !actuallyHideBottom && !isEditPage;
  const title = isEditPage
    ? isEditing
      ? '대회 수정'
      : '대회 상세'
    : '대회 등록';

  // 컨테이너
  const containerCls = cn(
    'max-w-[1200px] mx-auto px-4 space-y-10',
    showBottomPrimary ? 'pb-12' : 'pb-24'
  );

  return (
    <div className="w-full">
      <div className={containerCls}>
        <FormTable
          title={title}
          labelWidth={200}
          actions={
            <div className="flex items-center gap-3">
              <EditActionBar
                isEditPage={isEditPage}
                isEditing={isEditing}
                loading={loading}
                onBack={onBack}
                onStartEdit={startEdit}
                onCancel={isEditPage ? handleCancel : undefined}
                onSave={saveEdit}
                onSubmit={submit}
                onDelete={handleDelete}
                editHref={editHref}
              />
              {/* 테스트용 이미지 일괄 업로드 버튼 */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  tone="dark"
                  size="sm"
                  onClick={handleTestImageUpload}
                  disabled={loading}
                >
                  🖼️ 테스트 이미지 일괄 업로드
                </Button>
              )}
            </div>
          }
        >
          {/* 기본 정보 */}
          <BasicInfoSection
            f={f}
            readOnly={readOnly}
            fieldCls={fieldCls}
            inputColorCls={inputColorCls}
          />

          {/* 코스/기념품 */}
          <CourseGiftsSection f={f} readOnly={readOnly} />

          {/* 주최/주관/후원 */}
          <PartiesSection f={f} readOnly={readOnly} />

          {/* 공개여부 / 셔틀 */}
          <FormRow label="공개여부" contentClassName="items-center pl-4">
            <div
              className={readOnly ? 'text-[#646464] pointer-events-none' : ''}
            >
              <RadioGroup
                name={`${f.uid}-visibility`}
                value={f.visibility}
                onValueChange={readOnly ? noop : f.setVisibility}
                gapPx={40}
                options={[
                  { value: '공개', label: '공개' },
                  { value: '비공개', label: '비공개' },
                ]}
              />
              <span className="text-xs text-[#646464]">
                (현재는 사용되지 않습니다)
              </span>
            </div>
          </FormRow>

          <FormRow label="셔틀 운행여부" contentClassName="items-center pl-4">
            <div
              className={readOnly ? 'text-[#646464] pointer-events-none' : ''}
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
          </FormRow>
        </FormTable>

        <div className="flex mx-auto px-4">
          <NoticeMessage
            items={[
              { text: '※ 이미지는 jpg, jpeg, png만 지원합니다.' },
              {
                text: '주최/주관/후원은 대회 페이지의 Footer 상단에 위치합니다.',
              },
              {
                text: "고정시키고 싶은 배너는 'OFF'를, 자동 스크롤을 원하는 배너는 'ON'을 선택하세요.",
              },
              { text: '※ 실제 사이즈는 220 × 80px을 지원합니다.' },
              {
                text: '다만 해상도 문제로 업로드 시 2배(440 × 160px)로 제작하여 부탁드립니다',
                highlight: true,
              },
            ]}
          />
        </div>

        {/* 업로드 섹션 */}
        <UploadsSection f={f} readOnly={readOnly} />

        {/* 색상 섹션 */}
        <ThemeSection f={f} readOnly={readOnly} />

        {/* 등록 화면 버튼 */}
        {showBottomPrimary && (
          <div className="flex justify-center mx-auto">
            <Button
              tone="primary"
              widthType="pager"
              size="sm"
              onClick={submit}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
