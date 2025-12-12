import React from 'react';
import Button from '@/components/common/Button/Button';

interface PopupListManagerHeaderProps {
  mode: 'manage' | 'preview';
  eventId?: string;
  onModeChange: (mode: 'manage' | 'preview') => void;
  onAddNew: () => void;
  onSave: () => void;
}

/**
 * 팝업 리스트 관리자 헤더 컴포넌트
 */
export default function PopupListManagerHeader({
  mode,
  eventId,
  onModeChange,
  onAddNew,
  onSave,
}: PopupListManagerHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="rounded-lg border bg-white p-1 inline-flex gap-1">
        <button
          type="button"
          onClick={() => onModeChange('manage')}
          className={`px-3 h-9 rounded-md text-sm ${mode === 'manage' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
        >
          관리
        </button>
        <button
          type="button"
          onClick={() => onModeChange('preview')}
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
              onClick={onAddNew}
            >
              추가하기
            </Button>
            <Button
              size="sm"
              tone="primary"
              widthType="pager"
              onClick={onSave}
            >
              저장하기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

