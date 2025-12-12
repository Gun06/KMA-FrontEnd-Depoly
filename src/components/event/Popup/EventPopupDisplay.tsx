'use client';

import React from 'react';
import { EventPopupItem } from './types';

interface EventPopupDisplayProps {
  popups: EventPopupItem[];
  onDontShowToday: () => void;
}

export default function EventPopupDisplay({ popups, onDontShowToday }: EventPopupDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);
  const [dontShowToday, setDontShowToday] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const currentPopup = popups[currentIndex];
  // 800x1000 비율 (4:5)
  const aspectRatio = 4 / 5;

  // 화면 크기 변경 감지
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleClose = React.useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (dontShowToday) {
      onDontShowToday();
    }
    // 즉시 완전히 제거
    setIsOpen(false);
  }, [dontShowToday, onDontShowToday]);

  const handleDontShowTodayChange = (checked: boolean) => {
    setDontShowToday(checked);
  };

  const goToNext = React.useCallback(() => {
    if (!isOpen) return;
    setCurrentIndex((prev) => (prev + 1) % popups.length);
  }, [popups.length, isOpen]);

  const goToPrevious = React.useCallback(() => {
    if (!isOpen) return;
    setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
  }, [popups.length, isOpen]);

  // 키보드 네비게이션 (데스크톱만)
  React.useEffect(() => {
    if (isMobile || !isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen, goToNext, goToPrevious, handleClose]);

  // 닫힌 상태면 완전히 제거
  if (!isOpen || !currentPopup) return null;

  return (
    <div 
      className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
    >
      {/* 데스크톱 팝업 */}
      {!isMobile && (
        <div 
          className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ 
            width: 'min(400px, 80vw)',
            maxHeight: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            aria-label="닫기"
          >
            ×
          </button>

          {/* 네비게이션 버튼 (여러 개일 때만) */}
          {popups.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="이전"
              >
                ‹
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="다음"
              >
                ›
              </button>
            </>
          )}

          {/* 팝업 이미지 영역 - 스크롤 가능 */}
          {currentPopup.image && (
            <div 
              className="relative w-full overflow-y-auto flex-1"
              style={{ 
                minHeight: 0
              }}
            >
              <a
                href={currentPopup.url && currentPopup.url !== '#' ? currentPopup.url : undefined}
                target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
                rel={currentPopup.url && currentPopup.url !== '#' ? 'noopener noreferrer' : undefined}
                className="block w-full"
                onClick={(e) => {
                  if (!isOpen || !currentPopup.url || currentPopup.url === '#') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
              >
                <div 
                  className="relative w-full overflow-hidden"
                  style={{ 
                    aspectRatio: aspectRatio.toString()
                  }}
                >
                  <img
                    src={currentPopup.image}
                    alt="팝업 이미지"
                    className="w-full h-full object-cover"
                    style={{ 
                      display: 'block'
                    }}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </a>
            </div>
          )}

          {/* 하단 컨트롤 - 고정 */}
          <div className="h-12 bg-white/95 border-t flex items-center justify-between px-3 flex-shrink-0">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => handleDontShowTodayChange(e.target.checked)}
                className="w-4 h-4"
              />
              오늘 하루 보지 않음
            </label>
            <button
              onClick={handleClose}
              className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 모바일 팝업 */}
      {isMobile && (
        <div 
          className="fixed inset-x-0 bottom-0 z-[99] flex flex-col"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => {
            if (!isOpen) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {/* 핸들 */}
          <div className="flex justify-center mb-1 px-4 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/80" />
          </div>

          <div 
            className="relative w-full rounded-t-[24px] shadow-2xl bg-white flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 인디케이터 */}
            {popups.length > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
                {currentIndex + 1} / {popups.length}
              </div>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"
              aria-label="닫기"
            >
              ×
            </button>

            {/* 이미지 - 800x1000 비율 유지 */}
            {currentPopup.image && (
              <div 
                className="w-full overflow-y-auto"
                style={{ 
                  maxHeight: 'calc(90vh - 120px)'
                }}
              >
                <a
                  href={currentPopup.url && currentPopup.url !== '#' ? currentPopup.url : undefined}
                  target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
                  rel={currentPopup.url && currentPopup.url !== '#' ? 'noopener noreferrer' : undefined}
                  className="block w-full"
                  onClick={(e) => {
                    if (!isOpen || !currentPopup.url || currentPopup.url === '#') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                >
                  <div 
                    className="relative w-full overflow-hidden"
                    style={{ 
                      aspectRatio: aspectRatio.toString()
                    }}
                  >
                    <img
                      src={currentPopup.image}
                      alt="팝업 이미지"
                      className="w-full h-full object-cover"
                      style={{ 
                        display: 'block'
                      }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                </a>
              </div>
            )}

            {/* 하단 컨트롤 */}
            <div className="flex items-center justify-between px-4 h-12 border-t bg-white flex-shrink-0">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => handleDontShowTodayChange(e.target.checked)}
                  className="w-4 h-4"
                />
                오늘 하루 보지 않음
              </label>
              <div className="flex items-center gap-2">
                {popups.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      이전
                    </button>
                    <button
                      onClick={goToNext}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      다음
                    </button>
                  </>
                )}
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
