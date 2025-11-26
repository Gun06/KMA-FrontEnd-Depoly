'use client';

import React from 'react';
import Link from 'next/link';
import AdminBannerTableShell from '@/components/admin/Table/AdminBannerTableShell';
import type { Column } from '@/components/admin/Table/BannerTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import SponsorsPreview from './SponsorsPreview';
import { useSponsors, useCreateOrUpdateSponsors } from '@/hooks/useSponsors';
import type { SponsorResponse } from '@/types/sponsor';

/* ---------- Types & Storage ---------- */
export type SponsorRow = {
  id: string | number; // API에서는 string, 로컬에서는 number
  url: string;
  image: UploadItem | null;
  visible: boolean;
  draft?: boolean; // 저장 전 편집 가능
  orderNo: number; // 순서 번호
};

type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  image: null | { name?: string; sizeMB?: number; url: string };
};

const LS_KEY = 'kma_admin_sponsors_v1';

// normalizeForStorage 함수는 API 연동으로 인해 더 이상 사용하지 않음

function loadFromStorage(): SponsorRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map((r, i) => ({
      id: r.id ?? i + 1,
      url: r.url ?? '',
      visible: r.visible ?? true,
      image: r.image ? {
        id: String(r.id ?? i + 1),
        file: new File([], 'placeholder'),
        name: r.image.name || r.image.url.split('/').pop() || 'image',
        size: 0,
        sizeMB: r.image.sizeMB || 0,
        tooLarge: false,
        url: r.image.url,
        previewUrl: r.image.url
      } as UploadItem : null,
      draft: false,
      orderNo: i + 1
    }));
  } catch {
    return [];
  }
}

// saveToStorage 함수는 API 연동으로 인해 더 이상 사용하지 않음

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
  const [isLoading, setIsLoading] = React.useState(false);

  // API 훅들
  const { data: apiSponsors, isLoading: isApiLoading } = useSponsors();
  const createOrUpdateMutation = useCreateOrUpdateSponsors();

  // API 데이터를 로컬 상태로 변환
  React.useEffect(() => {
    if (!mounted) return;
    
    if (apiSponsors && apiSponsors.length > 0) {
      // 디버깅용: API 응답 확인
      
      // API에서 받은 데이터를 orderNo로 정렬 (백엔드에서 정렬되지 않은 경우를 대비)
      const sortedSponsors = [...apiSponsors].sort((a, b) => Number(a.orderNo) - Number(b.orderNo));
      
      const convertedRows: SponsorRow[] = sortedSponsors
        .map((sponsor: SponsorResponse) => ({
          id: sponsor.id,
          url: sponsor.url,
          image: sponsor.imageUrl ? {
            url: sponsor.imageUrl,
            previewUrl: sponsor.imageUrl,
            name: `sponsor-${sponsor.id}`,
            sizeMB: 0
          } as unknown as UploadItem : null,
          visible: sponsor.visible,
          orderNo: sponsor.orderNo,
          draft: false
        }));

      setRows(convertedRows);
    } else {
      // API 데이터가 없거나 빈 배열일 때 로컬 스토리지에서 로드
      const initial = loadFromStorage();
      setRows(
        initial.length
          ? initial
          : [{ id: `temp_${Date.now()}`, url: '', image: null, visible: true, draft: true, orderNo: 1 }]
      );
    }
  }, [mounted, apiSponsors]);

  const updateRow = (id: string | number, patch: Partial<SponsorRow>) =>
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
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: `temp_${Date.now()}`, url: '', image: null, visible: true, draft: true, orderNo: idx + 2,
      });
      return next;
    });

  const removeAt = (idx: number) =>
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });

  const handleAdd = () => {
    setRows(prev => {
      const newRow = {
        id: `temp_${Date.now()}`, url: '', image: null, visible: true, draft: true, orderNo: prev.length + 1
      };
      return [...prev, newRow];
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 요구사항에 맞춰 데이터 준비
      // 1. sponsorInfos: 저장 시점에 생성되어 있는 모든 스폰서 정보 (변경이 없더라도)
      const sponsorInfos = rows.map((r, index) => ({
        id: r.id && typeof r.id === 'string' && !r.id.startsWith('temp_') ? String(r.id) : null, // 임시 ID는 null로
        url: r.url.trim(),
        visible: r.visible,
        orderNo: index + 1 // 순서 번호 (저장 시점에 업데이트)
      }));

      // 2. deletedSponsorIds: "-" 버튼을 통해 삭제되는 스폰서들의 id
      const deletedSponsorIds = apiSponsors
        ?.filter(apiSponsor => !rows.some(r => r.id === apiSponsor.id))
        .map(sponsor => sponsor.id) || [];

      // 3. images: 새로 생성된 스폰서(임시 ID)의 개수와 일치해야 함
      const newSponsorRows = rows.filter(r => typeof r.id === 'string' && r.id.startsWith('temp_'));
      
      const images = newSponsorRows
        .filter(r => r.image && r.image.file instanceof File)
        .map(r => r.image!.file);
      
      // 백엔드에서 images 필드를 필수로 요구하므로 항상 전송 (빈 배열이라도)

      // API 호출
      const _response = await createOrUpdateMutation.mutateAsync({
        sponsorBatchRequest: {
          sponsorInfos,
          deletedSponsorIds
        },
        images: images.filter((img): img is File => img !== null)
      });

      // 성공 시 로컬 상태 업데이트 (스폰서는 BATCH_SUCCESS 응답이므로 기존 데이터 유지)
      
      // 스폰서 API는 BATCH_SUCCESS 문자열을 반환하므로, 기존 rows를 그대로 유지하되 draft 상태만 변경
      const updatedRows = rows.map(row => ({
        ...row,
        draft: false
      }));
      setRows(updatedRows);
      alert('저장되었습니다.');
      setMode('preview');
      
    } catch (_error) {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  // 로딩 상태
  if (isApiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">스폰서 데이터를 불러오는 중...</div>
      </div>
    );
  }

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
          <div className="flex gap-2">
            <Button size="sm" tone="neutral" widthType="pager" onClick={handleAdd}>
              새 스폰서 추가
            </Button>
            <Button 
              size="sm" 
              tone="primary" 
              widthType="pager" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        ) : <div />}
      </div>

      {mode === 'manage' ? (
        <>
          <AdminBannerTableShell<SponsorRow>
            title=""
            className="w-full"
            columns={columns}
            rows={rows}
            rowKey={(r, index) => r.id || `new-${index}`}
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
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1600px 이상 (비율 2:1), 20MB 이하.' },
                { text: '⚠️ 개별 수정 후 목록으로 돌아온 경우, 이미 저장되어 있으니 목록에서 또 저장버튼 누르지 마세요. (이미지 오류 발생 가능)' },
              ]}
            />
          </div>
        </>
      ) : (
        <SponsorsPreview
          rows={rows.map((r) => ({ 
            visible: r.visible, 
            url: r.image?.url || '', 
            file: r.image 
          }))}
        />
      )}
    </div>
  );
}
