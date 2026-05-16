import React from 'react';
import { cn } from '@/utils/cn';
import type { PopupRow } from '../../types';
import { isPopupRowUnsaved } from '../../utils/helpers';
import PopupCardFront from './PopupCardFront';
import PopupCardBack from './PopupCardBack';

interface PopupCardProps {
  row: PopupRow;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<PopupRow>) => void;
  onMove: (dir: -1 | 1) => void;
  onAddAfter: () => void;
  onRemove: () => void;
  onToggleEdit: () => void;
  onVisibilityChange: (value: boolean) => void;
  eventId?: string;
  onBatchSave?: () => void;
}

/**
 * 팝업 카드 컴포넌트 (앞면/뒷면 플립 기능 포함)
 */
export default function PopupCard({
  row,
  index,
  isExpanded,
  isEditing,
  onToggleExpand,
  onUpdate,
  onMove,
  onAddAfter,
  onRemove,
  onToggleEdit,
  onVisibilityChange,
  eventId,
  onBatchSave,
}: PopupCardProps) {
  const showUnsaved = isPopupRowUnsaved(row);

  return (
    <div
      className="relative"
      style={{ perspective: '1000px' }}
    >
      {/* 플립 카드 컨테이너 */}
      <div
        className={cn(
          'relative w-full cursor-pointer rounded-xl transition-[box-shadow,transform]',
          showUnsaved && 'ring-2 ring-[#1E5EFF]/70 ring-offset-2'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isExpanded ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={onToggleExpand}
      >
        {/* 앞면 */}
        <PopupCardFront
          row={row}
          index={index}
          onVisibilityChange={onVisibilityChange}
        />

        {/* 뒷면 */}
        <PopupCardBack
          row={row}
          index={index}
          isEditing={isEditing}
          onUpdate={onUpdate}
          onMove={onMove}
          onAddAfter={onAddAfter}
          onRemove={onRemove}
          onToggleEdit={onToggleEdit}
          onFlip={onToggleExpand}
          eventId={eventId}
          onBatchSave={onBatchSave}
        />
      </div>
    </div>
  );
}

