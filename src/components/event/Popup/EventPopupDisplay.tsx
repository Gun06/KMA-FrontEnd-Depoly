'use client';

import React from 'react';
import { EventPopupItem } from './types';

interface EventPopupDisplayProps {
  popups: EventPopupItem[];
  onDontShowToday: () => void;
}

export default function EventPopupDisplay({ popups, onDontShowToday }: EventPopupDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isClosing, setIsClosing] = React.useState(false);
  const [dontShowToday, setDontShowToday] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const currentPopup = popups[currentIndex];

  // 화면 크기 변경 감지
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      onDontShowToday();
    }
    setIsClosing(true);
    setTimeout(() => {
      if (currentIndex < popups.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsClosing(false);
      } else {
        // 모든 팝업을 다 봤으면 오늘 하루 보지 않기
        onDontShowToday();
      }
    }, 300);
  };

  const handleDontShowTodayChange = (checked: boolean) => {
    setDontShowToday(checked);
  };

  if (!currentPopup) return null;

  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* 데스크톱 팝업 */}
      {!isMobile && (
        <div 
          className={`relative w-full max-w-[400px] h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            aria-label="닫기"
          >
            ×
          </button>

          {/* 팝업 이미지 */}
          {currentPopup.image && (
            <a
              href={currentPopup.url || '#'}
              target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={currentPopup.image}
                alt="팝업 이미지"
                className="w-full h-full object-cover"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </a>
          )}

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
        <div className="fixed inset-x-0 bottom-0 z-[99]">
          {/* 핸들 */}
          <div className="flex justify-center mb-1 px-4">
            <div className="w-10 h-1 rounded-full bg-white/80" />
          </div>

          <div className={`relative w-full rounded-t-3xl shadow-2xl overflow-hidden bg-white transition-all duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
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

            {/* 이미지 */}
            {currentPopup.image && (
              <a
                href={currentPopup.url || '#'}
                target={currentPopup.url && currentPopup.url !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative w-full h-[40vh] min-h-[250px] max-h-[350px]">
                  <img
                    src={currentPopup.image}
                    alt="팝업 이미지"
                    className="w-full h-full object-cover"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </a>
            )}

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
                {popups.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex(prev => (prev - 1 + popups.length) % popups.length)}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentIndex(prev => (prev + 1) % popups.length)}
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
