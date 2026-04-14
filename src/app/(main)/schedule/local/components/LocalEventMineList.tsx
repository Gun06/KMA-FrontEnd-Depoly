'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PaginationBar from '@/components/common/Pagination/PaginationBar';
import Pagination from '@/components/common/Pagination/Pagination';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import { useMyLocalEvents } from '../hooks/useLocalEvents';
import LocalEventMineSearchControls from './LocalEventMineSearchControls';
import type {
  LocalEventMypageEventStatus,
  LocalEventMypageItem,
  LocalEventMypageSearchParams,
  LocalEventVisibleStatus,
} from '../types/localEvent';

const PAGE_SIZE = 20;

/** 목록이 비었을 때만 노출 — 등록 직후 화면 확인용 더미 (상세/수정 API 호출 없음) */
const DEMO_LOCAL_EVENT_ID = '__local_event_demo__';

const DEMO_LOCAL_EVENT_ROW: LocalEventMypageItem = {
  no: 1,
  id: DEMO_LOCAL_EVENT_ID,
  eventName: '[예시] 지역대회등록 예시',
  eventUrl: 'https://example.com',
  eventStartDate: '2026-06-15T00:00:00',
  registStartDate: '2026-05-01T00:00:00',
  registDeadline: '2026-06-01T00:00:00',
  visibleStatus: 'OPEN',
  eventStatus: 'OPEN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  applicantCompany: '전국마라톤협회',
};

function isDemoLocalEventRow(row: { id: string }) {
  return row.id === DEMO_LOCAL_EVENT_ID;
}

function toApiEventStatus(v: string): LocalEventMypageEventStatus | undefined {
  if (!v) return undefined;
  if (v === 'none') return 'PENDING';
  if (v === 'ing') return 'OPEN';
  if (v === 'done') return 'CLOSED';
  if (v === 'final_closed') return 'FINAL_CLOSED';
  if (v === 'upload_applying') return 'UPLOAD_APPLYING';
  return undefined;
}

function toApiVisible(v: string): LocalEventVisibleStatus | undefined {
  if (!v) return undefined;
  if (v === 'open') return 'OPEN';
  if (v === 'test') return 'TEST';
  if (v === 'closed') return 'CLOSE';
  return undefined;
}

function formatDateOnly(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function renderVisibleLabel(v: string) {
  if (v === 'OPEN') return <span className="text-[#1E5EFF] text-xs font-medium">공개</span>;
  if (v === 'TEST') return <span className="text-[#FFA500] text-xs font-medium">테스트</span>;
  if (v === 'CLOSE' || v === 'CLOSED') return <span className="text-[#D12D2D] text-xs font-medium">비공개</span>;
  return <span className="text-xs text-gray-500">{v || '-'}</span>;
}

/** 모바일 카드: 공개/비공개/테스트 — 기존 수정 버튼과 같은 아웃라인 스타일 */
function renderVisibilityOutline(v: string) {
  const base =
    'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight whitespace-nowrap active:scale-[0.98] transition-colors';
  if (v === 'OPEN') {
    return (
      <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>
        공개
      </span>
    );
  }
  if (v === 'TEST') {
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        테스트
      </span>
    );
  }
  if (v === 'CLOSE' || v === 'CLOSED') {
    return (
      <span className={`${base} border-rose-200 bg-rose-50 text-rose-700`}>
        비공개
      </span>
    );
  }
  return (
    <span className={`${base} border-gray-200 bg-gray-50 text-gray-700`}>
      {v || '—'}
    </span>
  );
}

function renderEventStatusBadge(status: string, badgeClassName?: string) {
  const map: Record<string, RegStatus> = {
    PENDING: '비접수',
    OPEN: '접수중',
    CLOSED: '접수마감',
    FINAL_CLOSED: '최종마감',
  };
  if (map[status]) {
    return <RegistrationStatusBadge status={map[status]} size="smd" className={badgeClassName} />;
  }
  if (status === 'UPLOAD_APPLYING') {
    return <RegistrationStatusBadge status="업로드신청" size="smd" className={badgeClassName} />;
  }
  if (badgeClassName) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-700 ${badgeClassName}`}
      >
        {status || '-'}
      </span>
    );
  }
  return <span className="text-gray-600 text-xs">{status || '-'}</span>;
}

export default function LocalEventMineList() {
  const [yearStr, setYearStr] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [pubFilter, setPubFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pendingKeyword, setPendingKeyword] = useState('');
  const [page, setPage] = useState(1);

  // 전체 대회 목록 조회 (년도 필터용)
  const { data: allData } = useMyLocalEvents({
    page: 1,
    size: 9999,
  });

  const searchParams = useMemo((): LocalEventMypageSearchParams => {
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    return {
      page,
      size: PAGE_SIZE,
      year: year != null && !Number.isNaN(year) ? year : undefined,
      visibleStatus: toApiVisible(pubFilter),
      eventStatus: toApiEventStatus(regFilter),
      keyword: keyword.trim() || undefined,
    };
  }, [page, yearStr, pubFilter, regFilter, keyword]);

  const { data, isLoading, isError, error, isFetching } = useMyLocalEvents(searchParams);

  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const hasActiveFilters =
    Boolean(yearStr) || Boolean(regFilter) || Boolean(pubFilter) || Boolean(keyword.trim());

  const displayItems =
    items.length > 0
      ? items
      : !isLoading && !isError && !hasActiveFilters
        ? [DEMO_LOCAL_EVENT_ROW]
        : [];

  const showDemoRibbon = items.length === 0 && displayItems.length > 0;

  // 실제 등록된 대회가 있는 년도만 추출
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const allItems = allData?.content ?? [];
    allItems.forEach((item) => {
      if (item.eventStartDate) {
        const y = new Date(item.eventStartDate).getFullYear();
        if (!Number.isNaN(y)) years.add(y);
      }
    });
    const currentYear = new Date().getFullYear();
    const yearList = Array.from(years)
      .filter((y) => y <= currentYear + 1)
      .sort((a, b) => b - a);
    return [
      { label: '전체', value: '' },
      ...yearList.map((y) => ({ label: String(y), value: String(y) })),
    ];
  }, [allData]);

  const handleSearch = () => {
    setKeyword(pendingKeyword);
    setPage(1);
  };

  const handleReset = () => {
    setYearStr('');
    setRegFilter('');
    setPubFilter('');
    setKeyword('');
    setPendingKeyword('');
    setPage(1);
  };

  const filterControls = (
    <LocalEventMineSearchControls
      year={yearStr}
      regStatus={regFilter}
      visibleStatus={pubFilter}
      keyword={pendingKeyword}
      yearOptions={availableYears}
      onYearChange={(v) => { setYearStr(v); setPage(1); }}
      onRegStatusChange={(v) => { setRegFilter(v); setPage(1); }}
      onVisibleStatusChange={(v) => { setPubFilter(v); setPage(1); }}
      onKeywordChange={setPendingKeyword}
      onSearch={handleSearch}
      onReset={handleReset}
    />
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {filterControls}
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-gray-500">
          목록을 불러오는 중...
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="space-y-4">
        {filterControls}
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-800">
          목록을 불러오지 못했습니다.
          {error instanceof Error && error.message ? (
            <span className="block mt-2 text-xs text-red-600">{error.message}</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterControls}

      {isFetching && data ? (
        <p className="text-xs text-gray-400 text-right">갱신 중...</p>
      ) : null}

      {displayItems.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <p className="text-gray-600">조건에 맞는 지역대회가 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400">필터를 바꾸거나 등록 탭에서 새로 등록해 보세요.</p>
        </div>
      ) : (
        <>
          {showDemoRibbon ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-center text-xs text-amber-950 sm:text-sm">
              아래 한 건은 <strong>등록 후 목록 예시</strong>입니다. 실제 등록하면 같은 형태로 표시됩니다.
            </div>
          ) : null}

          {/* ── 데스크탑 테이블 (md 이상) ── */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-[800px] w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="px-3 py-3 w-14 text-center font-medium whitespace-nowrap">번호</th>
                  <th className="px-3 py-3 w-[108px] text-center font-medium whitespace-nowrap">개최일</th>
                  <th className="px-3 py-3 text-center font-medium min-w-[200px]">대회명</th>
                  <th className="px-3 py-3 text-center font-medium min-w-[120px]">소속</th>
                  <th className="px-3 py-3 w-[100px] text-center font-medium">신청상태</th>
                  <th className="px-3 py-3 w-[80px] text-center font-medium">공개여부</th>
                  <th className="px-3 py-3 w-[64px] text-center font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50/80 ${isDemoLocalEventRow(row) ? 'bg-amber-50/40' : ''
                      }`}
                  >
                    <td className="px-3 py-3 text-center text-xs tabular-nums text-gray-500">{row.no}</td>
                    <td className="px-3 py-3 text-center text-xs whitespace-nowrap text-[#6B7280]">
                      {formatDateOnly(row.eventStartDate)}
                    </td>
                    <td className="px-3 py-3">
                      {isDemoLocalEventRow(row) ? (
                        <span className="line-clamp-2 text-sm font-medium text-gray-800">{row.eventName}</span>
                      ) : (
                        <Link
                          href={`/schedule/local/${row.id}`}
                          className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                        >
                          {row.eventName}
                        </Link>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-600">{row.applicantCompany || '—'}</td>
                    <td className="px-3 py-3 text-center">{renderEventStatusBadge(row.eventStatus)}</td>
                    <td className="px-3 py-3 text-center">{renderVisibleLabel(row.visibleStatus)}</td>
                    <td className="px-3 py-3 text-center">
                      {isDemoLocalEventRow(row) ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <Link
                          href={`/schedule/local/${row.id}/edit`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          수정
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── 모바일 카드 (md 미만) ── */}
          <div className="md:hidden space-y-2">
            {displayItems.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${isDemoLocalEventRow(row) ? 'border-amber-200 bg-amber-50/50' : ''
                  }`}
              >
                <div className="mb-2 flex min-w-0 items-start gap-2">
                  {isDemoLocalEventRow(row) ? (
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
                      {row.eventName}
                    </span>
                  ) : (
                    <Link
                      href={`/schedule/local/${row.id}`}
                      className="min-w-0 flex-1 text-sm font-semibold leading-snug text-gray-900 line-clamp-2 hover:text-blue-600 hover:underline"
                    >
                      {row.eventName}
                    </Link>
                  )}
                  <div className="shrink-0">{renderVisibilityOutline(row.visibleStatus)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{formatDateOnly(row.eventStartDate)}</span>
                  {row.applicantCompany ? <span className="max-w-[10rem] truncate">{row.applicantCompany}</span> : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {renderEventStatusBadge(
                    row.eventStatus,
                    '!rounded-full !h-7 !min-h-7 !w-fit !min-w-0 !max-w-full !px-2.5 !py-0 !text-[11px] !leading-tight'
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > 0 && !showDemoRibbon ? (
            <>
              <PaginationBar
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                showTotalText
                showPageIndicator
                className="bg-white mt-4"
                totalPages={totalPages > 0 ? totalPages : undefined}
                totalTextFormatter={(t) => (
                  <>총 <b>{t.toLocaleString()}</b>건</>
                )}
              />
              <div className="flex justify-center py-2 bg-white sm:py-6">
                <Pagination
                  page={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                  groupSize={10}
                  responsive
                  showEdge
                  activeColor="blue"
                />
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
