'use client';

import React from 'react';

interface MobilePreviewProps {
  items: { src: string; href: string }[];
  index: number;
  total: number;
  open: boolean;
  dontShowToday: boolean;
  onClose: () => void;
  onGo: (dir: 1 | -1) => void;
  onDontShowTodayChange: (checked: boolean) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * 모바일 팝업 미리보기 컴포넌트
 */
export default function MobilePreview({
  items,
  index,
  total,
  open,
  dontShowToday,
  onClose,
  onGo,
  onDontShowTodayChange,
  onTouchStart,
  onTouchEnd,
}: MobilePreviewProps) {
  const active = items[index] || null;

  if (!active || !open) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        노출할 팝업이 없습니다.
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
      <div 
        className="relative w-full max-w-sm mx-auto flex flex-col"
        style={{ maxHeight: '100%' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* 핸들 */}
        <div className="flex justify-center mb-1 px-4 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/80" />
        </div>

        <div className="relative w-full rounded-t-[24px] shadow-2xl bg-white flex flex-col overflow-hidden">
          {/* 상단 인디케이터 */}
          {total > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
              {index + 1} / {total}
            </div>
          )}

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"
            aria-label="닫기"
          >
            ✕
          </button>

          {/* 이미지 - 800x1000 비율 유지 */}
          <div 
            className="w-full overflow-y-auto"
            style={{ 
              maxHeight: 'calc(100% - 120px)'
            }}
          >
            <a
              href={active.href && active.href !== '#' ? active.href : undefined}
              target={active.href && active.href !== '#' ? '_blank' : undefined}
              rel={active.href && active.href !== '#' ? 'noopener noreferrer' : undefined}
              className="block w-full"
            >
              <div 
                className="relative w-full overflow-hidden"
                style={{ 
                  aspectRatio: '4/5'
                }}
              >
                <img
                  src={active.src}
                  alt="팝업 이미지"
                  className="w-full h-full object-cover"
                  style={{ 
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 text-sm p-4';
                    errorDiv.innerHTML = `
                      <div class="text-center">
                        <div class="text-lg mb-2">⚠️</div>
                        <div class="mb-1">이미지를 불러올 수 없습니다</div>
                        <div class="text-xs text-gray-400">S3 권한 설정을 확인해주세요</div>
                      </div>
                    `;
                    target.parentElement?.appendChild(errorDiv);
                  }}
                />
              </div>
            </a>
          </div>

          {/* 하단 컨트롤 */}
          <div className="flex items-center justify-between px-4 h-12 border-t bg-white flex-shrink-0">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => onDontShowTodayChange(e.target.checked)}
                className="w-4 h-4"
              />
              오늘 하루 보지 않음
            </label>
            <div className="flex items-center gap-2">
              {total > 1 && (
                <>
                  <button
                    onClick={() => onGo(-1)}
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => onGo(1)}
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    다음
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

