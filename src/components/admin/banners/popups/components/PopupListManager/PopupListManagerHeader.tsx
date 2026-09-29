import React from 'react';
import Button from '@/components/common/Button/Button';

interface PopupListManagerHeaderProps {
  mode: 'manage' | 'preview';
  eventId?: string;
  onModeChange: (mode: 'manage' | 'preview') => void;
  onAddNew: () => void;
  onSave: () => void;
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
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
  title,
  headerAction,
}: PopupListManagerHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
      {title ? <h3 className="min-w-0 text-[15px] font-semibold">{title}</h3> : null}
      <div className="inline-flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
        <button
          type="button"
          onClick={() => onModeChange('manage')}
          className={`px-3 h-8 rounded-md text-[13px] ${mode === 'manage' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
        >
          관리
        </button>
        <button
          type="button"
          onClick={() => onModeChange('preview')}
          className={`px-3 h-8 rounded-md text-[13px] ${mode === 'preview' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
        >
          미리보기
        </button>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button
          size="sm"
          tone="outlineDark"
          variant="outline"
          className="!h-9 !px-3 !text-[13px]"
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
              className="!h-9 !px-3 !text-[13px]"
              onClick={onAddNew}
            >
              추가하기
            </Button>
            <Button
              size="sm"
              tone="primary"
              className="!h-9 !px-3 !text-[13px]"
              onClick={onSave}
            >
              저장하기
            </Button>
          </>
        )}
        {headerAction}
      </div>
    </div>
  );
}

