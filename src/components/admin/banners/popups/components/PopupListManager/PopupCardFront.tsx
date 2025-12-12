import React from 'react';
import type { PopupRow } from '../../types';
import { VisibilityChip } from '../shared/VisibilityChip';
import { VisibilityChipsEditable } from '../shared/VisibilityChipsEditable';

interface PopupCardFrontProps {
  row: PopupRow;
  index: number;
  onVisibilityChange: (value: boolean) => void;
}

/**
 * 팝업 카드 앞면 컴포넌트
 */
export default function PopupCardFront({ row, index, onVisibilityChange }: PopupCardFrontProps) {
  return (
    <div
      className="relative w-full bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* 이미지 또는 플레이스홀더 */}
      {row.image?.url ? (
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 rounded-xl">
          <img
            src={row.image.url}
            alt="팝업 이미지"
            className="w-full h-full object-cover"
            style={{ 
              display: 'block'
            }}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[4/5] bg-slate-100 rounded-xl flex items-center justify-center">
          <div className="text-center text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">이미지 없음</p>
          </div>
        </div>
      )}
      
      {/* 순서 배지 */}
      <div className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#1E5EFF] text-white font-semibold text-sm shadow-lg z-10">
        {index + 1}
      </div>
      
      {/* 공개 상태 배지 */}
      <div className="absolute top-3 right-3 z-10">
        {row.draft
          ? <VisibilityChipsEditable 
              value={row.visible} 
              onChange={onVisibilityChange}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          : <VisibilityChip value={row.visible} />
        }
      </div>

      {/* 클릭 힌트 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs">
        클릭하여 뒤집기
      </div>
    </div>
  );
}

