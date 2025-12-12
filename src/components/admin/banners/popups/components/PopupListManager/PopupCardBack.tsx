import React from 'react';
import { Pencil } from 'lucide-react';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { PopupRow } from '../../types';
import { inputCls, smallInputCls } from '../../utils/styles';
import { CircleBtn } from '../shared/CircleBtn';
import { useApiMutation } from '@/hooks/useFetch';
import { POPUP_API_ENDPOINTS } from '../../api';
import { useQueryClient } from '@tanstack/react-query';
import type { PopupUpdateRequest } from '@/types/popup';

interface PopupCardBackProps {
  row: PopupRow;
  index: number;
  isEditing: boolean;
  onUpdate: (patch: Partial<PopupRow>) => void;
  onMove: (dir: -1 | 1) => void;
  onAddAfter: () => void;
  onRemove: () => void;
  onToggleEdit: () => void;
  onFlip: () => void;
  eventId?: string;
  onBatchSave?: () => void;
}

/**
 * 팝업 카드 뒷면 컴포넌트
 */
export default function PopupCardBack({
  row,
  index,
  isEditing,
  onUpdate,
  onMove,
  onAddAfter,
  onRemove,
  onToggleEdit,
  onFlip,
  eventId,
  onBatchSave,
}: PopupCardBackProps) {
  const queryClient = useQueryClient();
  
  // 개별 팝업 저장 mutation (draft가 아닐 때만 사용)
  const updateMutation = useApiMutation(
    row.id.startsWith('temp_') ? '' : POPUP_API_ENDPOINTS.POPUP_UPDATE(row.id),
    'admin',
    'PATCH',
    true,
    {
      onSuccess: () => {
        const queryKey = eventId ? ['eventPopups', eventId] : ['homepagePopups'];
        queryClient.invalidateQueries({ queryKey });
        alert('저장되었습니다.');
        onToggleEdit(); // 수정 모드 종료
      },
      onError: (error: Error) => {
        alert(`저장 실패: ${error.message}`);
      }
    }
  );

  const handleSaveClick = () => {
    // draft 항목은 개별 저장 불가
    if (row.id.startsWith('temp_')) {
      alert('새로 추가한 항목은 상단의 "저장하기" 버튼을 사용해주세요.');
      return;
    }

    const now = new Date();
    const defaultEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const popupUpdateRequest: PopupUpdateRequest = {
      url: row.url || '',
      startAt: row.startAt ? new Date(row.startAt).toISOString() : now.toISOString(),
      endAt: row.endAt ? new Date(row.endAt).toISOString() : defaultEndTime.toISOString(),
      device: row.device
    };

    const imageFile = row.image?.file instanceof File ? row.image.file : undefined;

    // 이미지가 있으면 FormData로, 없으면 JSON으로 전송
    if (imageFile) {
      const formData = new FormData();
      formData.append('popupUpdateRequest', JSON.stringify(popupUpdateRequest));
      formData.append('image', imageFile);
      updateMutation.mutate(formData);
    } else {
      // 이미지가 없으면 JSON 본문으로 직접 전송
      updateMutation.mutate(popupUpdateRequest as any);
    }
  };
  const handleBackClick = (e: React.MouseEvent) => {
    const isDraft = row.draft;
    
    // draft 상태이거나 수정 모드일 때: 뒤집히지 않도록 처리
    if (isDraft || isEditing) {
      // 입력 필드, 버튼, 링크가 아닌 빈 공간을 클릭한 경우에만 뒤집기
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'SELECT' || 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[data-stop-bubble="true"]')) {
        e.stopPropagation();
      } else {
        onFlip();
      }
      return;
    }
    
    // draft도 아니고 수정 모드도 아닐 때: 아무 곳이나 클릭해도 뒤집기
    onFlip();
  };

  const handleInnerClick = (e: React.MouseEvent) => {
    const isDraft = row.draft;
    
    // draft 상태이거나 수정 모드일 때는 뒤집지 않음 (입력 중이므로)
    if (isDraft || isEditing) {
      return;
    }
    
    // 수정 모드가 아니고 draft도 아닐 때는 모든 클릭이 뒤집기로 처리
    onFlip();
  };

  return (
    <div
      className="absolute inset-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 overflow-y-auto"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        maxHeight: '600px',
      }}
      onClick={handleBackClick}
    >
      <div 
        className="space-y-4"
        onClick={handleInnerClick}
      >
        {/* 액션 버튼들 */}
        <div 
          className="flex items-center justify-between pb-3 border-b border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <CircleBtn kind="up" onClick={() => onMove(-1)} />
            <CircleBtn kind="down" onClick={() => onMove(+1)} />
            <CircleBtn kind="plus" onClick={onAddAfter} />
            <CircleBtn kind="minus" onClick={onRemove} />
          </div>
          {row.id.startsWith('temp_') ? (
            // draft 항목: 저장하기 버튼
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBatchSave?.();
              }}
              className="inline-flex items-center gap-1.5 text-sm px-3 h-8 rounded-lg border border-[#1E5EFF] bg-[#1E5EFF] text-white hover:bg-[#1E5EFF]/90 transition-colors"
              title="저장하기"
            >
              저장하기
            </button>
          ) : (
            // 기존 항목: 수정/수정 완료 버튼
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  // 수정 완료 시 개별 저장
                  handleSaveClick();
                } else {
                  onToggleEdit();
                }
              }}
              className="inline-flex items-center gap-1.5 text-sm px-3 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isEditing ? '수정 완료' : '수정'}
              disabled={updateMutation.isPending}
            >
              <Pencil size={14} /> {isEditing ? (updateMutation.isPending ? '저장 중...' : '수정 완료') : '수정'}
            </button>
          )}
        </div>

        {/* 이미지 업로더 */}
        <div data-stop-bubble={(row.draft || isEditing) ? "true" : undefined}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">이미지 변경</label>
          <SponsorUploader
            label="이미지 선택"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            maxSizeMB={20}
            value={row.image ? [row.image] : []}
            readOnly={!row.draft && !isEditing}
            onChange={(files) => (row.draft || isEditing) && onUpdate({ image: files?.[0] ?? null })}
            buttonClassName="h-9 px-4"
            emptyText="이미지 없음"
          />
        </div>

        {/* 링크 URL */}
        <div data-stop-bubble={(row.draft || isEditing) ? "true" : undefined}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">링크 URL</label>
          <input
            value={row.url}
            onChange={(e) => (row.draft || isEditing) && onUpdate({ url: e.target.value })}
            readOnly={!row.draft && !isEditing}
            placeholder="https://example.com"
            className={inputCls}
          />
        </div>

        {/* 디바이스 */}
        <div data-stop-bubble={(row.draft || isEditing) ? "true" : undefined}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">디바이스</label>
          {(row.draft || isEditing) ? (
            <select
              value={row.device}
              onChange={(e) => onUpdate({ device: e.target.value as PopupRow['device'] })}
              className="h-10 px-3 rounded-md border border-slate-200 hover:border-slate-300 focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none text-sm w-full"
            >
              <option value="BOTH">전체</option>
              <option value="PC">PC</option>
              <option value="MOBILE">모바일</option>
            </select>
          ) : (
            <div className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 flex items-center text-sm text-gray-700">
              {row.device === 'BOTH' ? '전체' : row.device === 'PC' ? 'PC' : '모바일'}
            </div>
          )}
        </div>

        {/* 시작/종료 일시 */}
        <div className="grid grid-cols-1 gap-4" data-stop-bubble={(row.draft || isEditing) ? "true" : undefined}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">시작일시</label>
            <input
              type="datetime-local"
              value={row.startAt || ''}
              onChange={(e) => (row.draft || isEditing) && onUpdate({ startAt: e.target.value })}
              readOnly={!row.draft && !isEditing}
              className={smallInputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">종료일시</label>
            <input
              type="datetime-local"
              value={row.endAt || ''}
              onChange={(e) => (row.draft || isEditing) && onUpdate({ endAt: e.target.value })}
              readOnly={!row.draft && !isEditing}
              className={smallInputCls}
            />
          </div>
        </div>

        {/* 뒤집기 힌트 */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            다시 뒤집기
          </button>
        </div>
      </div>
    </div>
  );
}

