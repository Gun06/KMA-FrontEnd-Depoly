'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';

/* ---------- Types & Storage ---------- */
export type EditRow = {
  id: number;
  url: string;
  image: UploadItem | null;
  visible: boolean;
};

type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  image: null | { name?: string; sizeMB?: number; url: string };
};

const LS_KEY = 'kma_admin_sponsors_v1';

function normalizeForStorage(rows: EditRow[]): PersistRow[] {
  return rows.map(r => {
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
function loadAll(): EditRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map(r => ({
      id: r.id,
      url: r.url ?? '',
      visible: r.visible ?? true,
      image: (r as any).image ?? null,
    }));
  } catch { return []; }
}
function saveAll(rows: EditRow[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(normalizeForStorage(rows)));
}

/* ---------- UI ---------- */
const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';

export default function SponsorEdit({ idParam }: { idParam: number }) {
  const router = useRouter();
  const [rows, setRows] = React.useState<EditRow[]>([]);
  const [row, setRow] = React.useState<EditRow | null>(null);

  React.useEffect(() => {
    const all = loadAll();
    const found = all.find(r => r.id === idParam) || null;
    setRows(all);
    setRow(found);
  }, [idParam]);

  if (!row) return <div className="p-6">존재하지 않는 항목입니다.</div>;

  const update = (patch: Partial<EditRow>) =>
    setRow(prev => ({ ...(prev as EditRow), ...patch }));

  const onSave = () => {
    const next = rows.map(r => (r.id === row.id ? row : r));
    saveAll(next);
    alert('저장되었습니다.');
    router.push('/admin/banners/sponsors');
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">스폰서 수정</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">스폰서 URL</label>
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
          onChange={(files) => update({ image: files?.[0] ?? null })}
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

      <div className="flex items-center gap-2">
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장</Button>
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.push('/admin/banners/sponsors')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
