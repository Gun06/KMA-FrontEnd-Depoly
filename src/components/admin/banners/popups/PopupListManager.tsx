'use client';

import React from 'react';
import Link from 'next/link';
import AdminTableShell from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import PopupPreview from './PopupPreview';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';

/* ---------- Types & Storage ---------- */
export type PopupRow = {
  id: number;
  url: string;
  image: UploadItem | null;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
  draft?: boolean;
};

type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
  image: null | { name?: string; sizeMB?: number; url: string };
};

export const POPUP_LS_KEY = 'kma_admin_popups_v1';

/* ---------- utils ---------- */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';

const smallInputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 text-sm transition-colors shadow-none';

function VisibilityChip({ value }: { value: boolean }) {
  const base = 'inline-flex items-center rounded-full px-2.5 h-7 text-[12px] font-medium border';
  return value
    ? <span className={`${base} bg-[#1E5EFF] border-[#1E5EFF] text-white`}>공개</span>
    : <span className={`${base} bg-[#EF4444] border-[#EF4444] text-white`}>비공개</span>;
}
function VisibilityChipsEditable({ value, onChange }: { value: boolean; onChange: (v:boolean)=>void }) {
  const base = 'rounded-full px-2.5 h-7 text-[12px] font-medium border';
  const onCls  = value ? `${base} bg-[#1E5EFF] border-[#1E5EFF] text-white` : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  const offCls = !value ? `${base} bg-[#EF4444] border-[#EF4444] text-white` : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" onClick={() => onChange(true)}  className={onCls}>공개</button>
      <button type="button" onClick={() => onChange(false)} className={offCls}>비공개</button>
    </div>
  );
}
function CircleBtn({ kind, onClick }: { kind: 'up'|'down'|'plus'|'minus'; onClick: () => void }) {
  const base = 'inline-flex items-center justify-center h-9 w-9 rounded-full select-none';
  const isMove = kind === 'up' || kind === 'down';
  const cls = isMove ? `${base} border border-black text-black bg-white` : `${base} border border-black text-white bg-black`;
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={kind}>
      {kind === 'up'    && <ChevronUp   size={16} strokeWidth={2.2} />}
      {kind === 'down'  && <ChevronDown size={16} strokeWidth={2.2} />}
      {kind === 'plus'  && <Plus        size={16} strokeWidth={2.2} />}
      {kind === 'minus' && <Minus       size={16} strokeWidth={2.2} />}
    </button>
  );
}

/* ---------- storage helpers ---------- */
function normalizeForStorage(rows: PopupRow[]): PersistRow[] {
  return rows.map((r) => {
    const f: any = r.image;
    const url =
      typeof f?.url === 'string' && /^https?:\/\//i.test(f.url)
        ? f.url
        : (f?.previewUrl || '');
    return {
      id: r.id,
      url: (r.url || '').trim(),
      visible: !!r.visible,
      device: r.device ?? 'all',
      startAt: r.startAt || undefined,
      endAt: r.endAt || undefined,
      image: f ? { name: f.name, sizeMB: f.sizeMB, url } : null,
    };
  });
}
function loadFromStorage(): PopupRow[] {
  try {
    const raw = localStorage.getItem(POPUP_LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map((r, i) => ({
      id: r.id ?? i + 1,
      url: r.url ?? '',
      visible: r.visible ?? true,
      device: r.device ?? 'all',
      startAt: r.startAt,
      endAt: r.endAt,
      image: (r as any).image ?? null,
      draft: false,
    }));
  } catch {
    return [];
  }
}
function saveToStorage(rows: PopupRow[]) {
  const payload = normalizeForStorage(rows.map(({ draft, ...rest }) => rest));
  localStorage.setItem(POPUP_LS_KEY, JSON.stringify(payload));
}

/* ---------- Component (List + Preview toggle) ---------- */
export default function PopupListManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<PopupRow[]>([]);

  React.useEffect(() => {
    if (!mounted) return;
    const initial = loadFromStorage();
    setRows(
      initial.length
        ? initial
        : [{
            id: 1,
            url: '',
            image: null,
            visible: true,
            device: 'all',
            startAt: '',
            endAt: '',
            draft: true,
          }]
    );
  }, [mounted]);

  const updateRow = (id: number, patch: Partial<PopupRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const move = (idx: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const addAfter = (idx: number) =>
    setRows((prev) => {
      const nextId = Math.max(0, ...prev.map((r) => r.id)) + 1;
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: nextId, url: '', image: null, visible: true, device: 'all', startAt: '', endAt: '', draft: true,
      });
      return next;
    });

  const removeAt = (idx: number) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const handleSave = () => {
    const frozen = rows.map((r) => ({ ...r, draft: false }));
    saveToStorage(frozen);
    setRows(frozen);
    alert('저장되었습니다.');
    setMode('preview');
  };

  if (!mounted) return null;

  /* ---- 배너 페이지와 동일한 3-컬럼 레이아웃 ---- */
  const columns: Column<PopupRow>[] = [
    { key: 'order', header: '순서', width: 70, align: 'center',
      render: (_r, i) => <span className="text-[15px]">{i + 1}</span>
    },

    {
      key: 'image',
      header: '이미지',
      width: 320,
      align: 'left',
      render: (r) => (
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <SponsorUploader
              label="이미지 선택"
              accept=".jpg,.jpeg,.png,.webp"
              maxSizeMB={20}
              value={r.image ? [r.image] : []}
              readOnly={!r.draft}
              onChange={(files) => r.draft && updateRow(r.id, { image: files?.[0] ?? null })}
              buttonClassName="h-9 px-3"
              emptyText="이미지 없음"
            />
          </div>
        </div>
      ),
    },

    {
      key: 'editor',
      header: '설정',
      align: 'left',
      render: (r, idx) => (
        <div className="w-full">
          {/* 상단바: 공개/액션 */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              {r.draft
                ? <VisibilityChipsEditable value={r.visible} onChange={(v)=>updateRow(r.id,{visible:v})} />
                : <VisibilityChip value={r.visible} />
              }
            </div>
            <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
              <CircleBtn kind="up" onClick={() => move(idx, -1)} />
              <CircleBtn kind="down" onClick={() => move(idx, +1)} />
              <CircleBtn kind="plus" onClick={() => addAfter(idx)} />
              <CircleBtn kind="minus" onClick={() => removeAt(idx)} />
              {!r.draft && (
                <Link
                  href={`/admin/banners/popups/${r.id}/edit`}
                  className="shrink-0 inline-flex items-center gap-1 text-sm px-3 h-9 rounded-md border whitespace-nowrap"
                  title="수정"
                >
                  <Pencil size={14} /> 수정
                </Link>
              )}
            </div>
          </div>

          {/* 본문 폼: 1줄(링크+디바이스) / 다음줄(시작/종료) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* URL + Device 한 줄 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">링크 URL</label>
              <input
                value={r.url}
                onChange={(e) => r.draft && updateRow(r.id, { url: e.target.value })}
                readOnly={!r.draft}
                placeholder="https://example.com"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">디바이스</label>
              {r.draft ? (
                <select
                  value={r.device}
                  onChange={(e) => updateRow(r.id, { device: e.target.value as PopupRow['device'] })}
                  className="h-10 px-3 rounded-md border border-slate-200 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="pc">PC</option>
                  <option value="mobile">모바일</option>
                </select>
              ) : (
                <div className="h-10 flex items-center text-sm text-gray-700">
                  {r.device === 'all' ? '전체' : r.device === 'pc' ? 'PC' : '모바일'}
                </div>
              )}
            </div>

            {/* 다음 줄: 시작/종료 */}
            <div>
              <label className="block text-sm font-medium mb-1">시작일시</label>
              <input
                type="datetime-local"
                value={r.startAt || ''}
                onChange={(e) => r.draft && updateRow(r.id, { startAt: e.target.value })}
                readOnly={!r.draft}
                className={smallInputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">종료일시</label>
              <input
                type="datetime-local"
                value={r.endAt || ''}
                onChange={(e) => r.draft && updateRow(r.id, { endAt: e.target.value })}
                readOnly={!r.draft}
                className={smallInputCls}
              />
            </div>
            <div className="hidden md:block" /> {/* 오른쪽 빈칸 정렬용 */}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-4">
      {/* 헤더: 모드 토글 + 저장 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border bg-white p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setMode('manage')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'manage' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
          >
            관리
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'preview' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
          >
            미리보기
          </button>
        </div>
        {mode === 'manage' ? (
          <Button size="sm" tone="primary" widthType="pager" onClick={handleSave}>
            저장하기
          </Button>
        ) : <div />}
      </div>

      {mode === 'manage' ? (
        <>
          <AdminTableShell<PopupRow>
            title="팝업 관리"
            className="w-full"
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            rowClassName={() => 'hover:bg-transparent'}
            stickyHeader={false}
            minWidth={1240}
            contentMinHeight="auto"
            pagination={false}
          />

          <div className="mt-8 pt-4 pb-16">
            <NoticeMessage
              items={[
                { text: '※ 저장 전 항목만 편집 가능합니다. 저장 후에는 [수정]으로 들어가 편집하세요.' },
                { text: '※ 기간을 비우면 항상 노출로 간주됩니다. (실서비스에서는 서버 검증 권장)' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1200px 이상, 20MB 이하.' },
              ]}
            />
          </div>
        </>
      ) : (
        <div className="pb-56">
          <PopupPreview rows={rows} showControls ignorePeriod/>
        </div>
      )}
    </div>
  );
}
