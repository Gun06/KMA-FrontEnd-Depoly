'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import AdminBannerTableShell from '@/components/admin/Table/AdminBannerTableShell';
import type { Column } from '@/components/admin/Table/BannerTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import MainBannersPreview, { MainBannerRow } from './MainBannersPreview';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import EventDropdownPortal, { Opt } from './EventDropdownPortal';
import { getSimpleEventList } from '@/services/event';
import { useMainBannersForAdmin, useCreateOrUpdateMainBanners } from '@/hooks/useMainBanners';
import type { MainBannerResponse, MainBannerBatchRequest, MainBannerInfo } from '@/types/mainBanner';

/* ------------ utils ------------ */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
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
const _LS_KEY = 'kma_admin_banners_main_v1';

type PersistRow = {
  id: number;
  visible: boolean;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  eventId?: string;
  image: null | { name?: string; sizeMB?: number; url: string };
};

function _normalizeForStorage(rows: Array<MainBannerRow & { image: unknown }>): PersistRow[] {
  return rows.map(r => {
    const f = r.image as { url?: string; previewUrl?: string; name?: string; sizeMB?: number } | null;
    // http/https, data:, blob: 모두 허용(여기까지 오면 blob은 이미 data:로 바뀜)
    const url = f?.url || f?.previewUrl || '';
    return {
      id: typeof r.id === 'string' ? parseInt(r.id) : r.id,
      visible: r.visible,
      badge: r.badge,
      title: r.title,
      subtitle: r.subtitle,
      date: r.date,
      eventId: r.eventId,
      image: f ? {
        name: f.name,
        sizeMB: f.sizeMB,
        url: url
      } : null,
    };
  });
}

function convertLocalToApi(rows: RowWithDraft[]): { mainBannerInfos: MainBannerInfo[], images: File[] } {
  const mainBannerInfos: MainBannerInfo[] = [];
  const images: File[] = [];
  
  rows.forEach((row, index) => {
    // eventId 검증 및 변환
    if (!row.eventId || row.eventId === undefined) {
      return; // eventId가 없으면 해당 행을 건너뜀
    }
    
    if (row.draft) {
      // 새로 생성되는 배너 (ID를 null로 설정)
      mainBannerInfos.push({
        id: null, // 새로 생성되는 배너는 id를 null로 설정
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        eventId: row.eventId,
        orderNo: index + 1,
      });
      
      // 새로 생성되는 배너의 이미지 파일 추가 (크기가 0보다 큰 경우만)
      if (row.image && 'file' in row.image && row.image.file instanceof File && row.image.file.size > 0) {
        images.push(row.image.file);
      }
    } else {
      // 기존 배너 수정 (UUID 사용)
      mainBannerInfos.push({
        id: typeof row.id === 'string' ? row.id : row.uuid || row.id.toString(), // UUID 우선 사용
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        eventId: row.eventId,
        orderNo: index + 1,
      });
      
      // 기존 배너는 이미지 전송하지 않음 (스폰서와 동일한 방식)
    }
  });
  
  return { mainBannerInfos, images };
}

/* ------------ types ------------ */
type RowWithDraft = MainBannerRow & { draft?: boolean };

// API 응답을 로컬 상태로 변환하는 함수
function convertApiToLocal(apiBanners: MainBannerResponse[]): RowWithDraft[] {
  return apiBanners.map(banner => ({
    id: banner.id,
    visible: true,
    image: banner.imageUrl ? {
      id: banner.id,
      file: new File([], 'image.jpg'),
      name: banner.imageUrl.split('/').pop() || 'image.jpg',
      size: 1000000,
      sizeMB: 1,
      tooLarge: false,
      url: banner.imageUrl,
      previewUrl: banner.imageUrl
    } as UploadItem : null,
    badge: '대회 안내',
    title: banner.title,
    subtitle: banner.subTitle,
    date: banner.date,
    eventId: banner.eventId,
    draft: false,
  }));
}


/* ------------ page ------------ */
export default function MainBannerManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<RowWithDraft[]>([]);
  const [eventOptions, setEventOptions] = React.useState<Opt[]>([]);

  // API 훅들
  const { data: apiMainBanners } = useMainBannersForAdmin();
  const createOrUpdateMutation = useCreateOrUpdateMainBanners();

  // 초기 데이터 로드
  React.useEffect(() => {
    if (!mounted) return;
    
    if (apiMainBanners && apiMainBanners.length > 0) {
      const convertedData = convertApiToLocal(apiMainBanners);
      setRows(convertedData);
    } else if (!apiMainBanners) {
      // API 데이터가 없을 때 기본 빈 행 생성
      setRows([{
        id: Date.now(), 
        visible: true, 
        image: null, 
        badge: '대회 안내', 
        title: '', 
        subtitle: '', 
        date: '', 
        eventId: '', 
        draft: true,
      }]);
    }
  }, [apiMainBanners, mounted]);

  // 대회 목록 로드
  React.useEffect(() => {
    if (!mounted) return;
    
    const loadEventOptions = async () => {
      try {
        const eventsData = await getSimpleEventList();
        const eventOpts: Opt[] = eventsData.map(event => ({
          key: event.id,
          label: event.title
        }));
        setEventOptions(eventOpts);
      } catch (_error) {
        setEventOptions([]);
      }
    };
    
    loadEventOptions();
  }, [mounted]);


  const updateRow = (id: string | number, patch: Partial<RowWithDraft>) =>
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
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: Date.now(), visible: true, image: null, badge: '대회 안내', title: '', subtitle: '', date: '', eventId: undefined, draft: true,
      });
      return next;
    });

  const removeAt = (idx: number) => {
    setRows(prev => {
      const newRows = prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx);
      return newRows;
    });
  };

  // 새 배너 추가 함수

  const handleAddEventBanner = () => {
    setRows(prev => [...prev, {
      id: Date.now(), 
      visible: true, 
      image: null, 
      badge: '대회 안내', 
      title: '', 
      subtitle: '', 
      date: '', 
      eventId: undefined, 
      draft: true,
    }]);
  };

  const handleSave = async () => {
    try {
      // 필수 필드 검증
      const invalidRows = rows.filter(row => 
        !row.title.trim() || 
        !row.subtitle.trim() || 
        !row.date.trim() || 
        !row.eventId ||
        !row.image
      );
      
      if (invalidRows.length > 0) {
        alert('모든 필드를 입력해주세요. (제목, 부제목, 날짜, 대회 선택, 이미지)');
        return;
      }
      
      // 날짜 형식 검증 (YYYY.MM.DD 형식) - 새로 입력한 항목만 검증
      const invalidDates = rows.filter(row => {
        // draft 상태인 항목(새로 입력한 항목)만 검증
        if (!row.draft) return false;
        
        const trimmedDate = row.date.trim();
        const dateRegex = /^\d{4}\.\d{1,2}\.\d{1,2}$/;
        return !dateRegex.test(trimmedDate);
      });
      
      if (invalidDates.length > 0) {
        alert('날짜는 YYYY.MM.DD 형식으로 입력해주세요. (예: 2025.01.01)');
        return;
      }
      
      // eventId 타입 검증
      const invalidEventIds = rows.filter(row => 
        !row.eventId || 
        row.eventId.trim() === ''
      );
      
      if (invalidEventIds.length > 0) {
        alert('유효한 대회를 선택해주세요.');
        return;
      }
      
      // 로컬 데이터를 API 형식으로 변환
      const { mainBannerInfos, images } = convertLocalToApi(rows);
      
      // 변환된 데이터가 비어있는지 확인
      if (mainBannerInfos.length === 0) {
        alert('저장할 배너 데이터가 없습니다.');
        return;
      }
      
      // 서비스에서 빈 배열일 때 더미 파일을 자동으로 추가함
      
      // 삭제할 배너 ID 추출 (스폰서와 동일한 방식)
      const deletedIds = apiMainBanners
        ?.filter(apiBanner => !rows.some(r => r.id === apiBanner.id))
        .map(banner => banner.id) || [];
      
      // API 요청 데이터 구성 (스폰서와 동일한 구조)
      const requestData: MainBannerBatchRequest = {
        mainBannerInfos,
        deleteMainBannerIds: deletedIds, // 빈 배열일 때도 빈 배열 전달
      };
      
      // 요청 데이터는 개발자 도구에서 확인 가능
      
        // API 호출
        await createOrUpdateMutation.mutateAsync({
          mainBannerBatchRequest: requestData,
          images
        });
      
      // React Query가 자동으로 데이터를 새로고침함
      // 저장 후 로컬 상태도 즉시 업데이트 (draft 상태 제거)
      const updatedRows = rows.map(row => ({
        ...row,
        draft: false
      }));
      setRows(updatedRows);
      
      alert('저장되었습니다.');
      // 저장 후 즉시 미리보기로 전환하지 않고 관리 모드 유지
      // setMode('preview');
    } catch (_err) {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (!mounted) return null;

  // 로딩 상태 처리
  if (false) {
    return (
      <div className="mx-auto max-w-[1300px] px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">메인 배너를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (false) {
    return (
      <div className="mx-auto max-w-[1300px] px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">에러가 발생했습니다</div>
            <div className="text-sm text-gray-400">기본 데이터를 사용합니다.</div>
          </div>
        </div>
      </div>
    );
  }

  const PH = {
    badge: '대회 안내',
    badgeAssociation: 'RENEWAL 또는 협회 소개 배지',
    date: '대회 날짜(예: 2025.11.03)',
    title: '큰 제목(예: 2025 전주 남강 마라톤)',
    titleAssociation: '협회 소개 제목(예: 회원 수 3만명 달성!)',
    subtitle: '부제(선택)',
    subtitleAssociation: '협회 소개 부제(예: 누적된 발걸음이...)',
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
                <CircleBtn kind="minus" onClick={() => {
                  if (rows.length <= 1) {
                    return;
                  }
                  removeAt(idx);
                }} />
                {!r.draft && (
                  <Link
                    href={`/admin/banners/main/${r.uuid || r.id}/edit`}
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
              {/* 대회안내배너만 표시 */}
              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-gray-600">
                {r.badge}
              </div>
              
              <CellInput value={r.date}     onCommit={(v)=>updateRow(r.id,{date:v})}     placeholder={PH.date}     readOnly={!r.draft} className="h-10" />
              
              <CellInput 
                value={r.title}    
                onCommit={(v)=>updateRow(r.id,{title:v})}    
                placeholder={PH.title}    
                readOnly={!r.draft} 
                className="col-span-2 h-11 text-[15px]" 
              />
              <CellInput 
                value={r.subtitle} 
                onCommit={(v)=>updateRow(r.id,{subtitle:v})} 
                placeholder={PH.subtitle} 
                readOnly={!r.draft} 
                className="col-span-2 h-10" 
              />

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

  const rowsForPreview: MainBannerRow[] = rows.map((row) => {
    const { draft: _, ...rest } = row;
    return rest;
  });

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
          <div className="flex gap-2">
            <Button size="sm" tone="neutral" widthType="pager" onClick={handleAddEventBanner}>
              배너 추가
            </Button>
            <Button 
              size="sm" 
              tone="primary" 
              widthType="pager" 
              onClick={handleSave}
              disabled={createOrUpdateMutation.isPending}
            >
              {createOrUpdateMutation.isPending ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        ) : <div />}
      </div>

      {mode === 'manage' ? (
        <AdminBannerTableShell<RowWithDraft>
          title=""
          className="w-full"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          rowClassName={(r) => {
            if (r.badge === 'RENEWAL') {
              return 'bg-blue-50/30 border-l-4 border-blue-200';
            }
            return 'hover:bg-transparent';
          }}
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
            { text: '⚠️ 개별 수정 후 목록으로 돌아온 경우, 이미 저장되어 있으니 목록에서 또 저장버튼 누르지 마세요. (이미지 오류 발생 가능)' },
          ]}
        />
      </div>
    </div>
  );
}
