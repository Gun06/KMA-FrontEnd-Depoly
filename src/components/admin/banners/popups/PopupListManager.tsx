'use client';

import React from 'react';
import Link from 'next/link';
import AdminBannerTableShell from '@/components/admin/Table/AdminBannerTableShell';
import type { Column } from '@/components/admin/Table/BannerTable';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import PopupPreview from './PopupPreview';
import Button from '@/components/common/Button/Button';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import { useGetQuery, useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import type { PopupItem, PopupBatchRequest } from '@/types/popup';

/* ---------- Types ---------- */
export type PopupRow = {
  id: string;
  url: string;
  image: UploadItem | null;
  visible: boolean;
  device: 'PC' | 'MOBILE' | 'BOTH';
  startAt?: string;
  endAt?: string;
  orderNo: number;
  eventId?: string;
  draft?: boolean;
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


/* ---------- Component (List + Preview toggle) ---------- */
export interface PopupListManagerRef {
  addNewPopup: () => void;
  handleSave: () => void;
}

const PopupListManager = React.forwardRef<PopupListManagerRef, { eventId?: string }>(
  ({ eventId }, ref) => {
  const mounted = useMounted();
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<PopupRow[]>([]);

  // API 데이터 조회
  const { data: apiPopups } = useGetQuery(
    eventId ? ['eventPopups', eventId] : ['homepagePopups'],
    eventId ? `/api/v1/event/${eventId}/popup` : '/api/v1/homepage/popup',
    'admin',
    { enabled: mounted },
    true // withAuth = true (관리자 API이므로 인증 필요)
  );

  // API 데이터를 PopupRow로 변환
  React.useEffect(() => {
    if (!mounted) return;
    
    // ISO 날짜를 datetime-local 형식으로 변환하는 함수
    const formatDateForInput = (isoDate: string) => {
      if (!isoDate) return '';
      const date = new Date(isoDate);
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식
    };

    // 이미지 URL에서 파일명 추출하는 함수
    const getFileNameFromUrl = (url: string) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = pathname.split('/').pop() || 'image';
        // URL 디코딩하여 한글 파일명 복원
        return decodeURIComponent(fileName);
      } catch {
        return 'image';
      }
    };
    
    if (apiPopups && Array.isArray(apiPopups) && apiPopups.length > 0) {
      // 기존 데이터가 있는 경우
      const convertedRows: PopupRow[] = apiPopups.map((popup: PopupItem, _index: number) => ({
        id: popup.id,
        url: popup.url || '',
        image: popup.imageUrl ? {
          id: `${popup.id}_image`, // 각 팝업마다 고유한 이미지 ID
          file: new File([], `placeholder_${popup.id}`), // 각 팝업마다 고유한 placeholder 파일
          name: getFileNameFromUrl(popup.imageUrl),
          size: 0, // 실제 파일 크기는 알 수 없으므로 0으로 설정
          sizeMB: 0,
          tooLarge: false,
          url: popup.imageUrl, // 스폰서와 동일하게 url 필드에 저장
          previewUrl: popup.imageUrl
        } as UploadItem : null,
        visible: true, // API에서 visible 정보가 없으므로 기본값
        device: popup.device,
        startAt: formatDateForInput(popup.startAt),
        endAt: formatDateForInput(popup.endAt),
        orderNo: popup.orderNo,
        eventId: popup.eventId,
        draft: false
      }));

      setRows(convertedRows);
    } else {
      // 기존 데이터가 없는 경우, 새 팝업 등록을 위한 빈 폼 생성
      const newPopupRow: PopupRow = {
        id: `temp_${Date.now()}`,
        url: '',
        image: null,
        visible: true,
        device: 'BOTH',
        startAt: '',
        endAt: '',
        orderNo: 1,
        eventId: eventId,
        draft: true
      };

      setRows([newPopupRow]);
    }
  }, [apiPopups, mounted, eventId]);

  // 저장 mutation
  const saveMutation = useApiMutation(
    eventId ? `/api/v1/event/${eventId}/popup` : '/api/v1/homepage/popup',
    'admin',
    'POST',
    true,
    {
      onSuccess: () => {
        // 팝업 목록 쿼리 무효화하여 데이터 다시 로드
        const queryKey = eventId ? ['eventPopups', eventId] : ['homepagePopups'];
        queryClient.invalidateQueries({ queryKey });
        
        alert('저장되었습니다.');
        setMode('preview');
      },
      onError: (error: Error) => {
        alert(`저장 실패: ${error.message}`);
      }
    }
  );

  const updateRow = (id: string, patch: Partial<PopupRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const move = (idx: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      // orderNo 업데이트
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
    });

  const addAfter = (idx: number) =>
    setRows((prev) => {
      const nextId = `temp_${Date.now()}`; // 임시 ID (백엔드에서 실제 UUID 생성)
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: nextId, 
        url: '', 
        image: null, 
        visible: true, 
        device: 'BOTH', 
        startAt: '', 
        endAt: '', 
        orderNo: idx + 2,
        eventId: eventId,
        draft: true,
      });
      // orderNo 재정렬
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
    });

  const addNewPopup = () => {
    const nextId = `temp_${Date.now()}`; // 임시 ID (백엔드에서 실제 UUID 생성)
    const newPopup: PopupRow = {
      id: nextId,
      url: '',
      image: null,
      visible: true,
      device: 'BOTH',
      startAt: '',
      endAt: '',
      orderNo: rows.length + 1,
      eventId: eventId,
      draft: true,
    };
    setRows(prev => [...prev, newPopup]);
  };

  // ref를 통해 외부에서 함수들을 호출할 수 있도록 노출
  React.useImperativeHandle(ref, () => ({
    addNewPopup,
    handleSave,
  }));

  const removeAt = (idx: number) =>
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // orderNo 재정렬
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
    });

  const handleSave = () => {
    
    // 현재 시간과 기본 종료 시간 계산
    const now = new Date();
    const defaultEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1년 후

    // API 요청 데이터 준비
    const popupInfos = rows.map(row => ({
      id: row.draft ? undefined : row.id, // 새 팝업(draft)은 ID 없이 전송
      url: row.url || '',
      startAt: row.startAt || now.toISOString(),
      endAt: row.endAt || defaultEndTime.toISOString(),
      device: row.device,
      orderNo: row.orderNo,
      eventId: row.eventId
    }));


    // 삭제된 팝업 ID 추출 (배너/스폰서와 동일한 방식)
    const deletedPopupIds = (apiPopups && Array.isArray(apiPopups))
      ? apiPopups
          .filter((apiPopup: PopupItem) => !rows.some(r => r.id === apiPopup.id))
          .map((popup: PopupItem) => popup.id)
      : [];


        const popupBatchRequest: PopupBatchRequest = {
          popupInfos,
          deletedPopupIds // 삭제된 팝업 ID들 포함
        };


    // FormData 생성
    const formData = new FormData();
    formData.append('popupBatchRequest', JSON.stringify(popupBatchRequest));
    
    // 새로 업로드한 이미지만 필터링 (draft 상태이면서 실제 File 객체인 것들)
    const imagesToSend = rows.filter(row => row.draft && row.image?.file instanceof File);
    
    imagesToSend.forEach((row) => {
      if (row.image?.file instanceof File) {
        formData.append('images', row.image.file);
      }
    });

    saveMutation.mutate(formData);
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
        <div className="flex items-center gap-3 h-full min-h-[120px] w-[320px] overflow-hidden">
          <SponsorUploader
            label="이미지 선택"
            accept="image/jpeg,image/jpg,image/png,image/webp"
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
              {!r.id.startsWith('temp_') && (
                <Link
                  href={eventId ? `/admin/banners/popups/events/${eventId}/${r.id}/edit` : `/admin/banners/popups/main/${r.id}/edit`}
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
                  <option value="BOTH">전체</option>
                  <option value="PC">PC</option>
                  <option value="MOBILE">모바일</option>
                </select>
              ) : (
                <div className="h-10 flex items-center text-sm text-gray-700">
                  {r.device === 'BOTH' ? '전체' : r.device === 'PC' ? 'PC' : '모바일'}
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
    <div>
      {/* 헤더: 탭과 액션 버튼들 */}
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
        <div className="flex gap-2">
          <Button
            size="sm"
            tone="outlineDark"
            variant="outline"
            widthType="pager"
            onClick={() => {
              if (eventId) {
                window.history.back();
              } else {
                window.location.href = '/admin/banners/popups';
              }
            }}
          >
            목록으로
          </Button>
          {mode === 'manage' && (
            <>
              <Button
                size="sm"
                tone="neutral"
                widthType="pager"
                onClick={addNewPopup}
              >
                추가하기
              </Button>
              <Button
                size="sm"
                tone="primary"
                widthType="pager"
                onClick={handleSave}
              >
                저장하기
              </Button>
            </>
          )}
        </div>
      </div>

      {mode === 'manage' ? (
        <>
          <AdminBannerTableShell<PopupRow>
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

          <div className="mt-8 pt-4 pb-16">
            <NoticeMessage
              items={[
                { text: '※ 저장 전 항목만 편집 가능합니다. 저장 후에는 [수정]으로 들어가 편집하세요.' },
                { text: '※ 기간을 비우면 항상 노출로 간주됩니다. (실서비스에서는 서버 검증 권장)' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1200px 이상, 20MB 이하.' },
                { text: '⚠️ 개별 수정 후 목록으로 돌아온 경우, 이미 저장되어 있으니 목록에서 또 저장버튼 누르지 마세요. (이미지 오류 발생 가능)' },
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
});

PopupListManager.displayName = 'PopupListManager';

export default PopupListManager;
