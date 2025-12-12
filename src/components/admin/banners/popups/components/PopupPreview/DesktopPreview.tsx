'use client';

import React from 'react';

interface DesktopPreviewProps {
  items: { src: string; href: string }[];
  index: number;
  total: number;
  open: boolean;
  dontShowToday: boolean;
  onClose: () => void;
  onGo: (dir: 1 | -1) => void;
  onDontShowTodayChange: (checked: boolean) => void;
}

/**
 * 데스크탑 팝업 미리보기 컴포넌트
 */
export default function DesktopPreview({
  items,
  index,
  total,
  open,
  dontShowToday,
  onClose,
  onGo,
  onDontShowTodayChange,
}: DesktopPreviewProps) {
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
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-md"
        style={{ 
          maxHeight: '100%'
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 네비게이션 버튼 (여러 개일 때만) */}
        {total > 1 && (
          <>
            <button
              onClick={() => onGo(-1)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="이전"
            >
              ‹
            </button>
            <button
              onClick={() => onGo(1)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="다음"
            >
              ›
            </button>
          </>
        )}

        {/* 이미지 영역 - 스크롤 가능 */}
        <div 
          className="relative w-full overflow-y-auto flex-1"
          style={{ 
            minHeight: 0
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

        {/* 하단 컨트롤 - 고정 */}
        <div className="h-12 bg-white/95 border-t flex items-center justify-between px-3 flex-shrink-0">
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => onDontShowTodayChange(e.target.checked)}
              className="w-4 h-4"
            />
            오늘 하루 보지 않음
          </label>
          <button
            onClick={onClose}
            className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

