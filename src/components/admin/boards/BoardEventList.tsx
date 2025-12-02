'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, { type RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import { useEventList, useEventSearch } from '@/hooks/useNotices';
import type { EventListItem, EventListResponse } from '@/types/eventList';

type BoardEventRow = {
  no: number;
  id: string;
  date: string;   // YYYY-MM-DD
  title: string;
  applyStatus: RegStatus;
  isPublic: boolean;
  url: string;
};

type PublicFilter = '' | '공개' | '비공개';

const mapStatus = (v: string): RegStatus | '' => {
  if (v === '접수중') return '접수중';
  if (v === '접수마감') return '접수마감';
  if (v === '비접수') return '비접수';
  return '';
};

const mapPublic = (v: string): PublicFilter => {
  if (v === '공개') return '공개';
  if (v === '비공개') return '비공개';
  return '';
};

const mapYear = (v: string) => v;

const shorten = (s: string, max = 56) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

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

  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<'접수중' | '접수마감' | '비접수' | ''>('');
  const [pub, setPub] = React.useState<'' | '공개' | '비공개'>('');
  const [year, setYear] = React.useState<string>('');        
  const [page, setPage] = React.useState(1);
  const pageSize = 16;

  // 검색 조건이 있는지 확인
  const hasSearchConditions = q || status || pub || year;

  const mapRow = React.useCallback(
    (e: EventListItem): BoardEventRow => ({
      no: e.no,
      id: e.id,
      date: e.startDate.split('T')[0], // ISO 날짜에서 YYYY-MM-DD만 추출
      title: e.nameKr,
      applyStatus: mapEventStatusToRegStatus(e.eventStatus),
      isPublic: e.visibleStatus,
      url: e.eventsPageUrl,
    }),
    []
  );

  // API의 eventStatus를 RegStatus로 매핑하는 함수
  const mapEventStatusToRegStatus = (eventStatus: string): RegStatus => {
    switch (eventStatus) {
      case 'OPEN': return '접수중';
      case 'CLOSED': return '접수마감';
      case 'NOT_OPEN': return '비접수';
      default: return '비접수';
    }
  };

  // 상태값을 API 파라미터로 변환
  const eventStatus = React.useMemo((): 'OPEN' | 'CLOSED' | 'PENDING' | undefined => {
    switch (status) {
      case '접수중': return 'OPEN';
      case '접수마감': return 'CLOSED';
      case '비접수': return 'PENDING';
      default: return undefined;
    }
  }, [status]);

  const visibleStatus = React.useMemo(() => {
    if (pub === '공개') return true;
    if (pub === '비공개') return false;
    return undefined;
  }, [pub]);

  const yearNumber = React.useMemo(() => {
    return year ? parseInt(year, 10) : undefined;
  }, [year]);

  // 검색 API 또는 일반 API 선택 - 조건에 따라 하나의 훅만 호출
  const searchParams = {
    page,
    size: pageSize,
    keyword: q || undefined,
    year: yearNumber,
    visibleStatus,
    eventStatus,
  };

  // 조건에 따라 하나의 훅만 호출하여 중복 요청 방지
  const searchResult = useEventSearch(searchParams, Boolean(hasSearchConditions));
  const listResult = useEventList(page, pageSize, Boolean(!hasSearchConditions));

  // 조건에 따라 결과 선택
  const { data: eventListData, isLoading, error } = hasSearchConditions 
    ? searchResult as { data: EventListResponse | undefined; isLoading: boolean; error: Error | null; }
    : listResult as { data: EventListResponse | undefined; isLoading: boolean; error: Error | null; };

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
    } else {
      router.push(`/admin/boards/${basePath}/events/${row.id}`);
    }
  };

  const columns: Column<BoardEventRow>[] = [
    { key: 'no', header: '번호', width: 80, align: 'center' },
    {
      key: 'date',
      header: '대회날짜',
      width: 120,
      align: 'center',
      className: 'text-[#6B7280] whitespace-nowrap',
      render: (r) => `[${r.date.replaceAll('-', '.')}]`,
    },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <button
          type="button"
          className="truncate hover:underline cursor-pointer text-left"
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
      width: 110,
      align: 'center',
      render: (r) => <RegistrationStatusBadge status={r.applyStatus} size="smd" />,
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 100,
      align: 'center',
      render: (r) =>
        r.isPublic ? (
          <span className="text-[#1E5EFF]">공개</span>
        ) : (
          <span className="text-[#D12D2D]">비공개</span>
        ),
    },
    {
      key: 'url',
      header: 'URL',
      width: 320,
      align: 'center',
      className: 'w-[320px]',
      render: (r) => (
        <div className="w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline"
            title={r.url}
          >
            {shorten(r.url)}
          </a>
        </div>
      ),
    },
  ];

  // 대회 데이터에서 실제 있는 년도만 추출
  const allEventsQuery = useEventList(1, 1000, true);
  const allEventsData = allEventsQuery.data as EventListResponse | undefined;
  
  const availableYears = React.useMemo(() => {
    if (!allEventsData?.content) return [];
    
    const years = new Set<number>();
    allEventsData.content.forEach((event: EventListItem) => {
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

const filterControls = (preset || tableCtaLabel) && (
    <div className="flex flex-wrap items-center gap-2">
      {preset && (
        <FilterBar
          {...preset}
          className="!gap-3"
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
      )}
      {tableCtaLabel && (
        <Button
          size="sm"
          tone="primary"
          onClick={tableCtaOnClick ?? (() => tableCtaHref && router.push(tableCtaHref))}
        >
          {tableCtaLabel}
        </Button>
      )}
    </div>
  );

  const renderHeader = () => {
    if (!title && !titleAddon) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {title ? <h3 className="text-[16px] font-semibold">{title}</h3> : null}
        {titleAddon}
      </div>
    );
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        {renderHeader()}
        {filterControls}
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">대회 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        {renderHeader()}
        {filterControls}
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">대회 목록을 불러오는데 실패했습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      {renderHeader()}
      {filterControls}

      <AdminTable<BoardEventRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        renderFilters={null}
        renderSearch={null}
        renderActions={null}
        pagination={{ page, pageSize, total: totalCount, onChange: setPage, align: 'right' }}
        minWidth={1200}
        contentMinHeight={rows.length >= pageSize ? '100vh' : 'auto'}
      />
    </div>
  );
};
