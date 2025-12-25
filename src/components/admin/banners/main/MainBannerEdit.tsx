'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import EventDropdownPortal from './components/EventDropdownPortal';
import type { Opt } from './types';
import { getMainBannersForAdmin, updateMainBanner } from './api';
import { getSimpleEventList } from '@/services/event';
import type { MainBannerUpdateInfo } from '@/types/mainBanner';
import { mainBannerKeys } from '@/hooks/useMainBanners';

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
  bannerType: 'event' | 'association';
};


const softInput =
  'bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none focus:outline-none ring-0 focus:ring-0 ' +
  'transition-colors shadow-none';

/* ------------ utils ------------ */
function extractFileNameFromUrl(url: string): string {
  try {
    // URL에서 파일명 추출
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'image.jpg';
    
    // URL 디코딩 (한글 파일명 등)
    return decodeURIComponent(fileName);
  } catch {
    // URL 파싱 실패 시 기본값
    return 'image.jpg';
  }
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
export default function MainBannerEdit({ idParam }: { idParam: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [row, setRow] = React.useState<EditRow | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [eventOptions, setEventOptions] = React.useState<Opt[]>([]);

  // API에서 배너 데이터와 대회 목록 로드
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (idParam === '0') {
          // 새 배너 생성
          const draft: EditRow = {
            id: Date.now(), // 임시 ID
            visible: true,
            image: null,
            badge: '대회 안내',
            title: '',
            subtitle: '',
            date: '',
            eventId: undefined,
            bannerType: 'event',
          };
          setRow(draft);
        } else {
          // 기존 배너 수정 - 전체 목록에서 해당 배너 찾기
          const [allBanners, eventsData] = await Promise.all([
            getMainBannersForAdmin(),
            getSimpleEventList().catch(() => [])
          ]);
          
          // URL의 UUID를 직접 사용해서 매칭
          const bannerData = allBanners.find(banner => banner.id === idParam);
          
          if (!bannerData) {
            throw new Error('배너를 찾을 수 없습니다.');
          }

          // 대회 목록을 드롭다운 옵션으로 변환
          const eventOpts: Opt[] = eventsData.map(event => ({
            key: event.id,
            label: event.title
          }));
          setEventOptions(eventOpts);

          // 백엔드에서 eventId를 제공하므로 직접 사용
          const eventId = parseInt(bannerData.eventId);

          // API 데이터를 EditRow 형식으로 변환
          const editRow: EditRow = {
            id: parseInt(bannerData.id),
            visible: true, // API에서 visible 정보가 없으므로 기본값 true
            image: bannerData.imageUrl ? {
              id: bannerData.id,
              file: new File([], 'image.jpg'),
              name: extractFileNameFromUrl(bannerData.imageUrl), // URL에서 실제 파일명 추출
              size: 1000000, // 1MB로 가정
              sizeMB: 1, // 1MB 표시
              tooLarge: false,
              url: bannerData.imageUrl,
              previewUrl: bannerData.imageUrl // 이미지 URL을 previewUrl로 사용
            } as unknown as UploadItem : null,
            badge: '대회 안내', // 고정값
            title: bannerData.title,
            subtitle: bannerData.subTitle,
            date: bannerData.date,
            eventId: eventId, // eventName으로부터 찾은 eventId 사용
            bannerType: 'event',
          };

          setRow(editRow);
        }

      } catch (_err) {
        setError('데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 빈 배열로 설정
        setEventOptions([]);
        
          if (idParam === '0') {
          const draft: EditRow = {
            id: Date.now(),
            visible: true,
            image: null,
            badge: '대회 안내',
            title: '',
            subtitle: '',
            date: '',
            eventId: undefined,
            bannerType: 'event',
          };
          setRow(draft);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [idParam]);


    // 로딩 상태 처리
    if (isLoading) {
      return (
        <div className="mx-auto max-w-[900px] px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        </div>
      );
    }
  
    // 에러 상태 처리
    if (error && !row) {
      return (
        <div className="mx-auto max-w-[900px] px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">{error}</div>
              <div className="text-sm text-gray-400">기본 데이터를 사용합니다.</div>
            </div>
          </div>
        </div>
      );
    }
  
  if (!row) return <div className="p-6">존재하지 않는 배너입니다.</div>;

  const update = (patch: Partial<EditRow>) =>
    setRow(prev => ({ ...(prev as EditRow), ...patch }));

  const onSave = async () => {
    if (!row) return;

    try {
      // API 요청 데이터 구성
      const updateInfo: MainBannerUpdateInfo = {
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        eventId: row.eventId?.toString() || '',
        deleteMainBannerIds: [], // 개별 수정 시에는 삭제할 항목이 없으므로 빈 배열
      };

      // 이미지 파일 추출 (새로 업로드된 경우)
      let imageFile: File | undefined;
      if (row.image && 'file' in row.image && row.image.file instanceof File) {
        imageFile = row.image.file;
      }

      // API 호출 (URL의 UUID 사용)
      await updateMainBanner(idParam, updateInfo, imageFile);

      // 메인 배너 목록 캐시 무효화 (목록에서 변경사항 반영)
      queryClient.invalidateQueries({ queryKey: mainBannerKeys.lists() });

      alert('저장되었습니다.');
      router.push('/admin/banners/main');
    } catch (_err) {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
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
      {row.bannerType === 'association' ? (
        <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
          <div className="text-blue-500 mb-2">🏢</div>
          <div className="text-sm text-blue-600 font-medium">협회소개 배너</div>
          <div className="text-xs text-blue-500 mt-1">이미지만 업로드하세요</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-gray-600">
              {row.badge}
            </div>
            <CellInput value={row.date}     onCommit={(v) => update({ date: v })}     placeholder="대회 날짜(예: 2025.11.03)" className="h-10" />
            <CellInput value={row.title}    onCommit={(v) => update({ title: v })}    placeholder="큰 제목(예: 2025 전주 남강 마라톤)" className="col-span-2 h-11 text-[15px]" />
            <CellInput value={row.subtitle} onCommit={(v) => update({ subtitle: v })} placeholder="부제(선택)" className="col-span-2 h-10" />
          </div>

          {/* 대회 선택 */}
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">대회 선택</label>
            <EventDropdownPortal
              value={row.eventId?.toString()}
              onChange={(v) => update({ eventId: v ? parseInt(v) : undefined })}
              options={eventOptions}
              placeholder="대회를 선택해주세요"
            />
            {row.eventId && <p className="mt-1 text-xs text-gray-500">버튼 경로는 자동으로 생성됩니다.</p>}
          </div>
        </>
      )}

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
