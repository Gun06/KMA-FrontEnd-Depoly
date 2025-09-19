'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { POPUP_LS_KEY, type PopupRow } from './PopupListManager';

/* ---------- Storage ---------- */
type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
  image: null | { name?: string; sizeMB?: number; url: string };
};

function readAll(): PersistRow[] {
  try { return JSON.parse(localStorage.getItem(POPUP_LS_KEY) || '[]'); }
  catch { return []; }
}
function writeAll(rows: PersistRow[]) {
  localStorage.setItem(POPUP_LS_KEY, JSON.stringify(rows));
}
function toPersist(r: PopupRow): PersistRow {
  const f: any = r.image;
  const url = typeof f?.url === 'string' && /^https?:\/\//i.test(f.url) ? f.url : (f?.previewUrl || '');
  return {
    id: r.id,
    url: (r.url || '').trim(),
    visible: !!r.visible,
    device: r.device ?? 'all',
    startAt: r.startAt || undefined,
    endAt: r.endAt || undefined,
    image: f ? { name: f.name, sizeMB: f.sizeMB, url } : null,
  };
}
function fromPersist(r: PersistRow): PopupRow {
  return {
    id: r.id,
    url: r.url ?? '',
    visible: r.visible ?? true,
    device: r.device ?? 'all',
    startAt: r.startAt,
    endAt: r.endAt,
    image: (r as any).image ?? null,
    draft: false,
  };
}

/* ---------- UI ---------- */
const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';
const smallInputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 text-sm transition-colors shadow-none';

export default function PopupEditForm({ id }: { id: number }) {
  const router = useRouter();
  const [row, setRow] = React.useState<PopupRow | null>(null);

  React.useEffect(() => {
    const all = readAll();
    const found = all.find(r => r.id === id);
    setRow(found ? fromPersist(found) : null);
  }, [id]);

  if (!row) {
    return <div className="mx-auto max-w-[900px] px-4 py-6 text-sm text-red-600">존재하지 않는 항목입니다. (id: {id})</div>;
  }

  const update = (patch: Partial<PopupRow>) =>
    setRow(prev => ({ ...(prev as PopupRow), ...patch }));

  const onSave = () => {
    const all = readAll();
    const idx = all.findIndex(r => r.id === row.id);
    const next = toPersist({ ...row, draft: false });
    if (idx >= 0) all[idx] = next; else all.push(next);
    writeAll(all);
    alert('저장되었습니다.');
    router.push('/admin/banners/popups');
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">팝업 수정</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">링크 URL</label>
        <input
          value={row.url}
          onChange={(e)=>update({ url: e.target.value })}
          placeholder="https://example.com"
          className={inputCls}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">이미지</label>
        <SponsorUploader
          label="이미지 선택"
          accept=".jpg,.jpeg,.png,.webp"
          maxSizeMB={20}
          value={row.image ? [row.image] : []}
          onChange={(files: UploadItem[] | null) => update({ image: files?.[0] ?? null })}
          buttonClassName="h-9 px-3"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">공개 여부</label>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className={clsx('rounded-full px-3 h-8 border text-sm',
              row.visible ? 'bg-[#1E5EFF] border-[#1E5EFF] text-white' : 'bg-gray-100 border-gray-200')}
            onClick={() => update({ visible: true })}
          >공개</button>
          <button
            type="button"
            className={clsx('rounded-full px-3 h-8 border text-sm',
              !row.visible ? 'bg-[#EF4444] border-[#EF4444] text-white' : 'bg-gray-100 border-gray-200')}
            onClick={() => update({ visible: false })}
          >비공개</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">디바이스</label>
          <select
            value={row.device}
            onChange={(e) => update({ device: e.target.value as PopupRow['device'] })}
            className="h-10 px-3 rounded-md border border-slate-200 text-sm"
          >
            <option value="all">전체</option>
            <option value="pc">PC</option>
            <option value="mobile">모바일</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">시작일시</label>
          <input
            type="datetime-local"
            value={row.startAt || ''}
            onChange={(e) => update({ startAt: e.target.value })}
            className={smallInputCls}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">종료일시</label>
          <input
            type="datetime-local"
            value={row.endAt || ''}
            onChange={(e) => update({ endAt: e.target.value })}
            className={smallInputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장</Button>
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.push('/admin/banners/popups')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
