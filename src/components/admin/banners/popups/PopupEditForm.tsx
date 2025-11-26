'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { useGetQuery, useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import type { PopupUpdateRequest, PopupItem } from '@/types/popup';

/* ---------- UI ---------- */
const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';
const smallInputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 text-sm transition-colors shadow-none';

export default function PopupEditForm({ id, eventId }: { id: string; eventId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    url: '',
    startAt: '',
    endAt: '',
    device: 'BOTH' as 'PC' | 'MOBILE' | 'BOTH',
    image: null as UploadItem | null
  });

  // 팝업 목록에서 해당 팝업 데이터 찾기
  const { data: popupListData, isLoading } = useGetQuery(
    eventId ? ['eventPopups', eventId] : ['homepagePopups'],
    eventId ? `/api/v1/event/${eventId}/popup` : '/api/v1/homepage/popup',
    'admin'
  );

  const popupData = popupListData && Array.isArray(popupListData) 
    ? popupListData.find((popup: PopupItem) => popup.id === id)
    : null;

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
      
      // ISO 날짜를 datetime-local 형식으로 변환
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

      setFormData({
        url: data.url || '',
        startAt: formatDateForInput(data.startAt),
        endAt: formatDateForInput(data.endAt),
        device: data.device,
        image: data.imageUrl ? {
          id: `${data.id}_image`, // 고유한 이미지 ID
          file: new File([], `placeholder_${data.id}`), // 고유한 placeholder 파일
          name: getFileNameFromUrl(data.imageUrl),
          size: 0, // 실제 파일 크기는 알 수 없으므로 0으로 설정
          sizeMB: 0,
          tooLarge: false,
          url: data.imageUrl,
          previewUrl: data.imageUrl
        } as UploadItem : null
      });
    }
  }, [popupData]);

  // 수정 mutation
  const updateMutation = useApiMutation(
    `/api/v1/popup/${id}`,
    'admin',
    'PATCH',
    true,
    {
      onSuccess: () => {
        // 팝업 목록 쿼리 무효화하여 데이터 다시 로드
        const queryKey = eventId ? ['eventPopups', eventId] : ['homepagePopups'];
        queryClient.invalidateQueries({ queryKey });
        
        alert('저장되었습니다.');
        if (eventId) {
          router.push(`/admin/banners/popups/events/${eventId}`);
        } else {
          router.push('/admin/banners/popups/main');
        }
      },
      onError: (error: Error) => {
        alert(`저장 실패: ${error.message}`);
      }
    }
  );

  // 팝업을 찾지 못한 경우
  if (!isLoading && !popupData) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 text-sm text-red-600">
        존재하지 않는 항목입니다. (id: {id})
      </div>
    );
  }

  const update = (patch: Partial<typeof formData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const onSave = () => {
    // 날짜 형식 검증 및 변환
    const startAt = formData.startAt ? new Date(formData.startAt).toISOString() : new Date().toISOString();
    const endAt = formData.endAt ? new Date(formData.endAt).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const popupUpdateRequest: PopupUpdateRequest = {
      url: formData.url || '',
      startAt,
      endAt,
      device: formData.device
    };

    // FormData 생성
    const formDataToSend = new FormData();
    formDataToSend.append('popupUpdateRequest', JSON.stringify(popupUpdateRequest));
    
    // 이미지가 새로 업로드된 경우에만 이미지 파일 전송 (스폰서와 동일한 로직)
    const imageFile = formData.image && formData.image.file instanceof File ? formData.image.file : undefined;
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    updateMutation.mutate(formDataToSend);
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
            router.push(`/admin/banners/popups/events/${eventId}`);
          } else {
            router.push('/admin/banners/popups/main');
          }
        }}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
