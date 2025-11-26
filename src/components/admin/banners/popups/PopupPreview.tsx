'use client';

import React from 'react';
import Image from 'next/image';
import type { PopupRow } from './PopupListManager';



/* -------- 기간 체크(미리보기 기본 무시) -------- */
function inRange(now: number, start?: string, end?: string) {
  if (!start && !end) return true;
  const s = start ? new Date(start).getTime() : -Infinity;
  const e = end ? new Date(end).getTime() :  Infinity;
  return now >= s && now <= e;
}

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
  const [items, setItems] = React.useState<{ src: string; href: string }[]>([]);
  const [view, setView] = React.useState<'desktop' | 'mobile'>(() => (defaultView === 'mobile' ? 'mobile' : 'desktop'));
  const [open, setOpen] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  const [dontShowToday, setDontShowToday] = React.useState(false); // 프리뷰용 토글

  const isMobileView = view === 'mobile';

  // auto: 현재 뷰포트로 초기값 결정
  React.useEffect(() => {
    if (defaultView !== 'auto') return;
    const mq = window.matchMedia('(max-width: 767px)');
    setView(mq.matches ? 'mobile' : 'desktop');
    const on = (e: MediaQueryListEvent) => setView(e.matches ? 'mobile' : 'desktop');
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [defaultView]);

  // 아이템 빌드(공개만, 기간은 옵션, 디바이스별 필터링)
  React.useEffect(() => {
    const now = Date.now();
    const visible = rows.filter(r => {
      // 공개 여부 체크
      if (!r.visible) return false;
      
      // 기간 체크 (옵션)
      if (!ignorePeriod && !inRange(now, r.startAt, r.endAt)) return false;
      
      // 디바이스별 필터링
      if (r.device === 'PC' && isMobileView) return false;      // PC 전용은 모바일에서 숨김
      if (r.device === 'MOBILE' && !isMobileView) return false; // 모바일 전용은 데스크탑에서 숨김
      // device === 'ALL'인 경우는 모든 디바이스에서 표시
      
      return true;
    });
    
    const built = visible.map((r) => {
      // 스폰서와 동일하게 r.url 직접 사용 (UploadItem의 url 필드)
      const src = r.image?.url || '';
      if (!src) return null;
      return { src, href: r.url || '#' };
    }).filter(Boolean) as { src: string; href: string }[];
    
    setItems(built);
    setIndex(0);
  }, [rows, ignorePeriod, isMobileView]);

  const active = items[index] || null;
  const total = items.length;

  /* ---------- 캐러셀 네비 ---------- */
  const go = React.useCallback((dir: 1 | -1) => {
    if (!total) return;
    setIndex(i => (i + dir + total) % total);
  }, [total]);

  // 키보드 ← → (데스크탑만)
  React.useEffect(() => {
    if (isMobileView || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileView, open, go]);

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
      if (dx < 0) go(1);
      else go(-1);
    }
    touchRef.current = null;
  };

  return (
    <section className="relative rounded-xl border bg-white mb-5">
      {/* 상단 컨트롤 */}
      {showControls && (
        <div className="flex items-center justify-between p-3 flex-wrap gap-3">
          <div className="rounded-lg border bg-white p-1 inline-flex gap-1">
            <button
              onClick={() => setView('desktop')}
              className={`px-3 h-9 rounded-md text-sm ${!isMobileView ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
            >
              데스크톱 미리보기
            </button>
            <button
              onClick={() => setView('mobile')}
              className={`px-3 h-9 rounded-md text-sm ${isMobileView ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
            >
              모바일 미리보기
            </button>
          </div>

          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="text-sm text-gray-600">{index + 1} / {total}</span>
            )}
            {!open && (
              <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md border text-sm">
                다시 보기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 캔버스 */}
      <div className="relative bg-gray-200 h-[100vh] rounded-b-xl overflow-hidden">
        {!active && (
          <div className="absolute inset-0 grid place-items-center text-gray-600 text-sm">
            노출할 팝업이 없습니다. (미리보기는 기간을 무시합니다)
          </div>
        )}

        {active && open && (
          <>
            {/* 데스크톱: 메인 사이트와 동일한 스타일 */}
            {!isMobileView && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 p-4">
                <div className="relative w-full max-w-[400px] h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* 닫기 버튼 */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                    aria-label="닫기"
                  >
                    ✕
                  </button>

                  {/* 네비게이션 버튼 (여러 개일 때만) */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={() => go(-1)}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label="이전"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => go(1)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label="다음"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* 이미지 */}
                  <a
                    href={active.href || '#'}
                    target={active.href && active.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block w-full h-full relative"
                  >
                    <Image
                      src={active.src}
                      alt="팝업 이미지"
                      fill
                      className="object-cover"
                      priority
                      sizes="400px"
                      onError={(e) => {
                        // 이미지 로드 실패 시 에러 메시지 표시
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
                  </a>

                  {/* 하단 컨트롤 */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/95 border-t flex items-center justify-between px-3">
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => setDontShowToday(e.target.checked)}
                        className="w-4 h-4"
                      />
                      오늘 하루 보지 않음
                    </label>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 모바일: 미리보기 영역 안에 표시 */}
            {isMobileView && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="relative w-full max-w-sm mx-auto"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                {/* 핸들 */}
                <div className="flex justify-center mb-1 px-4">
                  <div className="w-10 h-1 rounded-full bg-white/80" />
                </div>

                <div className="relative w-full rounded-t-3xl shadow-2xl overflow-hidden bg-white">
                  {/* 상단 인디케이터 */}
                  {total > 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
                      {index + 1} / {total}
                    </div>
                  )}

                  {/* 닫기 버튼 */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-2.5 top-2.5 z-20 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"
                    aria-label="닫기"
                  >
                    ✕
                  </button>

                  {/* 이미지 */}
                  <a
                    href={active.href || '#'}
                    target={active.href && active.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block relative"
                  >
                    <div className="relative w-full h-[40vh] min-h-[250px] max-h-[350px]">
                      <Image
                        src={active.src}
                        alt="팝업 이미지"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 520px) 100vw, 520px"
                        onError={(e) => {
                          // 이미지 로드 실패 시 에러 메시지 표시
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

                  {/* 하단 컨트롤 */}
                  <div className="flex items-center justify-between px-4 h-12 border-t bg-white">
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => setDontShowToday(e.target.checked)}
                        className="w-4 h-4"
                      />
                      오늘 하루 보지 않음
                    </label>
                    <div className="flex items-center gap-2">
                      {total > 1 && (
                        <>
                          <button
                            onClick={() => go(-1)}
                            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            이전
                          </button>
                          <button
                            onClick={() => go(1)}
                            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            다음
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setOpen(false)}
                        className="text-xs text-gray-900 font-medium hover:text-gray-700 transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
