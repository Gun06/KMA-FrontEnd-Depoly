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
import { useCashReceiptBatches, useCashReceiptSearch } from './hooks/useCashReceiptAdmin';
import CashReceiptDetailDrawer from './CashReceiptDetailDrawer';
import CashReceiptBatchList from './CashReceiptBatchList';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import {
  cancelCashReceiptBatch,
  completeCashReceiptBatch,
  downloadRequestedCashReceiptsExcel,
  updateCashReceiptsStatusBulk,
} from './services/cashReceiptAdmin';
import type { EventListResponse } from '@/types/eventList';
import type { CashReceiptAdminStatus, CashReceiptSearchItem } from './types/cashReceiptAdmin';

type Props = {
  initialPage: number;
  pageSize: number;
};

type BatchAction = 'complete' | 'cancel';

type BatchConfirmModal = {
  type: BatchAction;
  batchId: string;
  totalCount: number;
} | null;

function getDownloadErrorMessage(error: unknown, hasPendingBatches: boolean): string {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('찾을 수 없습니다')) {
    if (hasPendingBatches) {
      return '이미 모든 현금영수증 신청 대기 내역이 영수증 처리 대기 큐에 포함되어 있습니다. 발급 완료 처리하거나, 되돌리기 후 다시 다운로드해주세요.';
    }
    return '신규 현금영수증 신청 내역이 없습니다.';
  }
  return message || '다운로드에 실패했습니다.';
}

function formatBatchCount(totalCount: number) {
  return <strong className="font-semibold text-gray-900">총 {totalCount.toLocaleString()}건</strong>;
}

function getBatchCompleteMessage(totalCount: number) {
  return (
    <>
      영수증 처리 대기 큐에 포함된 현금영수증 {formatBatchCount(totalCount)}을 모두 발급 완료 처리하시겠습니까?
    </>
  );
}

function getBatchCancelMessage(totalCount: number) {
  return (
    <>
      영수증 처리 대기 큐에 포함된 현금영수증 {formatBatchCount(totalCount)}이 다시 처리 대기 상태로 돌아갑니다.
      <br />
      되돌리시겠습니까?
    </>
  );
}

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
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = React.useState<CashReceiptAdminStatus>('COMPLETED');
  const [isBulkStatusUpdating, setIsBulkStatusUpdating] = React.useState(false);
  const [processingBatchId, setProcessingBatchId] = React.useState<string | null>(null);
  const [processingAction, setProcessingAction] = React.useState<BatchAction | null>(null);
  const [batchConfirmModal, setBatchConfirmModal] = React.useState<BatchConfirmModal>(null);
  const headCbRef = React.useRef<HTMLInputElement>(null);
  const autoOpenedFromQueryRef = React.useRef(false);

  const invalidateCashReceiptQueries = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] }),
      queryClient.invalidateQueries({ queryKey: ['cashReceiptBatches'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'cash-receipt', 'statistics'] }),
    ]);
  }, [queryClient]);

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
  const { data: batches = [], isLoading: isBatchesLoading } = useCashReceiptBatches();

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
        await invalidateCashReceiptQueries();
      } catch (e) {
        toast.error(getDownloadErrorMessage(e, batches.length > 0));
      } finally {
        setIsCashReceiptDownloading(false);
      }
    })();
  }, [isCashReceiptDownloading, invalidateCashReceiptQueries, batches.length]);

  const handleBatchComplete = React.useCallback((batchId: string, totalCount: number) => {
    setBatchConfirmModal({ type: 'complete', batchId, totalCount });
  }, []);

  const handleBatchCancel = React.useCallback((batchId: string, totalCount: number) => {
    setBatchConfirmModal({ type: 'cancel', batchId, totalCount });
  }, []);

  const handleBatchConfirm = React.useCallback(async () => {
    if (!batchConfirmModal) return;

    const { type, batchId } = batchConfirmModal;
    setProcessingBatchId(batchId);
    setProcessingAction(type);

    try {
      if (type === 'complete') {
        await completeCashReceiptBatch(batchId);
        toast.success('발급 완료 처리되었습니다.');
      } else {
        await cancelCashReceiptBatch(batchId);
        toast.success('되돌리기가 완료되었습니다.');
      }
      setBatchConfirmModal(null);
      await invalidateCashReceiptQueries();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : type === 'complete'
            ? '발급 완료 처리에 실패했습니다.'
            : '되돌리기에 실패했습니다.'
      );
    } finally {
      setProcessingBatchId(null);
      setProcessingAction(null);
    }
  }, [batchConfirmModal, invalidateCashReceiptQueries]);

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
      await invalidateCashReceiptQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setIsBulkStatusUpdating(false);
    }
  }, [selectedIds, bulkTargetStatus, invalidateCashReceiptQueries]);

  const filterBarButtons = React.useMemo(
    () => [
      { label: '검색', tone: 'dark' as const, iconOnly: true as const },
      {
        label: '다운로드',
        tone: 'primary' as const,
        iconRight: true as const,
        loading: isCashReceiptDownloading,
        onClick: () => handleCashReceiptExcelDownload(),
      },
    ],
    [isCashReceiptDownloading, handleCashReceiptExcelDownload]
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
          />
        </div>
      )}

      {batches.length > 0 && (
        <CashReceiptBatchList
          batches={batches}
          isLoading={isBatchesLoading}
          processingBatchId={processingBatchId}
          processingAction={processingAction}
          onComplete={handleBatchComplete}
          onCancel={handleBatchCancel}
        />
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
        onUpdated={() => { void invalidateCashReceiptQueries(); }}
      />

      <ConfirmModal
        isOpen={batchConfirmModal?.type === 'complete'}
        onClose={() => setBatchConfirmModal(null)}
        onConfirm={() => void handleBatchConfirm()}
        title="발급 완료 처리"
        message={
          batchConfirmModal ? getBatchCompleteMessage(batchConfirmModal.totalCount) : ''
        }
        smallMessage="토스에서 실제 발급이 완료된 후에 처리해주세요."
        confirmText="발급 완료"
        cancelText="취소"
        isLoading={processingAction === 'complete'}
      />

      <ConfirmModal
        isOpen={batchConfirmModal?.type === 'cancel'}
        onClose={() => setBatchConfirmModal(null)}
        onConfirm={() => void handleBatchConfirm()}
        title="되돌리기"
        message={
          batchConfirmModal ? getBatchCancelMessage(batchConfirmModal.totalCount) : ''
        }
        confirmText="되돌리기"
        cancelText="닫기"
        variant="danger"
        multiline
        isLoading={processingAction === 'cancel'}
      />
    </div>
  );
}
