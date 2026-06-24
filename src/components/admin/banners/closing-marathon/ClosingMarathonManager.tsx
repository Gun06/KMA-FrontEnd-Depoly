'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import {
  useClosingMarathonForAdmin,
  usePatchClosingMarathonEvent,
} from '@/hooks/useClosingMarathon';
import { useAdminEventList } from '@/services/admin';
import { useEventDetail } from '@/hooks/useEventDetail';
import type { ClosingMarathonResponse } from '@/types/closingMarathon';
import {
  parseApproachPreview,
  pickClosingBannerFromEventInfo,
} from '@/components/admin/banners/closing-marathon/utils/bannerPreview';
import { Pin, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

async function fetchApproachPreview() {
  const res = await fetch('/api/v1/public/main-page/advertise/approach', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return parseApproachPreview(json);
}

function pickId(value: string | null | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

function pickName(value: string | null | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

function hasDesignated(data: ClosingMarathonResponse | undefined): boolean {
  if (!data) return false;
  return Boolean(pickId(data.designatedEventId));
}

function hasDisplay(data: ClosingMarathonResponse | undefined): boolean {
  if (!data) return false;
  return Boolean(pickId(data.displayEventId));
}

function isDisplayMismatch(data: ClosingMarathonResponse | undefined): boolean {
  if (!data || !hasDesignated(data) || !hasDisplay(data)) return false;
  return pickId(data.designatedEventId) !== pickId(data.displayEventId);
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: 'auto' | 'manual' | 'warn' | 'display-auto' | 'display-manual';
}) {
  const cls = {
    auto: 'bg-blue-100 text-[#1E5EFF]',
    manual: 'bg-violet-100 text-violet-700',
    warn: 'bg-amber-100 text-amber-800',
    'display-auto': 'bg-blue-100 text-[#1E5EFF]',
    'display-manual': 'bg-violet-100 text-violet-700',
  }[variant];

  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        cls
      )}
    >
      {label}
    </span>
  );
}

function AutoModePlaceholder() {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex aspect-[332/166] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/80 to-white px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1E5EFF]">
          <RefreshCw className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <p className="text-[14px] font-semibold text-gray-800">자동 모드</p>
        <p className="text-[12px] leading-relaxed text-gray-500">
          직접 지정된 대회가 없습니다.
          <br />
          접수 마감이 가장 임박한 대회가 자동 노출됩니다.
        </p>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400">
        아래에서 대회를 선택하면 수동 모드로 전환할 수 있습니다.
      </p>
    </div>
  );
}

/** 좌측: 지정 상태 + 수동 모드일 때 대회명 */
function DesignatedStatusCard({
  eventId,
  eventName,
  isMismatch,
}: {
  eventId: string | null;
  eventName: string | null;
  isMismatch: boolean;
}) {
  const isManual = Boolean(eventId && eventName);

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border p-5 shadow-sm',
        isManual
          ? 'border-violet-200 bg-gradient-to-b from-violet-50/60 to-white'
          : 'border-blue-200 bg-gradient-to-b from-blue-50/40 to-white'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-gray-500">관리자 지정</h3>
        <StatusBadge
          label={isManual ? '수동 모드' : '자동 모드'}
          variant={isManual ? 'manual' : 'auto'}
        />
      </div>

      {isManual ? (
        <div className="mt-3 flex flex-1 flex-col space-y-4">
          {/* 모드 안내 박스 */}
          <div className="rounded-lg border border-violet-200 bg-violet-50/70 px-4 py-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <Pin className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-[14px] font-semibold text-gray-900">
                  수동 모드
                </p>
                <p className="text-[12px] leading-relaxed text-gray-600">
                  {isMismatch
                    ? '지정한 대회의 접수 마감일이 지나 메인에는 다른 대회가 노출됩니다.'
                    : '지정한 대회가 접수 마감 전까지 메인에 우선 노출됩니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 지정 대회명 + 편집 링크 */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">
              지정 대회
            </p>
            <p className="text-[15px] font-semibold leading-snug text-gray-900">
              {eventName}
            </p>
            <Link
              href={`/admin/events/${eventId}/edit`}
              className="inline-flex text-[13px] font-medium text-[#1E5EFF] hover:underline"
            >
              대회 수정 (배너 이미지 변경) →
            </Link>
          </div>

          <p className="mt-auto text-[12px] leading-relaxed text-gray-400">
            배너 미리보기는 오른쪽 「메인 실제 노출」에서 확인하세요.
          </p>
        </div>
      ) : (
        <AutoModePlaceholder />
      )}
    </div>
  );
}

/** 우측: 메인 노출 배너 미리보기 */
function DisplayPreviewCard({
  eventId,
  eventName,
  bannerUrl,
  badge,
  tone = 'default',
  hideEventMeta = false,
}: {
  eventId: string | null;
  eventName: string | null;
  bannerUrl: string | null;
  badge?: { label: string; variant: 'auto' | 'manual' | 'warn' | 'display-auto' | 'display-manual' };
  tone?: 'default' | 'warn';
  hideEventMeta?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border bg-white p-5 shadow-sm',
        tone === 'warn' ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-gray-500">
          메인 실제 노출
        </h3>
        {badge ? <StatusBadge label={badge.label} variant={badge.variant} /> : null}
      </div>

      {eventId && eventName ? (
        <div className="mt-3 space-y-3">
          {bannerUrl ? (
            <div className="relative aspect-[332/166] w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
              <Image
                src={bannerUrl}
                alt={`${eventName} 마감임박 배너 미리보기`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[332/166] w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-[12px] leading-relaxed text-gray-400">
              배너 이미지를 불러오지 못했습니다.
              <br />
              대회 수정에서 배너를 등록해주세요.
            </div>
          )}
          {!hideEventMeta && (
            <>
              <p className="text-[15px] font-semibold text-gray-900">{eventName}</p>
              <Link
                href={`/admin/events/${eventId}/edit`}
                className="inline-flex text-[13px] font-medium text-[#1E5EFF] hover:underline"
              >
                대회 수정 (배너 이미지 변경) →
              </Link>
            </>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[14px] text-gray-500">
          현재 노출할 마감임박 대회가 없습니다.
        </p>
      )}
    </div>
  );
}

export default function ClosingMarathonManager() {
  const { data, isLoading, isError, refetch } = useClosingMarathonForAdmin();
  const patchMutation = usePatchClosingMarathonEvent();
  const { data: eventData, isLoading: eventsLoading } = useAdminEventList({
    page: 1,
    size: 1000,
    eventStatus: 'OPEN',
  });

  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });
  const [successModal, setSuccessModal] = React.useState({
    isOpen: false,
    message: '',
  });
  const [errorModal, setErrorModal] = React.useState({
    isOpen: false,
    message: '',
  });

  const eventOptions = React.useMemo(() => {
    return (eventData?.content ?? []).map((event) => ({
      value: event.id,
      label: event.nameKr,
    }));
  }, [eventData]);

  const designatedId = pickId(data?.designatedEventId);
  const designatedName = pickName(data?.designatedEventName);
  const displayId = pickId(data?.displayEventId);
  const displayName = pickName(data?.displayEventName);

  const { data: approachPreview } = useQuery({
    queryKey: ['closingMarathon', 'approachPreview'],
    queryFn: fetchApproachPreview,
    staleTime: 60 * 1000,
  });

  const { data: displayEventDetail } = useEventDetail(displayId ?? '');

  const displayBannerUrl = React.useMemo(() => {
    if (!displayId) return null;
    if (approachPreview?.eventId === displayId && approachPreview.url) {
      return approachPreview.url;
    }
    if (displayEventDetail?.eventInfo) {
      return pickClosingBannerFromEventInfo(displayEventDetail.eventInfo);
    }
    return null;
  }, [displayId, approachPreview, displayEventDetail]);

  const displayMismatch = isDisplayMismatch(data);

  const displayBadge = React.useMemo(() => {
    if (displayMismatch) {
      return { label: '자동 전환', variant: 'warn' as const };
    }
    if (!designatedId && displayId) {
      return { label: '자동 노출', variant: 'display-auto' as const };
    }
    if (designatedId && displayId) {
      return { label: '지정 대회', variant: 'display-manual' as const };
    }
    return undefined;
  }, [displayMismatch, designatedId, displayId]);

  const isSaving = patchMutation.isPending;

  const runPatch = async (
    eventId: string | null | undefined,
    successMessage: string
  ) => {
    try {
      await patchMutation.mutateAsync(eventId);
      setSelectedEventId(null);
      setSuccessModal({ isOpen: true, message: successMessage });
    } catch {
      setErrorModal({
        isOpen: true,
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      });
    }
  };

  const handleSaveDesignation = () => {
    if (!selectedEventId?.trim()) {
      setErrorModal({
        isOpen: true,
        message: '지정할 대회를 선택해주세요.',
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      message: '선택한 대회를 마감임박 대회로 지정하시겠습니까?',
      onConfirm: () => {
        setConfirmModal((s) => ({ ...s, isOpen: false }));
        void runPatch(selectedEventId, '마감임박 대회가 지정되었습니다.');
      },
    });
  };

  const handleClearDesignation = () => {
    setConfirmModal({
      isOpen: true,
      message:
        '마감임박 대회 지정을 해제하고 자동 모드로 전환하시겠습니까?',
      onConfirm: () => {
        setConfirmModal((s) => ({ ...s, isOpen: false }));
        void runPatch(null, '자동 모드로 전환되었습니다.');
      },
    });
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-4 py-2">
      <div className="space-y-1">
        <h2 className="text-[18px] font-semibold text-gray-900">
          마감임박 대회 지정
        </h2>
        <p className="text-[13px] text-gray-500">
          메인 화면 좌측 마감임박 영역에 노출할 대회를 지정합니다. 배너
          이미지는 대회 등록/수정에서 관리합니다.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-[13px] text-gray-500">
          불러오는 중…
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-[13px] text-red-600">
            마감임박 대회 정보를 불러오지 못했습니다.
          </p>
          <Button
            size="sm"
            tone="neutral"
            className="mt-3"
            onClick={() => void refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          <div className="grid items-stretch gap-4 md:grid-cols-2">
            <DesignatedStatusCard
              eventId={designatedId}
              eventName={designatedName}
              isMismatch={displayMismatch}
            />
            <DisplayPreviewCard
              eventId={displayId}
              eventName={displayName}
              bannerUrl={displayBannerUrl}
              badge={displayBadge}
              tone={displayMismatch ? 'warn' : 'default'}
              hideEventMeta={Boolean(designatedId)}
            />
          </div>

          {displayMismatch && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
              지정한 대회의 접수 마감일이 지나 메인에는 다른 대회가 자동
              노출됩니다. 지정을 변경하거나 해제할 수 있습니다.
            </div>
          )}
        </>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-gray-900">
          대회 지정 / 변경
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-gray-700">
              접수중 대회 선택
            </label>
            <SearchableSelect
              value={selectedEventId ?? undefined}
              options={eventOptions}
              onChange={(v) => setSelectedEventId(v)}
              placeholder={
                eventsLoading ? '대회 목록 불러오는 중…' : '대회를 선택하세요'
              }
              searchable
              searchPlaceholder="대회명 검색"
              variant="compact"
              showPlaceholderColor
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="md"
              tone="primary"
              onClick={handleSaveDesignation}
              disabled={isSaving || isLoading}
            >
              {isSaving ? '저장 중…' : '지정 저장'}
            </Button>
            {hasDesignated(data) && (
              <Button
                size="md"
                tone="neutral"
                onClick={handleClearDesignation}
                disabled={isSaving || isLoading}
              >
                지정 해제 (자동 모드)
              </Button>
            )}
          </div>
        </div>
      </div>

      <NoticeMessage
        items={[
          {
            text: '※ 마감임박 배너 이미지는 대회 등록/수정 > 배너 업로드(홍보용 인스타배너 등)에서 변경합니다.',
          },
          {
            text: '※ 지정을 하지 않으면 접수 마감이 가장 임박한 대회 1개가 자동으로 노출됩니다.',
          },
          {
            text: '※ 지정한 대회의 접수 마감일이 지나면 메인에는 다른 대회가 자동 노출될 수 있습니다.',
            highlight: true,
          },
        ]}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })
        }
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        confirmText="확인"
        cancelText="취소"
        isLoading={isSaving}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </div>
  );
}
