'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { MOCK_EVENTS } from '@/data/events';
import EventDropdownPortal, { Opt } from './EventDropdownPortal';

/* --------------------------------
   Types / Const
--------------------------------- */
export type EditRow = {
  id: number;
  visible: boolean;
  image: UploadItem | null;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  eventId?: number;
};

type PersistRow = {
  id: number;
  visible: boolean;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  eventId?: number;
  image: null | { name?: string; sizeMB?: number; url: string };
};

const LS_KEY = 'kma_admin_banners_main_v1';
const softInput =
  'bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none focus:outline-none ring-0 focus:ring-0 ' +
  'transition-colors shadow-none';

/* ----------- blob → data: 유틸 ----------- */
async function toPersistentUrl(maybeUrl?: string): Promise<string> {
  if (!maybeUrl) return '';
  if (/^(https?:|data:)/i.test(maybeUrl)) return maybeUrl;
  if (maybeUrl.startsWith('blob:')) {
    try {
      const res = await fetch(maybeUrl);
      const blob = await res.blob();
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      return dataUrl;
    } catch { return ''; }
  }
  return maybeUrl;
}

/* --------------------------------
   Storage helpers (목록과 동일 포맷)
--------------------------------- */
function normalizeForStorage(rows: EditRow[]): PersistRow[] {
  return rows.map(r => {
    const f: any = r.image;
    const url = f?.url || f?.previewUrl || '';
    return {
      id: r.id,
      visible: !!r.visible,
      badge: r.badge ?? '',
      title: r.title ?? '',
      subtitle: r.subtitle ?? '',
      date: r.date ?? '',
      eventId: r.eventId ?? undefined,
      image: f ? { name: f.name, sizeMB: f.sizeMB, url } : null,
    };
  });
}
function loadRows(): EditRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map(r => ({
      id: r.id, visible: r.visible, image: (r as any).image ?? null,
      badge: r.badge, title: r.title, subtitle: r.subtitle, date: r.date, eventId: r.eventId,
    }));
  } catch { return []; }
}
function saveRows(rows: EditRow[]) {
  const payload = normalizeForStorage(rows);
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

/* --------------------------------
   IME-safe input
--------------------------------- */
function CellInput({
  value, onCommit, placeholder, className,
}: {
  value?: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = React.useState(value ?? '');
  const [composing, setComposing] = React.useState(false);
  React.useEffect(() => setText(value ?? ''), [value]);

  return (
    <input
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={(e) => { setComposing(false); setText(e.currentTarget.value); }}
      onBlur={() => onCommit(text)}
      onKeyDown={(e) => { if (e.key === 'Enter' && !composing) e.currentTarget.blur(); }}
      className={clsx('w-full h-10 px-3 rounded-md', softInput, className)}
    />
  );
}

/* --------------------------------
   Page
--------------------------------- */
export default function MainBannerEdit({ idParam }: { idParam: number }) {
  const router = useRouter();
  const [rows, setRows] = React.useState<EditRow[]>([]);
  const [row, setRow] = React.useState<EditRow | null>(null);

  React.useEffect(() => {
    const all = loadRows();
    if (idParam === 0) {
      const nextId = Math.max(0, ...all.map(r => r.id || 0)) + 1;
      const draft: EditRow = {
        id: nextId, visible: true, image: null, badge: '대회 안내', title: '', subtitle: '', date: '', eventId: undefined,
      };
      setRows([...all, draft]);
      setRow(draft);
    } else {
      const found = all.find(r => r.id === idParam) || null;
      setRows(all);
      setRow(found);
    }
  }, [idParam]);

  const eventOpts: Opt[] = React.useMemo(
    () => MOCK_EVENTS.map(e => ({ key: e.id, label: e.title })), []
  );

  if (!row) return <div className="p-6">존재하지 않는 배너입니다.</div>;

  const update = (patch: Partial<EditRow>) =>
    setRow(prev => ({ ...(prev as EditRow), ...patch }));

  const onSave = async () => {
    // 현재 row의 이미지 URL을 영구화
    const f: any = row?.image;
    let url = '';
    if (f?.url) url = await toPersistentUrl(f.url);
    else if (f?.previewUrl) url = await toPersistentUrl(f.previewUrl);
    const image = f ? { ...f, url, previewUrl: url } : null;

    const normalizedRow: EditRow = { ...(row as EditRow), image };

    const next = rows.some(r => r.id === normalizedRow.id)
      ? rows.map(r => (r.id === normalizedRow.id ? normalizedRow : r))
      : [...rows, normalizedRow];

    saveRows(next);
    alert('저장되었습니다.');
    router.push('/admin/banners/main');
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">메인 배너 수정</h1>

      {/* 이미지 업로드 */}
      <div className="mb-4">
        <SponsorUploader
          label="이미지 선택"
          accept=".jpg,.jpeg,.png,.webp"
          maxSizeMB={20}
          value={row.image ? [row.image] : []}
          onChange={(files) => update({ image: files?.[0] ?? null })}
          buttonClassName="h-9 px-3"
        />
      </div>

      {/* 폼 */}
      <div className="grid grid-cols-2 gap-2">
        <CellInput value={row.badge}    onCommit={(v) => update({ badge: v })}    placeholder="배지(예: 대회 안내)" className="h-10" />
        <CellInput value={row.date}     onCommit={(v) => update({ date: v })}     placeholder="대회 날짜(예: 2025.11.03)" className="h-10" />
        <CellInput value={row.title}    onCommit={(v) => update({ title: v })}    placeholder="큰 제목(예: 2025 전주 남강 마라톤)" className="col-span-2 h-11 text-[15px]" />
        <CellInput value={row.subtitle} onCommit={(v) => update({ subtitle: v })} placeholder="부제(선택)" className="col-span-2 h-10" />
      </div>

      {/* 대회 선택 */}
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">대회 선택</label>
        <EventDropdownPortal
          value={row.eventId}
          onChange={(v) => update({ eventId: v })}
          options={eventOpts}
          placeholder="대회를 선택해주세요"
        />
        {row.eventId && <p className="mt-1 text-xs text-gray-500">버튼 경로는 자동으로 생성됩니다.</p>}
      </div>

      {/* 공개/비공개 */}
      <div className="mt-4">
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

      <div className="mt-6 flex items-center gap-2">
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장</Button>
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.push('/admin/banners/main')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
