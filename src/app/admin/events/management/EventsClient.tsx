// app/admin/events/management/EventsClient.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import RegistrationStatusBadge, {
  type RegStatus,
} from '@/components/common/Badge/RegistrationStatusBadge';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import {
  useAdminEventList,
  transformAdminEventToEventRow,
} from '@/services/admin';
import type { EventRow } from '@/components/admin/events/EventTable';

type PublicFilter = '' | '공개' | '테스트' | '비공개';

// 프리셋 value(none/ing/done) 및 한글 라벨 모두 지원
const mapStatus = (v: string): RegStatus | '' => {
  if (v === '접수중' || v === 'ing') return '접수중';
  if (v === '접수마감' || v === 'done') return '접수마감';
  if (v === '비접수' || v === 'none') return '비접수';
  if (v === '내부마감' || v === 'final_closed') return '내부마감';
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

export default function EventsClient({
  initialRows: _initialRows,
  initialPage,
  pageSize,
}: {
  initialRows: EventRow[];
  initialPage: number;
  pageSize: number;
}) {
  const router = useRouter();

  // ---------- 초기 상태 (BoardEventList와 동일하게 빈 상태로 시작) ----------
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<RegStatus | ''>('');
  const [pub, setPub] = React.useState<'' | '공개' | '테스트' | '비공개'>('');
  const [year, setYear] = React.useState<string>('');
  const [page, setPage] = React.useState(initialPage);

  // 상태값을 API 파라미터로 변환
  const eventStatus = React.useMemo((): 'OPEN' | 'CLOSED' | 'PENDING' | 'FINAL_CLOSED' | undefined => {
    switch (status) {
      case '접수중': return 'OPEN';
      case '접수마감': return 'CLOSED';
      case '비접수': return 'PENDING';
      case '내부마감': return 'FINAL_CLOSED';
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

  // API에서 이벤트 목록 조회 (서버 사이드 필터링)
  const {
    data: apiData,
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

  // 모든 이벤트를 가져와서 년도 필터 옵션 생성 (BoardEventList와 동일)
  const {
    data: allEventsData,
  } = useAdminEventList({
    page: 1,
    size: 1000,
  });

  // API 데이터를 EventRow로 변환 (API에서 받은 데이터만 사용)
  const { rows, totalCount } = React.useMemo(() => {
    if (!apiData?.content) {
      return { rows: [], totalCount: 0 };
    }
    
    // API에서 이미 필터링된 데이터를 받으므로 추가 필터링 불필요
    const mappedRows = apiData.content.map(transformAdminEventToEventRow);
    
    return {
      rows: mappedRows,
      totalCount: apiData.totalElements || 0
    };
  }, [apiData]);

  // 모든 이벤트를 EventRow로 변환 (년도 필터 옵션용)
  const allEvents = React.useMemo(() => {
    if (!allEventsData?.content) {
      return [];
    }
    return allEventsData.content.map(transformAdminEventToEventRow);
  }, [allEventsData]);

  // 대회 데이터에서 실제 있는 년도만 추출
  const availableYears = React.useMemo(() => {
    if (!allEvents.length) return [];

    const years = new Set<number>();
    allEvents.forEach((event) => {
      if (event.date) {
        const year = new Date(event.date).getFullYear();
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
  }, [allEvents]);

  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');
  const presetKey = '관리자 / 대회관리' as keyof typeof PRESETS;
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

  const columns: Column<EventRow>[] = [
    { key: 'no', header: '번호', width: 80, align: 'center' },
    {
      key: 'date',
      header: '개최일',
      width: 120,
      align: 'center',
      className: 'text-[#6B7280] whitespace-nowrap',
    },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <span
          className="truncate hover:underline cursor-pointer"
          title={r.title}
          onClick={() => router.push(`/admin/events/${r.id}`)}
        >
          {r.title}
        </span>
      ),
    },
    { key: 'place', header: '개최지', width: 200, align: 'center' },
    { key: 'host', header: '주최', width: 140, align: 'center' },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 110,
      align: 'center',
      render: (r) => (
        <RegistrationStatusBadge status={r.applyStatus} size="smd" />
      ),
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 100,
      align: 'center',
      render: (r) => {
        // boolean 레거시 처리
        if (typeof r.isPublic === 'boolean') {
          return r.isPublic ? (
            <span className="text-[#1E5EFF]">공개</span>
          ) : (
            <span className="text-[#D12D2D]">비공개</span>
          );
        }
        // enum 처리
        if (r.isPublic === 'OPEN') {
          return <span className="text-[#1E5EFF]">공개</span>;
        } else if (r.isPublic === 'TEST') {
          return <span className="text-[#FFA500]">테스트</span>;
        } else {
          return <span className="text-[#D12D2D]">비공개</span>;
        }
      },
    },
  ];

  const filterControls = preset && (
    <div className="flex flex-wrap items-center gap-2">
      <FilterBar
        {...preset}
        className="!gap-3"
        buttons={[
          { label: '검색', tone: 'dark' },
          { label: '대회등록', tone: 'primary', iconRight: true },
        ]}
        showReset
        onFieldChange={(label, value) => {
          const L = norm(String(label));
          if (L === '신청여부') {
            setStatus(mapStatus(String(value)));
          } else if (L === '공개여부') {
            const mappedPub = mapPublic(String(value));
            setPub(mappedPub);
          } else if (L === '년도') {
            setYear(mapYear(String(value)));
          }
          setPage(1);
        }}
        onSearch={(value) => {
          setQ(value);
          setPage(1);
        }}
        onActionClick={(label) => {
          if (label === '대회등록') router.push('/admin/events/register');
        }}
        onReset={() => {
          setQ('');
          setStatus('');
          setPub('');
          setYear('');
          setPage(1);
        }}
      />
    </div>
  );

  // 초기 로딩 상태 처리 (데이터가 없을 때만)
  if (isLoading && rows.length === 0) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        {filterControls}
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">대회 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리 (데이터가 없을 때만 에러 메시지 표시)
  if (error && rows.length === 0) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        {filterControls}
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">대회 목록을 불러오는데 실패했습니다.</div>
        </div>
      </div>
    );
  }

  // 빈 상태 처리 (로딩 중이 아니고 데이터가 없을 때만)
  if (rows.length === 0 && totalCount === 0 && !isLoading) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        {filterControls}
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">등록된 대회가 없습니다</div>
          <div className="text-sm text-gray-400">대회를 등록하면 여기에 표시됩니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      {filterControls}

      <AdminTable<EventRow>
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
}
