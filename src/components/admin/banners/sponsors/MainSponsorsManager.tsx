'use client';

import React from 'react';
import Link from 'next/link';
import AdminTableShell from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import SponsorsPreview from './SponsorsPreview';

/* ---------- Types & Storage ---------- */
export type SponsorRow = {
  id: number;
  url: string;
  image: UploadItem | null;
  visible: boolean;
  draft?: boolean; // 저장 전 편집 가능
};

type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  image: null | { name?: string; sizeMB?: number; url: string };
};

const LS_KEY = 'kma_admin_sponsors_v1';

function normalizeForStorage(rows: SponsorRow[]): PersistRow[] {
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
      image: f ? { name: f.name, sizeMB: f.sizeMB, url } : null,
    };
  });
}

function loadFromStorage(): SponsorRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map((r, i) => ({
      id: r.id ?? i + 1,
      url: r.url ?? '',
      visible: r.visible ?? true,
      image: (r as any).image ?? null,
      draft: false,
    }));
  } catch {
    return [];
  }
}

function saveToStorage(rows: SponsorRow[]) {
  const payload = normalizeForStorage(rows.map(({ draft, ...rest }) => rest));
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

/* ---------- Small UI ---------- */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
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

const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';

/* ---------- Page (list + preview) ---------- */
export default function SponsorsManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<SponsorRow[]>([]);

  React.useEffect(() => {
    if (!mounted) return;
    const initial = loadFromStorage();
    setRows(
      initial.length
        ? initial
        : [{ id: 1, url: '', image: null, visible: true, draft: true }]
    );
  }, [mounted]);

  const updateRow = (id: number, patch: Partial<SponsorRow>) =>
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
        id: nextId, url: '', image: null, visible: true, draft: true,
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

  const columns: Column<SponsorRow>[] = [
    { key: 'order', header: '순서', width: 70, align: 'center', render: (_r, i) => <span className="text-[15px]">{i + 1}</span> },

    {
      key: 'url',
      header: '스폰서 URL',
      width: 480,
      align: 'left',
      render: (r) => (
        <input
          value={r.url}
          onChange={(e) => r.draft && updateRow(r.id, { url: e.target.value })}
          readOnly={!r.draft}
          placeholder="https://example.com"
          className={inputCls}
        />
      ),
    },

    {
      key: 'image',
      header: '이미지',
      width: 360,
      align: 'left',
      render: (r) => (
        <div className="flex items-center gap-3">
          <SponsorUploader
            label="이미지 선택"
            accept=".jpg,.jpeg,.png,.webp"
            maxSizeMB={20}
            value={r.image ? [r.image] : []}
            readOnly={!r.draft}
            onChange={(files) => r.draft && updateRow(r.id, { image: files?.[0] ?? null })}
            buttonClassName="h-9 px-3"
          />
        </div>
      ),
    },

    {
      key: 'visible',
      header: '공개여부',
      width: 160,
      align: 'center',
      render: (r) => r.draft
        ? <VisibilityChipsEditable value={r.visible} onChange={(v)=>updateRow(r.id,{visible:v})} />
        : <VisibilityChip value={r.visible} />,
    },

    {
      key: 'action',
      header: '액션',
      width: 320, // ⬅️ 충분히 넓혀서 1줄 고정
      align: 'center',
      render: (r, idx) => (
        <div className="flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap min-w-[300px]">
          <CircleBtn kind="up" onClick={() => move(idx, -1)} />
          <CircleBtn kind="down" onClick={() => move(idx, +1)} />
          <CircleBtn kind="plus" onClick={() => addAfter(idx)} />
          <CircleBtn kind="minus" onClick={() => removeAt(idx)} />
          {!r.draft && (
            <Link
              href={`/admin/banners/sponsors/${r.id}/edit`}
              className="shrink-0 inline-flex items-center gap-1 text-sm px-3 h-9 rounded-md border whitespace-nowrap"
              title="수정"
              aria-label="수정"
            >
              <Pencil size={14} /> 수정
            </Link>
          )}
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
          <AdminTableShell<SponsorRow>
            title=""
            className="w-full"
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            rowClassName={() => 'hover:bg-transparent'}
            stickyHeader={false}
            minWidth={1150}
            contentMinHeight="auto"
            pagination={false}
          />

          <div className="mt-8 pt-4 pb-16">
            <NoticeMessage
              items={[
                { text: '※ 저장 전 항목만 편집 가능합니다. 저장 후에는 [수정]으로 들어가 편집하세요.' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1600px 이상, 20MB 이하.' },
              ]}
            />
          </div>
        </>
      ) : (
        <SponsorsPreview
          rows={rows.map((r) => ({ visible: r.visible, url: r.url, file: r.image }))}
        />
      )}
    </div>
  );
}
