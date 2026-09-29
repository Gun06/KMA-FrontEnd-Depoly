'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, { type RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import { useAdminEventList, mapEventStatusToRegStatus } from '@/services/admin';
import type { AdminEventItem } from '@/types/Admin';

type BoardEventRow = {
  no: number;
  id: string;
  date: string;   // YYYY-MM-DD
  title: string;
  applyStatus: RegStatus;
  isPublic: 'OPEN' | 'TEST' | 'CLOSE';
  url: string;
};

type PublicFilter = '' | '공개' | '테스트' | '비공개';

// 프리셋 value(none/ing/done) 및 한글 라벨 모두 지원
const mapStatus = (v: string): RegStatus | '' => {
  if (v === '접수중' || v === 'ing') return '접수중';
  if (v === '접수마감' || v === 'done') return '접수마감';
  if (v === '비접수' || v === 'none') return '비접수';
  if (v === '최종마감' || v === 'final_closed') return '최종마감';
  return '';
};

// 프리셋 value(open/closed/test) 및 한글 라벨 모두 지원 (VisibleStatus: OPEN, CLOSE, TEST)
const mapPublic = (v: string): PublicFilter => {
  if (v === '공개' || v === 'open') return '공개';
  if (v === '테스트' || v === 'test') return '테스트';
  if (v === '비공개' || v === 'closed') return '비공개';
  return '';
};

const mapYear = (v: string) => v;

interface BoardEventListProps {
  title?: React.ReactNode;
  tableCtaLabel?: string;
  tableCtaHref?: string;
  tableCtaOnClick?: () => void;
  filterPresetKey?: string;
  basePath?: string; // notice, faq, inquiry
  titleAddon?: React.ReactNode;
}

export const BoardEventList = ({
  title,
  tableCtaLabel,
  tableCtaHref,
  tableCtaOnClick,
  filterPresetKey = "참가신청 / 기본",
  basePath = "notice",
  titleAddon,
}: BoardEventListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 초기 필터 상태 읽기
  const urlStatus = searchParams?.get('status') || '';
  const urlPub = searchParams?.get('pub') || '';
  const urlYear = searchParams?.get('year') || '';
  const urlQ = searchParams?.get('q') || '';
  const urlPage = searchParams?.get('page') || '1';

  // URL 파라미터를 상태 값으로 변환
  const initialStatus = React.useMemo(() => mapStatus(urlStatus), [urlStatus]);
  const initialPub = React.useMemo(() => mapPublic(urlPub), [urlPub]);
  const initialPage = React.useMemo(() => {
    const pageNum = parseInt(urlPage, 10);
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  }, [urlPage]);

  const [q, setQ] = React.useState(urlQ);
  const [status, setStatus] = React.useState<RegStatus | ''>(initialStatus);
  const [pub, setPub] = React.useState<'' | '공개' | '테스트' | '비공개'>(initialPub);
  const [year, setYear] = React.useState<string>(urlYear);
  const [page, setPage] = React.useState(initialPage);
  const pageSize = 16;

  // 상태를 URL로 동기화하는 함수
  const syncURL = React.useCallback(() => {
    const params = new URLSearchParams();
    
    // status를 URL 파라미터로 변환 (ing, done, none, final_closed)
    if (status === '접수중') params.set('status', 'ing');
    else if (status === '접수마감') params.set('status', 'done');
    else if (status === '비접수') params.set('status', 'none');
    else if (status === '최종마감') params.set('status', 'final_closed');
    
    // pub을 URL 파라미터로 변환 (open, test, closed)
    if (pub === '공개') params.set('pub', 'open');
    else if (pub === '테스트') params.set('pub', 'test');
    else if (pub === '비공개') params.set('pub', 'closed');
    
    if (year) params.set('year', year);
    if (q.trim()) params.set('q', q.trim());
    if (page !== 1) params.set('page', String(page));

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [router, pathname, status, pub, year, q, page]);

  // 상태 변경 시 URL 동기화 (초기 마운트 제외)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    syncURL();
  }, [status, pub, year, q, page, syncURL]);

  const mapRow = React.useCallback(
    (e: AdminEventItem): BoardEventRow => ({
      no: e.no ?? 0,
      id: e.id,
      date: e.startDate.split('T')[0], // ISO 날짜에서 YYYY-MM-DD만 추출
      title: e.nameKr,
      applyStatus: mapEventStatusToRegStatus(e.eventStatus),
      isPublic: e.visibleStatus,
      url: e.eventsPageUrl,
    }),
    []
  );

  // 상태값을 API 파라미터로 변환
  const eventStatus = React.useMemo((): 'OPEN' | 'CLOSED' | 'PENDING' | 'FINAL_CLOSED' | undefined => {
    switch (status) {
      case '접수중': return 'OPEN';
      case '접수마감': return 'CLOSED';
      case '비접수': return 'PENDING';
      case '최종마감': return 'FINAL_CLOSED';
      default: return undefined;
    }
  }, [status]);

  const visibleStatus = React.useMemo((): 'OPEN' | 'TEST' | 'CLOSE' | undefined => {
    if (pub === '공개') return 'OPEN';
    if (pub === '테스트') return 'TEST';
    if (pub === '비공개') return 'CLOSE';
    return undefined;
  }, [pub]);

  const yearNumber = React.useMemo(() => {
    return year ? parseInt(year, 10) : undefined;
  }, [year]);

  const {
    data: eventListData,
    isLoading,
    error,
  } = useAdminEventList({
    page,
    size: pageSize,
    keyword: q || undefined,
    year: yearNumber,
    visibleStatus,
    eventStatus,
  });

  const { rows, totalCount } = React.useMemo(() => {
    if (!eventListData || !eventListData.content) {
      return { rows: [], totalCount: 0 };
    }

    // API에서 이미 필터링된 데이터를 받으므로 추가 필터링 불필요
    const mappedRows = eventListData.content.map(mapRow);

    return {
      rows: mappedRows,
      totalCount: eventListData.totalElements || 0
    };
  }, [eventListData, mapRow]);

  const onRowTitleClick = (row: BoardEventRow) => {
    if (basePath === 'popup') {
      router.push(`/admin/banners/popups/events/${row.id}`);
    } else if (basePath === 'applications') {
      router.push(`/admin/applications/management/${row.id}`);
    } else if (basePath === 'notifications') {
      router.push(`/admin/notifications/events/${row.id}`);
    } else {
      router.push(`/admin/boards/${basePath}/events/${row.id}`);
    }
  };

  const columns: Column<BoardEventRow>[] = [
    { key: 'no', header: '번호', width: 64, align: 'center', className: 'text-gray-500' },
    {
      key: 'date',
      header: '대회날짜',
      width: 110,
      align: 'center',
      className: 'text-[#6B7280] whitespace-nowrap',
      render: (r) => r.date.replaceAll('-', '.'),
    },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <button
          type="button"
          className="block max-w-[440px] truncate hover:underline cursor-pointer text-left"
          title={r.title}
          onClick={(e) => { e.stopPropagation(); onRowTitleClick(r); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRowTitleClick(r);
            }
          }}
        >
          {r.title}
        </button>
      ),
    },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 90,
      align: 'center',
      render: (r) => <RegistrationStatusBadge status={r.applyStatus} size="dense" />,
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 80,
      align: 'center',
      render: (r) => {
        if (r.isPublic === 'OPEN') {
          return <span className="text-[#1E5EFF]">공개</span>;
        } else if (r.isPublic === 'TEST') {
          return <span className="text-[#FFA500]">테스트</span>;
        } else {
          return <span className="text-[#D12D2D]">비공개</span>;
        }
      },
    },
    {
      key: 'url',
      header: 'URL',
      width: 420,
      align: 'left',
      render: (r) => (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[420px] truncate text-gray-600 hover:underline"
          title={r.url}
          onClick={(e) => e.stopPropagation()}
        >
          {r.url}
        </a>
      ),
    },
  ];

  // 대회 데이터에서 실제 있는 년도만 추출
  const { data: allEventsData } = useAdminEventList({
    page: 1,
    size: 1000,
  });

  const availableYears = React.useMemo(() => {
    if (!allEventsData?.content) return [];

    const years = new Set<number>();
    allEventsData.content.forEach((event: AdminEventItem) => {
      if (event.startDate) {
        const year = new Date(event.startDate).getFullYear();
        years.add(year);
      }
    });

    const currentYear = new Date().getFullYear();
    const yearList = Array.from(years)
      .filter(y => y <= currentYear + 1) // 올해 +1까지
      .sort((a, b) => b - a); // 내림차순

    return [
      { label: "전체", value: "" },
      ...yearList.map(y => ({ label: String(y), value: String(y) }))
    ];
  }, [allEventsData]);

  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');
  const presetKey = (filterPresetKey ?? ('참가신청 / 기본' as keyof typeof PRESETS));
  const originalPreset = PRESETS[presetKey]?.props;

  // 년도 필드만 동적으로 수정
  const preset = React.useMemo(() => {
    if (!originalPreset) return undefined;
    return {
      ...originalPreset,
      fields: originalPreset.fields?.map(field =>
        field.label === '년도'
          ? { ...field, options: availableYears }
          : field
      ),
    };
  }, [originalPreset, availableYears]);

  const filterControls = preset && (
    <FilterBar
      {...preset}
      dense
      searchWidth={240}
      className="!items-center !gap-2 flex-wrap justify-end"
      buttons={[{ label: '검색', tone: 'dark' }]}
      showReset
      onFieldChange={(label, value) => {
        const L = norm(String(label));
        if (L === '신청상태') setStatus(mapStatus(String(value)));
        else if (L === '공개여부') setPub(mapPublic(String(value)));
        else if (L === '년도') setYear(mapYear(String(value)));
        setPage(1);
      }}
      onSearch={(value) => {
        setQ(value);
        setPage(1);
      }}
      onReset={() => {
        setQ('');
        setStatus('');
        setPub('');
        setYear('');
        setPage(1);
      }}
    />
  );

  const hasHeader = !!(title || titleAddon || tableCtaLabel);
  const isFirstLoading = isLoading && rows.length === 0;
  const failed = !!error && rows.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1920px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        {hasHeader && (
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
            {title ? <h3 className="text-[15px] font-semibold">{title}</h3> : null}
            {titleAddon}
            {tableCtaLabel && (
              <Button
                size="sm"
                tone="primary"
                className="ml-auto !h-9 !px-3 !text-[13px]"
                onClick={tableCtaOnClick ?? (() => tableCtaHref && router.push(tableCtaHref))}
              >
                {tableCtaLabel}
              </Button>
            )}
          </div>
        )}

        <AdminTable<BoardEventRow>
          dense
          contentMinHeight={null}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          renderFilters={
            <p className="shrink-0 text-sm text-gray-600">
              검색 결과 총 <b className="text-gray-900">{totalCount.toLocaleString()}</b>개
            </p>
          }
          renderActions={filterControls || null}
          loadingMessage={isFirstLoading ? '대회 목록을 불러오는 중...' : undefined}
          emptyMessage={
            failed
              ? '대회 목록을 불러오는데 실패했습니다.'
              : '등록된 대회가 없습니다.\n대회를 등록하면 여기에 표시됩니다.'
          }
          pagination={{
            page,
            pageSize,
            total: totalCount,
            onChange: setPage,
            bar: {
              totalTextFormatter: (cnt) => (
                <>
                  총 <b>{cnt.toLocaleString()}</b>개 대회
                </>
              ),
            },
          }}
          minWidth={1000}
        />
      </div>
    </div>
  );
};
