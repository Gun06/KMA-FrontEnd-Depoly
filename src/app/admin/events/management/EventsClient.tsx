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
import PhoneAuthBulkModal from './PhoneAuthBulkModal';
import { bulkUpdateEventPhoneAuth } from '@/services/admin/phoneAuth';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button/Button';
import { Smartphone } from 'lucide-react';

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
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);
  const headCbRef = React.useRef<HTMLInputElement>(null);

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

  const pageAllSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const pageSomeSelected = rows.some((r) => selectedIds.includes(r.id)) && !pageAllSelected;

  React.useEffect(() => {
    if (headCbRef.current) headCbRef.current.indeterminate = pageSomeSelected;
  }, [pageSomeSelected]);

  const handleToggleSelectAll = React.useCallback(() => {
    setSelectedIds((prev) => {
      if (pageAllSelected) {
        const pageIdSet = new Set(rows.map((r) => r.id));
        return prev.filter((id) => !pageIdSet.has(id));
      }
      const merged = new Set([...prev, ...rows.map((r) => r.id)]);
      return Array.from(merged);
    });
  }, [pageAllSelected, rows]);

  const handleToggleSelectOne = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const handleBulkPhoneAuthSubmit = React.useCallback(
    async (payload: {
      scope: 'SELECTED' | 'ALL_ELIGIBLE';
      phoneAuthRequired: boolean;
      reason: string;
    }) => {
      setIsBulkUpdating(true);
      try {
        await bulkUpdateEventPhoneAuth({
          scope: payload.scope,
          eventIds: payload.scope === 'SELECTED' ? selectedIds : [],
          phoneAuthRequired: payload.phoneAuthRequired,
          reason: payload.reason,
        });
        toast.success('휴대폰 인증 설정이 변경되었습니다.');
        setIsBulkModalOpen(false);
        setSelectedIds([]);
        await queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'list'] });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '일괄 변경에 실패했습니다.');
      } finally {
        setIsBulkUpdating(false);
      }
    },
    [queryClient, selectedIds]
  );

  const columns: Column<EventRow>[] = React.useMemo(
    () => [
    {
      key: 'select',
      header: (
        <input
          ref={headCbRef}
          type="checkbox"
          checked={pageAllSelected}
          onChange={handleToggleSelectAll}
          data-stop-bubble="true"
          aria-label="현재 페이지 전체 선택"
        />
      ),
      width: 40,
      align: 'center',
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={() => handleToggleSelectOne(r.id)}
          data-stop-bubble="true"
          aria-label={`${r.title} 선택`}
        />
      ),
    },
    { key: 'no', header: '번호', width: 64, align: 'center', className: 'text-gray-500' },
    {
      key: 'date',
      header: '개최일',
      width: 100,
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
          className="block max-w-[440px] truncate hover:underline cursor-pointer"
          title={r.title}
          onClick={() => router.push(`/admin/events/${r.id}`)}
        >
          {r.title}
        </span>
      ),
    },
    {
      key: 'place',
      header: '개최지',
      width: 180,
      align: 'center',
      render: (r) => <span className="mx-auto block max-w-[200px] truncate" title={r.place}>{r.place}</span>,
    },
    {
      key: 'host',
      header: '주최',
      width: 160,
      align: 'center',
      render: (r) => <span className="mx-auto block max-w-[180px] truncate" title={r.host}>{r.host}</span>,
    },
    {
      key: 'applyStatus',
      header: '신청상태',
      width: 90,
      align: 'center',
      render: (r) => (
        <RegistrationStatusBadge status={r.applyStatus} size="dense" />
      ),
    },
    {
      key: 'isPublic',
      header: '공개여부',
      width: 80,
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
  ],
    [
      handleToggleSelectAll,
      handleToggleSelectOne,
      pageAllSelected,
      router,
      selectedIds,
    ]
  );

  const bulkPhoneAuthButton = (
    <Button
      tone="white"
      size="sm"
      weight="semibold"
      iconLeft={<Smartphone className="h-4 w-4" aria-hidden />}
      onClick={() => setIsBulkModalOpen(true)}
      className="ml-auto shrink-0 border border-[#256EF4] text-[#256EF4] transition-colors hover:bg-blue-50 hover:brightness-100 !h-9 !px-3 !text-[13px]"
    >
      휴대폰 인증 일괄변경
    </Button>
  );

  const filterControls = preset && (
    <FilterBar
      {...preset}
      dense
      searchWidth={240}
      className="!items-center !gap-2 flex-wrap justify-end"
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
  );

  const isFirstLoading = isLoading && rows.length === 0;
  const failed = !!error && rows.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1920px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-semibold">대회 관리</h3>
          {selectedIds.length > 0 && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 font-pretendard">
              {selectedIds.length}개 대회 선택됨
            </span>
          )}
          {bulkPhoneAuthButton}
        </div>

        <AdminTable<EventRow>
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
          minWidth={1100}
        />
      </div>

      <PhoneAuthBulkModal
        isOpen={isBulkModalOpen}
        selectedCount={selectedIds.length}
        isSubmitting={isBulkUpdating}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handleBulkPhoneAuthSubmit}
      />
    </div>
  );
}
