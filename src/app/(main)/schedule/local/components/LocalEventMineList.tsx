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
  LocalEventMypageSearchParams,
  LocalEventVisibleStatus,
} from '../types/localEvent';

const PAGE_SIZE = 20;

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

      {items.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">조건에 맞는 지역대회가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">필터를 바꾸거나 등록 탭에서 새로 등록해 보세요.</p>
        </div>
      ) : (
        <>
          {/* ── 데스크탑 테이블 (md 이상) ── */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-[800px] w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="px-3 py-3 w-14 text-center font-medium whitespace-nowrap">번호</th>
                  <th className="px-3 py-3 w-[108px] text-center font-medium whitespace-nowrap">개최일</th>
                  <th className="px-3 py-3 text-left font-medium min-w-[200px]">대회명</th>
                  <th className="px-3 py-3 text-left font-medium min-w-[120px]">소속</th>
                  <th className="px-3 py-3 w-[100px] text-center font-medium">신청상태</th>
                  <th className="px-3 py-3 w-[80px] text-center font-medium">공개여부</th>
                  <th className="px-3 py-3 w-[64px] text-center font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-3 py-3 text-center text-gray-500 tabular-nums text-xs">{row.no}</td>
                    <td className="px-3 py-3 text-center text-[#6B7280] whitespace-nowrap text-xs">
                      {formatDateOnly(row.eventStartDate)}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/schedule/local/${row.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline line-clamp-2 text-sm"
                      >
                        {row.eventName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{row.applicantCompany || '—'}</td>
                    <td className="px-3 py-3 text-center">{renderEventStatusBadge(row.eventStatus)}</td>
                    <td className="px-3 py-3 text-center">{renderVisibleLabel(row.visibleStatus)}</td>
                    <td className="px-3 py-3 text-center">
                      <Link
                        href={`/schedule/local/${row.id}/edit`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── 모바일 카드 (md 미만) ── */}
          <div className="md:hidden space-y-2">
            {items.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-2 mb-2 min-w-0">
                  <Link
                    href={`/schedule/local/${row.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-sm leading-snug line-clamp-2 flex-1 min-w-0"
                  >
                    {row.eventName}
                  </Link>
                  <div className="shrink-0">{renderVisibilityOutline(row.visibleStatus)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{formatDateOnly(row.eventStartDate)}</span>
                  {row.applicantCompany ? <span className="truncate max-w-[10rem]">{row.applicantCompany}</span> : null}
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

          {total > 0 ? (
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
