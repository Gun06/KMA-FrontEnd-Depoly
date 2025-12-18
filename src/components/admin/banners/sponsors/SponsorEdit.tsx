'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { useSponsors, useUpdateSponsor } from '@/hooks/useSponsors';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';

/* ---------- Types & Storage ---------- */
export type EditRow = {
  id: string;
  url: string;
  image: UploadItem | null;
  visible: boolean;
};

// PersistRow 타입은 더 이상 사용하지 않음 (API 기반으로 변경)

// 로컬 스토리지 함수들은 더 이상 사용하지 않음 (API 기반으로 변경)

/* ---------- UI ---------- */
const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';

export default function SponsorEdit({ idParam }: { idParam: string }) {
  const router = useRouter();
  const [row, setRow] = React.useState<EditRow | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // 알림 모달 state
  const [successModal, setSuccessModal] = React.useState<{ isOpen: boolean; title?: string; message: string }>({
    isOpen: false,
    message: '',
  });
  const [errorModal, setErrorModal] = React.useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });
  
  // API에서 스폰서 목록을 가져와서 해당 ID의 스폰서를 찾음
  const { data: sponsors, isLoading, error } = useSponsors();
  const updateMutation = useUpdateSponsor();

  React.useEffect(() => {
    if (sponsors) {
      const found = sponsors.find(s => s.id === idParam);
      if (found) {
        setRow({
          id: found.id,
          url: found.url,
          image: found.imageUrl ? {
            id: 'existing',
            file: new File([], 'existing'),
            name: found.imageUrl.split('/').pop() || '기존 이미지',
            size: 0,
            sizeMB: 0,
            tooLarge: false
          } : null,
          visible: found.visible
        });
      }
    }
  }, [sponsors, idParam]);

  if (isLoading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6">에러가 발생했습니다: {error.message}</div>;
  if (!row) return <div className="p-6">존재하지 않는 항목입니다.</div>;

  const update = (patch: Partial<EditRow>) =>
    setRow(prev => ({ ...(prev as EditRow), ...patch }));

  const onSave = async () => {
    if (!row || isSaving) return;
    
    try {
      setIsSaving(true);
      
      // 이미지가 새로 업로드된 경우에만 이미지 파일 전송
      const imageFile = row.image && row.image.file instanceof File ? row.image.file : undefined;
      
      // API로 스폰서 업데이트
      await updateMutation.mutateAsync({
        sponsorId: row.id,
        sponsorUpdateInfo: {
          url: row.url,
          visible: row.visible
        },
        image: imageFile
      });
      
      setSuccessModal({
        isOpen: true,
        title: '저장되었습니다',
        message: '스폰서 정보가 성공적으로 저장되었습니다.',
      });
      
      // 모달 닫힌 후 목록으로 이동
      setTimeout(() => {
        router.push('/admin/banners/sponsors');
      }, 1500);
    } catch (_error) {
      setErrorModal({
        isOpen: true,
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
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
        <Button 
          size="sm" 
          tone="primary" 
          widthType="pager" 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.push('/admin/banners/sponsors')}>
          목록으로
        </Button>
      </div>

      {/* 커스텀 알림 모달들 */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="오류"
        message={errorModal.message}
      />
    </div>
  );
}
