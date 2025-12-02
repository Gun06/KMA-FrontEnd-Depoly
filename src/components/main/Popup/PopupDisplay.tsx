'use client';

import React from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PopupItem } from './PopupManager';

interface PopupDisplayProps {
  popups: PopupItem[];
  onDontShowToday: () => void;
}

export default function PopupDisplay({ popups, onDontShowToday }: PopupDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);
  const [isClosing, setIsClosing] = React.useState(false);
  const [dontShowToday, setDontShowToday] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const currentPopup = popups[currentIndex];
  const totalPopups = popups.length;

  // 화면 크기 변경 감지
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPopups);
  }, [totalPopups]);

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPopups) % totalPopups);
  }, [totalPopups]);

  const handleClose = React.useCallback(() => {
    if (dontShowToday) {
      onDontShowToday();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, [dontShowToday, onDontShowToday]);

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

  // 모바일 스와이프
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    // 수평 스와이프가 수직 스와이프보다 클 때만 처리
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartRef.current = null;
  };

  const handleDontShowTodayChange = (checked: boolean) => {
    setDontShowToday(checked);
  };

  if (!isOpen || !currentPopup) return null;

  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* 데스크톱 팝업 */}
      {!isMobile && (
        <div className={`relative w-full max-w-[400px] h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            aria-label="닫기"
          >
            <X size={16} />
          </button>

          {/* 네비게이션 버튼 (여러 개일 때만) */}
          {totalPopups > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="이전"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="다음"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* 이미지 */}
          <a
            href={currentPopup.url || '#'}
            target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`block w-full h-full ${isClosing || !isOpen ? 'pointer-events-none' : ''}`}
            onClick={(e) => {
              if (isClosing || !isOpen) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }}
          >
            <Image
              src={currentPopup.image!}
              alt="팝업 이미지"
              fill
              className="object-cover"
              priority
              sizes="400px"
            />
          </a>

          {/* 하단 컨트롤 */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/95 border-t flex items-center justify-between px-3">
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
          className="fixed inset-x-0 bottom-0 z-[99]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 핸들 */}
          <div className="flex justify-center mb-1 px-4">
            <div className="w-10 h-1 rounded-full bg-white/80" />
          </div>

          <div className={`relative w-full rounded-t-3xl shadow-2xl overflow-hidden bg-white transition-all duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
            {/* 상단 인디케이터 */}
            {totalPopups > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
                {currentIndex + 1} / {totalPopups}
              </div>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"
              aria-label="닫기"
            >
              <X size={16} />
            </button>

            {/* 이미지 */}
            <a
              href={currentPopup.url || '#'}
              target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative w-full h-[40vh] min-h-[250px] max-h-[350px]">
                <Image
                  src={currentPopup.image!}
                  alt="팝업 이미지"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 520px) 100vw, 520px"
                />
              </div>
            </a>

            {/* 하단 컨트롤 */}
            <div className="flex items-center justify-between px-4 h-12 border-t bg-white">
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
                {totalPopups > 1 && (
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
