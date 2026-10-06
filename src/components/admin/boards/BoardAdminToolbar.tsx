'use client';

import React from 'react';
import clsx from 'clsx';
import Button from '@/components/common/Button/Button';

/** BoardEventList·NoticeEventTable 헤더 CTA와 동일 */
export const adminCardToolbarBtnClass =
  '!h-9 !min-w-0 !w-auto shrink-0 !px-3 !text-[13px]';

export function BoardCardToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-wrap items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
}

type BoardDetailListEditToolbarProps = {
  onList: () => void;
  onEdit: () => void;
  editLabel?: string;
};

export function BoardDetailListEditToolbar({
  onList,
  onEdit,
  editLabel = '수정하기',
}: BoardDetailListEditToolbarProps) {
  return (
    <BoardCardToolbar>
      <Button
        size="sm"
        tone="outlineDark"
        variant="outline"
        className={adminCardToolbarBtnClass}
        onClick={onList}
      >
        목록으로
      </Button>
      <Button size="sm" tone="primary" className={adminCardToolbarBtnClass} onClick={onEdit}>
        {editLabel}
      </Button>
    </BoardCardToolbar>
  );
}

type BoardFormSaveToolbarProps = {
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  pending?: boolean;
  pendingLabel?: string;
  saveDisabled?: boolean;
  cancelDisabled?: boolean;
};

export function BoardFormSaveToolbar({
  onCancel,
  onSave,
  cancelLabel = '취소하기',
  saveLabel = '저장하기',
  pending = false,
  pendingLabel,
  saveDisabled = false,
  cancelDisabled = false,
}: BoardFormSaveToolbarProps) {
  return (
    <BoardCardToolbar>
      <Button
        size="sm"
        tone="outlineDark"
        variant="outline"
        className={adminCardToolbarBtnClass}
        onClick={onCancel}
        disabled={cancelDisabled || pending}
      >
        {cancelLabel}
      </Button>
      <Button
        size="sm"
        tone="primary"
        className={adminCardToolbarBtnClass}
        onClick={onSave}
        disabled={saveDisabled || pending}
      >
        {pending ? pendingLabel ?? `${saveLabel.replace(/하기$/, '')} 중...` : saveLabel}
      </Button>
    </BoardCardToolbar>
  );
}
