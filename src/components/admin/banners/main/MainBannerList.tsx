'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import AdminTableShell from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import MainBannersPreview, { MainBannerRow } from './MainBannersPreview';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import EventDropdownPortal, { Opt } from './EventDropdownPortal';
import { MOCK_EVENTS } from '@/data/events';

/* ------------ utils ------------ */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

// blob: → data: 로 영구화
async function toPersistentUrl(maybeUrl?: string): Promise<string> {
  if (!maybeUrl) return '';
  if (/^(https?:|data:)/i.test(maybeUrl)) return maybeUrl; // 이미 영구 URL이면 그대로
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
    } catch {
      return '';
    }
  }
  return maybeUrl;
}

/* ------------ tiny UI ------------ */
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

/* ------------ shared styles ------------ */
const softInput =
  'bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none focus:outline-none ring-0 focus:ring-0 ' +
  'transition-colors shadow-none';

/* ------------ IME-safe 인풋 ------------ */
function CellInput({
  value, onCommit, placeholder, readOnly, className,
}: {
  value?: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  const [text, setText] = React.useState(value ?? '');
  const [composing, setComposing] = React.useState(false);

  React.useEffect(() => { if (readOnly) setText(value ?? ''); }, [readOnly, value]);

  if (readOnly) {
    return (
      <input
        readOnly
        value={text}
        placeholder={placeholder}
        className={clsx('w-full h-10 px-3 rounded-md', softInput, className)}
      />
    );
  }

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

/* ------------ storage ------------ */
const LS_KEY = 'kma_admin_banners_main_v1';
type RowWithDraft = MainBannerRow & { draft?: boolean };

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

function normalizeForStorage(rows: Array<MainBannerRow & { image:any }>): PersistRow[] {
  return rows.map(r => {
    const f: any = r.image;
    // http/https, data:, blob: 모두 허용(여기까지 오면 blob은 이미 data:로 바뀜)
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
function loadFromStorage(): PersistRow[] {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function loadInitial(): RowWithDraft[] {
  const arr = loadFromStorage();
  return arr.map((r, i) => ({
    id: r.id ?? i + 1,
    visible: r.visible ?? true,
    image: (r as any).image ?? null,
    badge: r.badge ?? '대회 안내',
    title: r.title ?? '',
    subtitle: r.subtitle ?? '',
    date: r.date ?? '',
    eventId: r.eventId ?? undefined,
    draft: false,
  }));
}
function save(rows: RowWithDraft[]) {
  const withoutDraft = rows.map(({ draft, ...rest }) => rest);
  const payload = normalizeForStorage(withoutDraft as any);
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

/* ------------ page ------------ */
export default function MainBannerManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<RowWithDraft[]>([]);

  React.useEffect(() => {
    if (!mounted) return;
    const initial = loadInitial();
    setRows(initial.length ? initial : [{
      id: 1, visible: true, image: null, badge: '대회 안내', title: '', subtitle: '', date: '', eventId: undefined, draft: true,
    }]);
  }, [mounted]);

  const updateRow = (id: number, patch: Partial<RowWithDraft>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const move = (idx: number, dir: -1 | 1) =>
    setRows(prev => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const addAfter = (idx: number) =>
    setRows(prev => {
      const nextId = Math.max(0, ...prev.map(r => r.id)) + 1;
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: nextId, visible: true, image: null, badge: '대회 안내', title: '', subtitle: '', date: '', eventId: undefined, draft: true,
      });
      return next;
    });

  const removeAt = (idx: number) =>
    setRows(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const handleSave = async () => {
    // draft 해제 + 이미지 URL 영구화
    const frozen = await Promise.all(rows.map(async (r) => {
      const f: any = r.image;
      let url = '';
      if (f?.url) url = await toPersistentUrl(f.url);
      else if (f?.previewUrl) url = await toPersistentUrl(f.previewUrl);
      const image = f ? { ...f, url, previewUrl: url } : null;
      return { ...r, image, draft: false } as RowWithDraft;
    }));

    save(frozen);
    setRows(frozen);
    alert('저장되었습니다.');
    setMode('preview');
  };

  if (!mounted) return null;

  const PH = {
    badge: '대회 안내',
    date: '대회 날짜(예: 2025.11.03)',
    title: '큰 제목(예: 2025 전주 남강 마라톤)',
    subtitle: '부제(선택)',
    event: '대회를 선택해주세요',
  };

  const columns: Column<RowWithDraft>[] = [
    { key: 'order', header: '순서', width: 70, align: 'center',
      render: (_r, i) => <span className="text-[15px]">{i + 1}</span>
    },
    {
      key: 'image',
      header: '이미지',
      width: 320,
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
            emptyText="이미지 없음"
          />
        </div>
      ),
    },
    {
      key: 'editor',
      header: '설정',
      align: 'left',
      render: (r, idx) => {
        const eventOptions: Opt[] = MOCK_EVENTS.map(ev => ({ key: ev.id, label: ev.title }));

        return (
          <div className="w-full">
            {/* 상단바 */}
            <div className="mb-2 flex items-center justify-between">
              <div>
                {r.draft
                  ? <VisibilityChipsEditable value={r.visible} onChange={(v)=>updateRow(r.id,{visible:v})} />
                  : <VisibilityChip value={r.visible} />
                }
              </div>
              <div className="flex items-center gap-2">
                <CircleBtn kind="up" onClick={() => move(idx, -1)} />
                <CircleBtn kind="down" onClick={() => move(idx, +1)} />
                <CircleBtn kind="plus" onClick={() => addAfter(idx)} />
                <CircleBtn kind="minus" onClick={() => removeAt(idx)} />
                {!r.draft && (
                  <Link
                    href={`/admin/banners/main/${r.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm px-3 h-9 rounded-md border"
                    title="수정"
                  >
                    <Pencil size={14} /> 수정
                  </Link>
                )}
              </div>
            </div>

            {/* 본문 */}
            <div className="grid grid-cols-2 gap-2">
              <CellInput value={r.badge}    onCommit={(v)=>updateRow(r.id,{badge:v})}    placeholder={PH.badge}    readOnly={!r.draft} className="h-10" />
              <CellInput value={r.date}     onCommit={(v)=>updateRow(r.id,{date:v})}     placeholder={PH.date}     readOnly={!r.draft} className="h-10" />
              <CellInput value={r.title}    onCommit={(v)=>updateRow(r.id,{title:v})}    placeholder={PH.title}    readOnly={!r.draft} className="col-span-2 h-11 text-[15px]" />
              <CellInput value={r.subtitle} onCommit={(v)=>updateRow(r.id,{subtitle:v})} placeholder={PH.subtitle} readOnly={!r.draft} className="col-span-2 h-10" />

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">대회 선택</label>
                <EventDropdownPortal
                  value={r.eventId}
                  onChange={(id) => r.draft && updateRow(r.id, { eventId: id })}
                  options={eventOptions}
                  placeholder={PH.event}
                  readOnly={!r.draft}
                />
                {r.draft && r.eventId && (
                  <p className="mt-1 text-xs text-gray-500">버튼 경로는 자동으로 생성됩니다.</p>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const rowsForPreview: MainBannerRow[] = rows.map(({ draft, ...rest }) => rest);

  return (
    <div className="mx-auto max-w-[1300px] px-4">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border bg-white p-1 inline-flex gap-1">
          <button type="button" onClick={() => setMode('manage')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'manage' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}>
            관리
          </button>
          <button type="button" onClick={() => setMode('preview')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'preview' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}>
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
        <AdminTableShell<RowWithDraft>
          title=""
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
      ) : (
        <MainBannersPreview rows={rowsForPreview} />
      )}

      <div className="mt-8 pt-4 pb-16">
        <NoticeMessage
          items={[
            { text: '※ 목록에서는 새로 추가한 항목만 편집 가능합니다.' },
            { text: '※ 저장 후 목록은 보기 전용으로 잠깁니다. 개별 수정은 [수정]으로 이동하세요.' },
            { text: '※ 이미지는 JPG/PNG 권장, 가로 1600px 이상, 20MB 이하.' },
          ]}
        />
      </div>
    </div>
  );
}
