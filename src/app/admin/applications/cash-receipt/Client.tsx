'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Column } from '@/components/common/Table/BaseTable';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import { useEventList } from '@/hooks/useNotices';
import { useCashReceiptSearch } from './hooks/useCashReceiptAdmin';
import CashReceiptDetailDrawer from './CashReceiptDetailDrawer';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import { updateCashReceipt } from './services/cashReceiptAdmin';
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

export default function Client({ initialPage, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState<number>(initialPage);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isInlineEditing, setIsInlineEditing] = React.useState(false);
  const [isSavingInline, setIsSavingInline] = React.useState(false);
  const [editedStatusMap, setEditedStatusMap] = React.useState<Record<string, CashReceiptAdminStatus>>({});
  const [originalStatusMap, setOriginalStatusMap] = React.useState<Record<string, CashReceiptAdminStatus>>({});
  const [eventId, setEventId] = React.useState<string>(sp.get('eventId') ?? 'ALL');
  const [status, setStatus] = React.useState<CashReceiptAdminStatus | ''>((sp.get('status') as CashReceiptAdminStatus | '') ?? '');
  const [keyword, setKeyword] = React.useState<string>(sp.get('q') ?? '');

  React.useEffect(() => {
    const qs = new URLSearchParams();
    if (page !== 1) qs.set('page', String(page));
    if (eventId !== 'ALL') qs.set('eventId', eventId);
    if (status) qs.set('status', status);
    if (keyword.trim()) qs.set('q', keyword.trim());
    router.replace(qs.toString() ? `${pathname}?${qs.toString()}` : pathname);
  }, [router, pathname, page, eventId, status, keyword]);

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

  const columns: Column<CashReceiptSearchItem>[] = [
    { key: 'no', header: '번호', width: 90, align: 'center' },
    { key: 'eventName', header: '대회명', align: 'left', headerAlign: 'center', className: 'text-left' },
    { key: 'requesterName', header: '신청자명', width: 230, align: 'center' },
    {
      key: 'status',
      header: '처리상태',
      width: 140,
      align: 'center',
      render: (row) => (
        isInlineEditing ? (
          <div data-stop-bubble="true" className="flex justify-center">
            <SearchableSelect
              value={editedStatusMap[row.id] ?? row.status}
              options={[
                { value: 'REQUESTED', label: '처리 대기' },
                { value: 'COMPLETED', label: '발급 완료' },
                { value: 'CANCELED', label: '발급 취소' },
              ]}
              onChange={(v) => {
                setEditedStatusMap((prev) => ({ ...prev, [row.id]: v as CashReceiptAdminStatus }));
              }}
              className="w-[120px]"
            />
          </div>
        ) : (
          <span className={`font-semibold ${STATUS_CLASS[row.status] ?? 'text-gray-700'}`}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
        )
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
  ];

  const rows = React.useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;

  const enterInlineEdit = React.useCallback(() => {
    const map = Object.fromEntries(rows.map((r) => [r.id, r.status])) as Record<string, CashReceiptAdminStatus>;
    setOriginalStatusMap(map);
    setEditedStatusMap(map);
    setIsInlineEditing(true);
  }, [rows]);

  const cancelInlineEdit = React.useCallback(() => {
    setIsInlineEditing(false);
    setEditedStatusMap({});
    setOriginalStatusMap({});
  }, []);

  const saveInlineEdit = React.useCallback(async () => {
    const changed = rows.filter((r) => editedStatusMap[r.id] && editedStatusMap[r.id] !== originalStatusMap[r.id]);
    if (changed.length === 0) {
      setIsInlineEditing(false);
      return;
    }

    setIsSavingInline(true);
    try {
      await Promise.all(
        changed.map((r) =>
          updateCashReceipt(r.id, {
            updateStatus: editedStatusMap[r.id],
            adminAnswer: '',
          })
        )
      );
      await queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] });
      cancelInlineEdit();
    } finally {
      setIsSavingInline(false);
    }
  }, [rows, editedStatusMap, originalStatusMap, queryClient, cancelInlineEdit]);

  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-semibold">현금영수증 관리</h3>

      {preset && (
        <FilterBar
          {...{
            ...preset,
            buttons: [{ label: '검색', tone: 'dark', iconOnly: true }],
          }}
          className="!gap-2"
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
          onActionClick={() => {}}
          renderAfterReset={
            !isInlineEditing ? (
              <button
                className="rounded-md bg-blue-600 px-4 h-10 text-sm text-white hover:bg-blue-700"
                onClick={enterInlineEdit}
              >
                수정하기
              </button>
            ) : (
              <>
                <button
                  className="rounded-md bg-blue-600 px-4 h-10 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => void saveInlineEdit()}
                  disabled={isSavingInline}
                >
                  {isSavingInline ? '저장 중...' : '저장'}
                </button>
                <button
                  className="rounded-md border px-4 h-10 text-sm hover:bg-gray-50"
                  onClick={cancelInlineEdit}
                >
                  취소
                </button>
              </>
            )
          }
        />
      )}

      <AdminTable<CashReceiptSearchItem>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        pagination={{ page, pageSize, total, onChange: setPage, align: 'center' }}
        minWidth={1200}
        loadingMessage={isLoading ? '현금영수증 목록을 불러오는 중입니다.' : undefined}
        emptyMessage={
          !isLoading && rows.length === 0 
            ? '검색 결과가 없습니다\n다른 조건으로 다시 검색해보세요' 
            : undefined
        }
        onRowClick={(row) => {
          if (isInlineEditing) return;
          setSelectedId(row.id);
          setDrawerOpen(true);
        }}
      />

      <CashReceiptDetailDrawer
        open={drawerOpen}
        cashReceiptId={selectedId}
        onClose={() => { setDrawerOpen(false); setSelectedId(null); }}
        onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['cashReceiptSearch'] }); }}
      />
    </div>
  );
}
