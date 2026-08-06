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
  useDeleteClosingMarathonEvent,
  usePatchClosingMarathonEvent,
} from '@/hooks/useClosingMarathon';
import { useEventDetail } from '@/hooks/useEventDetail';
import type {
  ClosingMarathonResponse,
  ClosingMarathonType,
} from '@/types/closingMarathon';
import { CLOSING_MARATHON_TYPE_LABEL } from '@/types/closingMarathon';
import {
  parseApproachPreview,
  pickClosingBannerFromEventInfo,
} from '@/components/admin/banners/closing-marathon/utils/bannerPreview';
import { useClosingMarathonEventSelect } from '@/components/admin/banners/closing-marathon/hooks/useClosingMarathonEventSelect';
import { userApi } from '@/hooks/api.presets';
import { AlertCircle, Pin, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

const TYPE_TABS: ClosingMarathonType[] = ['D_DAY', 'REGISTRATION'];

async function fetchDeadlineApproachPreview() {
  try {
    const json = await userApi.get<unknown>(
      '/api/v1/public/main-page/advertise/deadline-approach'
    );
    return parseApproachPreview(json);
  } catch {
    return null;
  }
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

function criteriaLabel(type: ClosingMarathonType): string {
  return type === 'D_DAY' ? '개최일' : '접수 마감';
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant:
    | 'auto'
    | 'manual'
    | 'warn'
    | 'display-auto'
    | 'display-manual'
    | 'inactive';
}) {
  const cls = {
    auto: 'bg-blue-100 text-[#1E5EFF]',
    manual: 'bg-violet-100 text-violet-700',
    warn: 'bg-amber-100 text-amber-800',
    'display-auto': 'bg-blue-100 text-[#1E5EFF]',
    'display-manual': 'bg-violet-100 text-violet-700',
    inactive: 'bg-gray-100 text-gray-600',
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

function TypeToggleTabs({
  value,
  onChange,
}: {
  value: ClosingMarathonType;
  onChange: (type: ClosingMarathonType) => void;
}) {
  return (
    <div
      className="inline-flex gap-1 rounded-lg border bg-white p-1"
      role="tablist"
      aria-label="마감임박 기준 선택"
    >
      {TYPE_TABS.map((type) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(type)}
            className={cn(
              'h-9 rounded-md px-3 text-sm transition-colors',
              selected
                ? 'bg-[#1E5EFF] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            {CLOSING_MARATHON_TYPE_LABEL[type]}
          </button>
        );
      })}
    </div>
  );
}

function AutoModePlaceholder({ type }: { type: ClosingMarathonType }) {
  const criteria = criteriaLabel(type);
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
          {criteria}이 가장 임박한 대회가 자동 노출됩니다.
        </p>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400">
        아래에서 대회를 선택하면 수동 모드로 전환할 수 있습니다.
      </p>
    </div>
  );
}

function NotTargetPlaceholder() {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex aspect-[332/166] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-white px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <AlertCircle className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <p className="text-[14px] font-semibold text-gray-800">표기 대상 아님</p>
        <p className="text-[12px] leading-relaxed text-gray-500">
          현재 메인 화면 내 표기 대상이 아닙니다.
          <br />
          해당 양식의 대회를 표기하고 싶은 경우 본 화면에서 설정을
          마쳐주세요.
        </p>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400">
        아래에서 대회를 선택하면 표기 대상으로 전환할 수 있습니다.
      </p>
    </div>
  );
}

/** 좌측: 지정 상태 + 수동 모드일 때 대회명 */
function DesignatedStatusCard({
  eventId,
  eventName,
  isMismatch,
  type,
  isTarget,
}: {
  eventId: string | null;
  eventName: string | null;
  isMismatch: boolean;
  type: ClosingMarathonType;
  isTarget: boolean;
}) {
  const isManual = isTarget && Boolean(eventId && eventName);
  const criteria = criteriaLabel(type);

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border p-5 shadow-sm',
        !isTarget
          ? 'border-gray-200 bg-gradient-to-b from-gray-50/80 to-white'
          : isManual
            ? 'border-violet-200 bg-gradient-to-b from-violet-50/60 to-white'
            : 'border-blue-200 bg-gradient-to-b from-blue-50/40 to-white'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-gray-500">관리자 지정</h3>
        <StatusBadge
          label={
            !isTarget ? '표기 대상 아님' : isManual ? '수동 모드' : '자동 모드'
          }
          variant={!isTarget ? 'inactive' : isManual ? 'manual' : 'auto'}
        />
      </div>

      {!isTarget ? (
        <NotTargetPlaceholder />
      ) : isManual ? (
        <div className="mt-3 flex flex-1 flex-col space-y-4">
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
                    ? `지정한 대회의 ${criteria}이 지나 메인에는 다른 대회가 노출됩니다.`
                    : `지정한 대회가 ${criteria} 전까지 메인에 우선 노출됩니다.`}
                </p>
              </div>
            </div>
          </div>

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
        <AutoModePlaceholder type={type} />
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
  isTarget,
}: {
  eventId: string | null;
  eventName: string | null;
  bannerUrl: string | null;
  badge?: {
    label: string;
    variant:
      | 'auto'
      | 'manual'
      | 'warn'
      | 'display-auto'
      | 'display-manual'
      | 'inactive';
  };
  tone?: 'default' | 'warn';
  hideEventMeta?: boolean;
  isTarget: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border bg-white p-5 shadow-sm',
        !isTarget
          ? 'border-gray-200'
          : tone === 'warn'
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-gray-500">
          메인 실제 노출
        </h3>
        {isTarget && badge ? (
          <StatusBadge label={badge.label} variant={badge.variant} />
        ) : null}
      </div>

      {!isTarget ? (
        <div className="mt-3 flex aspect-[332/166] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
          <p className="text-[13px] font-medium text-gray-500">
            표기 대상이 아닙니다
          </p>
          <p className="text-[12px] leading-relaxed text-gray-400">
            아래에서 대회를 지정하면 메인 노출 미리보기가 표시됩니다.
          </p>
        </div>
      ) : eventId && eventName ? (
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
              <p className="text-[15px] font-semibold text-gray-900">
                {eventName}
              </p>
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
  const deleteMutation = useDeleteClosingMarathonEvent();
  const {
    options: eventOptionsBase,
    eventsLoading,
    setKeyword: setEventSearchKeyword,
    hasMore: hasMoreEvents,
    isLoadingMore: isLoadingMoreEvents,
    fetchNextPage: fetchMoreEvents,
    loadMoreLabel,
  } = useClosingMarathonEventSelect();

  const [viewingType, setViewingType] =
    React.useState<ClosingMarathonType | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null
  );
  const [selectedEventLabel, setSelectedEventLabel] = React.useState<
    string | null
  >(null);
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

  // GET type → 진입 시 기본 탭
  React.useEffect(() => {
    if (!data?.type) return;
    setViewingType((prev) => prev ?? data.type);
  }, [data?.type]);

  const activeType = data?.type ?? null;
  const currentType: ClosingMarathonType = viewingType ?? activeType ?? 'D_DAY';
  const isTarget = activeType != null && currentType === activeType;

  const handleTypeChange = (type: ClosingMarathonType) => {
    setViewingType(type);
    if (type !== activeType) {
      setSelectedEventId(null);
      setSelectedEventLabel(null);
    }
  };

  const eventOptions = React.useMemo(() => {
    if (
      selectedEventId &&
      selectedEventLabel &&
      !eventOptionsBase.some((o) => o.value === selectedEventId)
    ) {
      return [
        { value: selectedEventId, label: selectedEventLabel },
        ...eventOptionsBase,
      ];
    }
    return eventOptionsBase;
  }, [eventOptionsBase, selectedEventId, selectedEventLabel]);

  const designatedId = isTarget ? pickId(data?.designatedEventId) : null;
  const designatedName = isTarget ? pickName(data?.designatedEventName) : null;
  const displayId = isTarget ? pickId(data?.displayEventId) : null;
  const displayName = isTarget ? pickName(data?.displayEventName) : null;

  const { data: approachPreview } = useQuery({
    queryKey: ['closingMarathon', 'deadlineApproachPreview'],
    queryFn: fetchDeadlineApproachPreview,
    staleTime: 60 * 1000,
    enabled: isTarget,
  });

  const { data: displayEventDetail } = useEventDetail(displayId ?? '');

  const displayBannerUrl = React.useMemo(() => {
    if (!displayId || !isTarget) return null;
    if (approachPreview?.eventId === displayId && approachPreview.url) {
      return approachPreview.url;
    }
    if (displayEventDetail?.eventInfo) {
      return pickClosingBannerFromEventInfo(displayEventDetail.eventInfo);
    }
    return null;
  }, [displayId, approachPreview, displayEventDetail, isTarget]);

  const displayMismatch = isTarget && isDisplayMismatch(data);

  const displayBadge = React.useMemo(() => {
    if (!isTarget) return undefined;
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
  }, [isTarget, displayMismatch, designatedId, displayId]);

  const isSaving = patchMutation.isPending || deleteMutation.isPending;
  const criteria = criteriaLabel(currentType);

  const runPatch = async (
    type: ClosingMarathonType,
    eventId: string,
    successMessage: string
  ) => {
    try {
      await patchMutation.mutateAsync({ type, eventId });
      setViewingType(type);
      setSelectedEventId(null);
      setSelectedEventLabel(null);

      const refreshed = await refetch();
      const savedType = refreshed.data?.type;
      if (savedType && savedType !== type) {
        setErrorModal({
          isOpen: true,
          message: `저장은 완료됐지만 서버 표기 타입이「${CLOSING_MARATHON_TYPE_LABEL[savedType]}」입니다. 「${CLOSING_MARATHON_TYPE_LABEL[type]}」으로 전환되지 않았습니다. 백엔드 type 처리를 확인해 주세요.`,
        });
        return;
      }

      setSuccessModal({ isOpen: true, message: successMessage });
    } catch {
      setErrorModal({
        isOpen: true,
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      });
    }
  };

  const runDelete = async (successMessage: string) => {
    try {
      await deleteMutation.mutateAsync();
      setSelectedEventId(null);
      setSelectedEventLabel(null);
      setSuccessModal({ isOpen: true, message: successMessage });
    } catch {
      setErrorModal({
        isOpen: true,
        message: '지정 해제에 실패했습니다. 다시 시도해주세요.',
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

    const typeToSave = currentType;
    const eventIdToSave = selectedEventId;
    const switchNote = !isTarget
      ? ` (${CLOSING_MARATHON_TYPE_LABEL[typeToSave]}으로 표기 대상이 전환됩니다)`
      : '';

    setConfirmModal({
      isOpen: true,
      message: `선택한 대회를 ${CLOSING_MARATHON_TYPE_LABEL[typeToSave]} 대회로 지정하시겠습니까?${switchNote}`,
      onConfirm: () => {
        setConfirmModal((s) => ({ ...s, isOpen: false }));
        void runPatch(
          typeToSave,
          eventIdToSave,
          `${CLOSING_MARATHON_TYPE_LABEL[typeToSave]} 대회가 지정되었습니다.`
        );
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
        void runDelete('자동 모드로 전환되었습니다.');
      },
    });
  };

  const noticeItems = React.useMemo(() => {
    const items = [
      {
        text: '※ 마감임박 배너 이미지는 대회 등록/수정 > 배너 업로드(홍보용 인스타배너 등)에서 변경합니다.',
      },
      {
        text: `※ 지정을 하지 않으면 ${criteria}이 가장 임박한 대회 1개가 자동으로 노출됩니다.`,
      },
      {
        text: `※ 지정한 대회의 ${criteria}이 지나면 메인에는 다른 대회가 자동 노출될 수 있습니다.`,
        highlight: true,
      },
    ];
    if (!isTarget) {
      items.push({
        text: '※ 현재 선택한 메뉴는 메인 표기 대상이 아닙니다. 대회를 지정하면 해당 기준으로 전환됩니다.',
        highlight: true,
      });
    }
    return items;
  }, [criteria, isTarget]);

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

      <TypeToggleTabs value={currentType} onChange={handleTypeChange} />

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
              type={currentType}
              isTarget={isTarget}
            />
            <DisplayPreviewCard
              eventId={displayId}
              eventName={displayName}
              bannerUrl={displayBannerUrl}
              badge={displayBadge}
              tone={displayMismatch ? 'warn' : 'default'}
              hideEventMeta={Boolean(designatedId)}
              isTarget={isTarget}
            />
          </div>

          {displayMismatch && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
              지정한 대회의 {criteria}이 지나 메인에는 다른 대회가 자동
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
              대회 선택 (접수중·접수마감)
            </label>
            <SearchableSelect
              value={selectedEventId ?? undefined}
              options={eventOptions}
              onChange={(v) => {
                setSelectedEventId(v);
                setSelectedEventLabel(
                  eventOptions.find((o) => o.value === v)?.label ?? null
                );
              }}
              placeholder={
                eventsLoading ? '대회 목록 불러오는 중…' : '대회를 선택하세요'
              }
              searchable
              searchPlaceholder="대회명 검색"
              variant="compact"
              showPlaceholderColor
              maxHeight="max-h-80"
              onSearchChange={setEventSearchKeyword}
              onLoadMore={() => {
                void fetchMoreEvents();
              }}
              hasMore={hasMoreEvents}
              isLoadingMore={isLoadingMoreEvents}
              loadMoreLabel={loadMoreLabel}
              emptyMessage={
                eventsLoading ? '불러오는 중…' : '검색 결과가 없습니다.'
              }
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
            {isTarget && hasDesignated(data) && (
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

      <NoticeMessage items={noticeItems} />

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
