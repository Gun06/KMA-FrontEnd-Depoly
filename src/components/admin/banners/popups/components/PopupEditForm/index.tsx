'use client';

import React from 'react';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import type { PopupUpdateRequest } from '@/types/popup';
import { inputCls, smallInputCls } from '../../utils/styles';
import { formatDateForInput, getFileNameFromUrl } from '../../utils/helpers';
import { usePopupEdit, usePopupUpdate } from '../../hooks';

export default function PopupEditForm({ id, eventId }: { id: string; eventId?: string }) {
  const [formData, setFormData] = React.useState({
    url: '',
    startAt: '',
    endAt: '',
    device: 'BOTH' as 'PC' | 'MOBILE' | 'BOTH',
    image: null as UploadItem | null
  });

  // 팝업 목록에서 해당 팝업 데이터 찾기
  const { popupData, isLoading } = usePopupEdit(id, eventId);

  // API 데이터를 폼에 설정
  React.useEffect(() => {
    if (popupData) {
      const data = popupData as {
        url: string;
        startAt: string;
        endAt: string;
        device: 'PC' | 'MOBILE' | 'BOTH';
        imageUrl?: string;
        id: string;
      };

      setFormData({
        url: data.url || '',
        startAt: formatDateForInput(data.startAt),
        endAt: formatDateForInput(data.endAt),
        device: data.device,
        image: data.imageUrl ? {
          id: `${data.id}_image`,
          file: new File([], `placeholder_${data.id}`),
          name: getFileNameFromUrl(data.imageUrl),
          size: 0,
          sizeMB: 0,
          tooLarge: false,
          url: data.imageUrl
        } as UploadItem : null
      });
    }
  }, [popupData]);

  // 수정 mutation
  const updateMutation = usePopupUpdate({
    id,
    eventId,
    onSuccess: () => {
      alert('저장되었습니다.');
    },
    onError: (error: Error) => {
      alert(`저장 실패: ${error.message}`);
    }
  });

  const update = (patch: Partial<typeof formData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const onSave = () => {
    const startAt = formData.startAt ? new Date(formData.startAt).toISOString() : new Date().toISOString();
    const endAt = formData.endAt ? new Date(formData.endAt).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const popupUpdateRequest: PopupUpdateRequest = {
      url: formData.url || '',
      startAt,
      endAt,
      device: formData.device
    };

    const imageFile = formData.image && formData.image.file instanceof File ? formData.image.file : undefined;
    
    // 이미지가 있으면 FormData로, 없으면 JSON으로 전송
    if (imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('popupUpdateRequest', JSON.stringify(popupUpdateRequest));
      formDataToSend.append('image', imageFile);
      updateMutation.mutate(formDataToSend);
    } else {
      // 이미지가 없으면 JSON 본문으로 직접 전송
      updateMutation.mutate(popupUpdateRequest as any);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-[900px] px-4 py-6 text-sm">로딩 중...</div>;
  }

  if (!popupData) {
    return <div className="mx-auto max-w-[900px] px-4 py-6 text-sm text-red-600">존재하지 않는 항목입니다. (id: {id})</div>;
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">팝업 수정</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">링크 URL</label>
        <input
          value={formData.url}
          onChange={(e)=>update({ url: e.target.value })}
          placeholder="https://example.com"
          className={inputCls}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">이미지</label>
        <SponsorUploader
          label="이미지 선택"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          maxSizeMB={20}
          value={formData.image ? [formData.image] : []}
          onChange={(files: UploadItem[] | null) => update({ image: files?.[0] ?? null })}
          buttonClassName="h-9 px-3"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">디바이스</label>
        <select
          value={formData.device}
          onChange={(e) => update({ device: e.target.value as 'PC' | 'MOBILE' | 'BOTH' })}
          className="h-10 px-3 rounded-md border border-slate-200 text-sm"
        >
          <option value="BOTH">전체</option>
          <option value="PC">PC</option>
          <option value="MOBILE">모바일</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">시작일시</label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) => update({ startAt: e.target.value })}
            className={smallInputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종료일시</label>
          <input
            type="datetime-local"
            value={formData.endAt}
            onChange={(e) => update({ endAt: e.target.value })}
            className={smallInputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장</Button>
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => {
          if (eventId) {
            window.location.href = `/admin/banners/popups/events/${eventId}`;
          } else {
            window.location.href = '/admin/banners/popups/main';
          }
        }}>
          목록으로
        </Button>
      </div>
    </div>
  );
}

