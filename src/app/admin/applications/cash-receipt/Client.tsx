'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { Column } from '@/components/common/Table/BaseTable';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import { useEventList } from '@/hooks/useNotices';
import { useCashReceiptSearch } from './hooks/useCashReceiptAdmin';
import CashReceiptDetailDrawer from './CashReceiptDetailDrawer';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import {
  bulkCompleteCashReceiptsFromFile,
  downloadCashReceiptTemplate,
  downloadRequestedCashReceiptsExcel,
  downloadSelectedCashReceiptsExcel,
  updateCashReceiptsStatusBulk,
} from './services/cashReceiptAdmin';
import type { EventListResponse } from '@/types/eventList';
import type { CashReceiptAdminStatus, CashReceiptSearchItem } from './types/cashReceiptAdmin';

type Props = {
  initialPage: number;
  pageSize: number;
};

const STATUS_LABEL: Record<CashReceiptAdminStatus, string> = {
  REQUESTED: '처리 대기',
  COMPLETED: '발급 완료',
  CANCELED: '발급 취소',
};

const STATUS_CLASS: Record<CashReceiptAdminStatus, string> = {
  REQUESTED: 'text-[#E6A400]',
  COMPLETED: 'text-[#1F8A3B]',
  CANCELED: 'text-[#D12D2D]',
};

const CASH_RECEIPT_STATUS_SELECT_OPTIONS = [
  { value: 'REQUESTED' as const, label: '처리 대기' },
  { value: 'COMPLETED' as const, label: '발급 완료' },
  { value: 'CANCELED' as const, label: '발급 취소' },
];

const CASH_RECEIPT_DOWNLOAD_MENU = [
  { label: '전체 목록 다운로드', value: 'downloadList' },
  { label: '선택 목록 다운로드', value: 'downloadSelectedList' },
  { label: '기본 양식 다운로드', value: 'downloadTemplate' },
] as const;

export default function Client({ initialPage, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState<number>(initialPage);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [eventId, setEventId] = React.useState<string>(sp.get('eventId') ?? 'ALL');
  const [status, setStatus] = React.useState<CashReceiptAdminStatus | ''>((sp.get('status') as CashReceiptAdminStatus | '') ?? '');
  const [keyword, setKeyword] = React.useState<string>(sp.get('q') ?? '');
  const [isCashReceiptDownloading, setIsCashReceiptDownloading] = React.useState(false);
  const [isCashReceiptTemplateDownloading, setIsCashReceiptTemplateDownloading] = React.useState(false);
  const [isCashReceiptBulkUploading, setIsCashReceiptBulkUploading] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = React.useState<CashReceiptAdminStatus>('COMPLETED');
  const [isBulkStatusUpdating, setIsBulkStatusUpdating] = React.useState(false);
  const bulkCompleteInputRef = React.useRef<HTMLInputElement>(null);
  const headCbRef = React.useRef<HTMLInputElement>(null);
  const autoOpenedFromQueryRef = React.useRef(false);

  React.useEffect(() => {
    const qs = new URLSearchParams();
    if (page !== 1) qs.set('page', String(page));
    if (eventId !== 'ALL') qs.set('eventId', eventId);
    if (status) qs.set('status', status);
    if (keyword.trim()) qs.set('q', keyword.trim());
    if (drawerOpen && selectedId) qs.set('id', selectedId);
    router.replace(qs.toString() ? `${pathname}?${qs.toString()}` : pathname);
  }, [router, pathname, page, eventId, status, keyword, drawerOpen, selectedId]);

  const { data: eventData } = useEventList(1, 200) as { data: EventListResponse | undefined };
  const eventOptions = React.useMemo(
    () => [
      { label: '대회전체', value: 'ALL' },
      ...((eventData?.content ?? []).map((e) => ({ label: e.nameKr, value: e.id }))),
    ],
    [eventData]
  );

  const params = React.useMemo(
    () => ({
      eventId,
      status,
      keyword,
      sort: 'desc' as const,
      page,
      size: pageSize,
    }),
    [eventId, status, keyword, page, pageSize]
  );

  const { data, isLoading } = useCashReceiptSearch(params);

  const presetBase = PRESETS['참가신청 / 현금영수증관리']?.props;
  const preset = React.useMemo(() => {
    if (!presetBase) return undefined;
    return {
      ...presetBase,
      fields: presetBase.fields?.map((f) =>
        f.label === '대회' ? { ...f, options: eventOptions } : f
      ),
      initialValues: [eventId, status],
      initialSearchValue: keyword,
    };
  }, [presetBase, eventOptions, eventId, status, keyword]);

  const rows = React.useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;

  const deepLinkId = sp.get('id');
  const deepLinkQ = sp.get('q')?.trim() ?? '';

  // 신청자 관리 등에서 넘어온 id/q로 해당 건 상세 자동 오픈
  React.useEffect(() => {
    if (deepLinkId) {
      setSelectedId(deepLinkId);
      setDrawerOpen(true);
      return;
    }

    if (!deepLinkQ || autoOpenedFromQueryRef.current || isLoading || rows.length === 0) return;

    const match =
      rows.find((row) => row.requesterName === deepLinkQ) ?? (rows.length === 1 ? rows[0] : undefined);
    if (match) {
      autoOpenedFromQueryRef.current = true;
      setSelectedId(match.id);
      setDrawerOpen(true);
    }
  }, [deepLinkId, deepLinkQ, isLoading, rows]);

  React.useEffect(() => {
    autoOpenedFromQueryRef.current = false;
  }, [deepLinkId, deepLinkQ]);

  const idsOnPage = React.useMemo(() => rows.map((r) => r.id), [rows]);

  React.useEffect(() => {
    setSelectedIds([]);
  }, [page, eventId, status, keyword]);

  const pageAllSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const pageSomeSelected = rows.some((r) => selectedIds.includes(r.id)) && !pageAllSelected;

  React.useEffect(() => {
    if (headCbRef.current) headCbRef.current.indeterminate = pageSomeSelected;
  }, [pageSomeSelected]);

  const handleToggleSelectAll = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) setSelectedIds(idsOnPage);
      else setSelectedIds([]);
    },
    [idsOnPage]
  );

  const handleToggleSelectOne = React.useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
      );
    },
    []
  );

  const columns: Column<CashReceiptSearchItem>[] = React.useMemo(
    () => [
      {
        key: '__sel',
        header: (
          <div className="inline-flex w-full items-center justify-center" data-allow-bubble="true">
            <input
              ref={headCbRef}
              type="checkbox"
              aria-label="전체 선택"
              checked={pageAllSelected}
              onChange={handleToggleSelectAll}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ),
        width: 56,
        align: 'center',
        headerAlign: 'center',
        render: (row) => (
          <input
            type="checkbox"
            aria-label={`${row.id} 선택`}
            checked={selectedIds.includes(row.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleToggleSelectOne(row.id, e.target.checked)}
          />
        ),
      },
      { key: 'no', header: '번호', width: 90, align: 'center' },
      { key: 'eventName', header: '대회명', align: 'left', headerAlign: 'center', className: 'text-left' },
      { key: 'requesterName', header: '신청자명', width: 230, align: 'center' },
      {
        key: 'status',
        header: '처리상태',
        width: 140,
        align: 'center',
        render: (row) => (
          <span className={`font-semibold ${STATUS_CLASS[row.status] ?? 'text-gray-700'}`}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
        ),
      },
      {
        key: 'id',
        header: '환불 ID',
        width: 250,
        align: 'left',
        headerAlign: 'center',
        className: 'text-left text-xs font-mono text-gray-600 truncate max-w-[250px]',
        render: (row) => (
          <div className="truncate" title={row.id}>
            {row.id}
          </div>
        ),
      },
    ],
    [handleToggleSelectAll, handleToggleSelectOne, pageAllSelected, selectedIds]
  );

  const handleCashReceiptExcelDownload = React.useCallback(() => {
    void (async () => {
      if (isCashReceiptDownloading) return;
      setIsCashReceiptDownloading(true);
      try {
        await downloadRequestedCashReceiptsExcel();
        toast.success('다운로드가 완료되었습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
      } finally {
        setIsCashReceiptDownloading(false);
      }
    })();
  }, [isCashReceiptDownloading]);

  const handleCashReceiptSelectedExcelDownload = React.useCallback(() => {
    if (selectedIds.length === 0) {
      toast.warning('다운로드할 항목을 선택해주세요.');
      return;
    }
    void (async () => {
      if (isCashReceiptDownloading) return;
      setIsCashReceiptDownloading(true);
      try {
        await downloadSelectedCashReceiptsExcel(selectedIds);
        toast.success('선택 항목 다운로드가 완료되었습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
      } finally {
        setIsCashReceiptDownloading(false);
      }
    })();
  }, [isCashReceiptDownloading, selectedIds]);

  const handleCashReceiptTemplateDownload = React.useCallback(() => {
    void (async () => {
      if (isCashReceiptTemplateDownloading) return;
      setIsCashReceiptTemplateDownloading(true);
      try {
        await downloadCashReceiptTemplate();
        toast.success('기본 양식 다운로드가 완료되었습니다.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
      } finally {
        setIsCashReceiptTemplateDownloading(false);
      }
    })();
  }, [isCashReceiptTemplateDownloading]);

  const handleCashReceiptBulkFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      void (async () => {
        if (isCashReceiptBulkUploading) return;
        setIsCashReceiptBulkUploading(true);
        try {
          await bulkCompleteCashReceiptsFromFile(file);
          toast.success('일괄 등록이 완료되었습니다.');
          await queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '일괄 등록에 실패했습니다.');
        } finally {
          setIsCashReceiptBulkUploading(false);
        }
      })();
    },
    [isCashReceiptBulkUploading, queryClient]
  );

  const handleBulkStatusApply = React.useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.warning('변경할 항목을 선택해주세요.');
      return;
    }
    setIsBulkStatusUpdating(true);
    try {
      await updateCashReceiptsStatusBulk({ ids: selectedIds, targetStatus: bulkTargetStatus });
      toast.success('처리상태가 변경되었습니다.');
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setIsBulkStatusUpdating(false);
    }
  }, [selectedIds, bulkTargetStatus, queryClient]);

  const filterBarButtons = React.useMemo(
    () => [
      { label: '검색', tone: 'dark' as const, iconOnly: true as const },
      {
        label: '다운로드',
        tone: 'primary' as const,
        loading: isCashReceiptDownloading,
        menu: [...CASH_RECEIPT_DOWNLOAD_MENU],
      },
      {
        label: '일괄등록',
        tone: 'primary' as const,
        iconRight: true as const,
        onClick: () => bulkCompleteInputRef.current?.click(),
        disabled: isCashReceiptBulkUploading,
      },
    ],
    [isCashReceiptDownloading, isCashReceiptBulkUploading]
  );

  return (
    <div className="space-y-4">
      <div className="flex w-full min-w-0 items-center justify-between gap-4">
        <h3 className="text-[16px] font-semibold">현금영수증 관리</h3>
        <div className="flex shrink-0 flex-wrap items-center justify-end">
          <div data-stop-bubble="true" className="flex flex-wrap items-center gap-2">
            <SearchableSelect
              value={bulkTargetStatus}
              options={CASH_RECEIPT_STATUS_SELECT_OPTIONS}
              variant="compact"
              onChange={(v) => setBulkTargetStatus(v as CashReceiptAdminStatus)}
              className="w-[120px]"
            />
            <button
              type="button"
              className="rounded-md border border-blue-600 px-4 h-10 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIds.length === 0 || isBulkStatusUpdating}
              onClick={() => void handleBulkStatusApply()}
            >
              {isBulkStatusUpdating ? '처리 중...' : '선택 항목에 적용'}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={bulkCompleteInputRef}
        type="file"
        className="hidden"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleCashReceiptBulkFileChange}
      />

      {preset && (
        <div className="w-full min-w-0">
          <FilterBar
            {...preset}
            searchFlexGrow
            className="!gap-3"
            buttons={filterBarButtons}
            onFieldChange={(label, value) => {
              if (label === '대회') setEventId(value || 'ALL');
              if (label === '상태') setStatus((value as CashReceiptAdminStatus | '') ?? '');
              setPage(1);
            }}
            onSearch={(q) => {
              setKeyword(q);
              setPage(1);
            }}
            onReset={() => {
              setEventId('ALL');
              setStatus('');
              setKeyword('');
              setPage(1);
            }}
            onActionClick={(value) => {
              if (value === 'downloadList') handleCashReceiptExcelDownload();
              if (value === 'downloadSelectedList') handleCashReceiptSelectedExcelDownload();
              if (value === 'downloadTemplate') handleCashReceiptTemplateDownload();
            }}
          />
        </div>
      )}

      <AdminTable<CashReceiptSearchItem>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        pagination={{ page, pageSize, total, onChange: setPage, align: 'center' }}
        minWidth={1256}
        loadingMessage={isLoading ? '현금영수증 목록을 불러오는 중입니다.' : undefined}
        emptyMessage={
          !isLoading && rows.length === 0 
            ? '검색 결과가 없습니다\n다른 조건으로 다시 검색해보세요' 
            : undefined
        }
        onRowClick={(row) => {
          setSelectedId(row.id);
          setDrawerOpen(true);
        }}
      />

      <CashReceiptDetailDrawer
        open={drawerOpen}
        cashReceiptId={selectedId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedId(null);
          autoOpenedFromQueryRef.current = false;
          const qs = new URLSearchParams(sp.toString());
          qs.delete('id');
          router.replace(qs.toString() ? `${pathname}?${qs.toString()}` : pathname);
        }}
        onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] }); }}
      />
    </div>
  );
}
