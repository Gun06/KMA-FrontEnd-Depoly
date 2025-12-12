'use client';

import React from 'react';
import type { PopupRow } from '../../types';
import { inRange } from '../../utils/helpers';
import DesktopPreview from './DesktopPreview';
import MobilePreview from './MobilePreview';

type Props = {
  rows: PopupRow[];
  defaultView?: 'auto' | 'desktop' | 'mobile';
  showControls?: boolean;
  ignorePeriod?: boolean;
};

export default function PopupPreview({
  rows,
  defaultView = 'auto',
  showControls = true,
  ignorePeriod = true,
}: Props) {
  const [desktopItems, setDesktopItems] = React.useState<{ src: string; href: string }[]>([]);
  const [mobileItems, setMobileItems] = React.useState<{ src: string; href: string }[]>([]);
  const [desktopIndex, setDesktopIndex] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(true);
  const [desktopDontShowToday, setDesktopDontShowToday] = React.useState(false);
  const [mobileDontShowToday, setMobileDontShowToday] = React.useState(false);

  // 아이템 빌드 (데스크탑용)
  React.useEffect(() => {
    const now = Date.now();
    const visible = rows.filter(r => {
      if (!r.visible) return false;
      if (!ignorePeriod && !inRange(now, r.startAt, r.endAt)) return false;
      if (r.device === 'MOBILE') return false; // PC만 또는 BOTH
      return true;
    });
    
    const built = visible.map((r) => {
      const src = r.image?.url || '';
      if (!src) return null;
      return { src, href: r.url || '#' };
    }).filter(Boolean) as { src: string; href: string }[];
    
    setDesktopItems(built);
    setDesktopIndex(0);
  }, [rows, ignorePeriod]);

  // 아이템 빌드 (모바일용)
  React.useEffect(() => {
    const now = Date.now();
    const visible = rows.filter(r => {
      if (!r.visible) return false;
      if (!ignorePeriod && !inRange(now, r.startAt, r.endAt)) return false;
      if (r.device === 'PC') return false; // MOBILE만 또는 BOTH
      return true;
    });
    
    const built = visible.map((r) => {
      const src = r.image?.url || '';
      if (!src) return null;
      return { src, href: r.url || '#' };
    }).filter(Boolean) as { src: string; href: string }[];
    
    setMobileItems(built);
    setMobileIndex(0);
  }, [rows, ignorePeriod]);

  const desktopTotal = desktopItems.length;
  const mobileTotal = mobileItems.length;

  const goDesktop = React.useCallback((dir: 1 | -1) => {
    if (!desktopTotal) return;
    setDesktopIndex(i => (i + dir + desktopTotal) % desktopTotal);
  }, [desktopTotal]);

  const goMobile = React.useCallback((dir: 1 | -1) => {
    if (!mobileTotal) return;
    setMobileIndex(i => (i + dir + mobileTotal) % mobileTotal);
  }, [mobileTotal]);

  // 키보드 ← → (데스크탑만)
  React.useEffect(() => {
    if (!desktopOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goDesktop(-1);
      if (e.key === 'ArrowRight') goDesktop(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktopOpen, goDesktop]);

  // 모바일 스와이프
  const touchRef = React.useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchRef.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goMobile(1);
      else goMobile(-1);
    }
    touchRef.current = null;
  };

  return (
    <section className="relative rounded-xl border bg-white mb-5">
      {/* 상단 컨트롤 */}
      {showControls && (
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 border-b">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">미리보기</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>데스크탑: {desktopTotal}개</span>
              <span>|</span>
              <span>모바일: {mobileTotal}개</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(desktopTotal > 0 || mobileTotal > 0) && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {desktopTotal > 0 && (
                  <span>데스크탑: {desktopIndex + 1} / {desktopTotal}</span>
                )}
                {mobileTotal > 0 && (
                  <span>모바일: {mobileIndex + 1} / {mobileTotal}</span>
                )}
              </div>
            )}
            {(!desktopOpen || !mobileOpen) && (
              <button 
                onClick={() => {
                  setDesktopOpen(true);
                  setMobileOpen(true);
                }} 
                className="h-9 px-3 rounded-md border text-sm hover:bg-gray-50 transition-colors"
              >
                다시 보기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 미리보기 영역 - 양쪽으로 나눔 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50">
        {/* 데스크탑 미리보기 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700">데스크탑 미리보기</h3>
          </div>
          <div className="h-[600px] relative">
            <DesktopPreview
              items={desktopItems}
              index={desktopIndex}
              total={desktopTotal}
              open={desktopOpen}
              dontShowToday={desktopDontShowToday}
              onClose={() => setDesktopOpen(false)}
              onGo={goDesktop}
              onDontShowTodayChange={setDesktopDontShowToday}
            />
          </div>
        </div>

        {/* 모바일 미리보기 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700">모바일 미리보기</h3>
          </div>
          <div className="h-[600px] relative">
            <MobilePreview
              items={mobileItems}
              index={mobileIndex}
              total={mobileTotal}
              open={mobileOpen}
              dontShowToday={mobileDontShowToday}
              onClose={() => setMobileOpen(false)}
              onGo={goMobile}
              onDontShowTodayChange={setMobileDontShowToday}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
