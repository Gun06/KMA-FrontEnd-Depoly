'use client';

import React from 'react';
import Image from 'next/image';
import type { PopupRow } from './PopupListManager';

/* ===== 튜닝 포인트 ===== */
const DESKTOP_MODAL = { width: 400, height: 560 }; // px
const MOBILE_SHEET_VH = 60;                        // 이미지 영역 높이 (vh)

/* -------- UploadItem -> src -------- */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ''));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}
function extractFileObject(f: any): File | undefined {
  return f instanceof File
    ? f
    : f?.file instanceof File
    ? f.file
    : f?.rawFile instanceof File
    ? f.rawFile
    : f?.originFileObj instanceof File
    ? f.originFileObj
    : undefined;
}
async function chooseSrc(u: any): Promise<string | null> {
  if (!u) return null;
  if (typeof u?.previewUrl === 'string' && u.previewUrl) return u.previewUrl;
  if (typeof u?.url === 'string' && /^https?:\/\//i.test(u.url)) return u.url;
  const fo = extractFileObject(u);
  if (fo) { try { return await readAsDataURL(fo); } catch { return null; } }
  return null;
}

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

  // 아이템 빌드(공개만, 기간은 옵션)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const now = Date.now();
      const visible = rows.filter(r => r.visible && (ignorePeriod ? true : inRange(now, r.startAt, r.endAt)));
      const built = (await Promise.all(
        visible.map(async (r) => {
          const src = await chooseSrc(r.image);
          if (!src) return null;
          return { src, href: r.url || '#' };
        })
      )).filter(Boolean) as { src: string; href: string }[];
      if (alive) {
        setItems(built);
        setIndex(0);
      }
    })();
    return () => { alive = false; };
  }, [rows, ignorePeriod]);

  const active = items[index] || null;
  const total = items.length;

  /* ---------- 캐러셀 네비 ---------- */
  const go = (dir: 1 | -1) => {
    if (!total) return;
    setIndex(i => (i + dir + total) % total);
  };

  // 키보드 ← → (데스크탑만)
  React.useEffect(() => {
    if (isMobileView || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileView, open, total]);

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
            {/* 데스크톱: 400×560 고정, cover, 네비 버튼 + 오늘하루 체크 */}
            {!isMobileView && (
              <div className="absolute inset-0 grid place-items-center p-[clamp(6px,1.6vw,18px)]">
                <div
                  className="relative rounded-2xl shadow-2xl overflow-hidden bg-white"
                  style={{ width: DESKTOP_MODAL.width, height: DESKTOP_MODAL.height }}
                >
                  {/* 닫기 */}
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full bg-black/80 text-white grid place-items-center z-10"
                    onClick={() => setOpen(false)}
                    aria-label="닫기"
                  >
                    ✕
                  </button>

                  {/* 좌/우 네비 (여러 개일 때만) */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={() => go(-1)}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/55 text-white grid place-items-center"
                        aria-label="이전"
                      >‹</button>
                      <button
                        onClick={() => go(1)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/55 text-white grid place-items-center"
                        aria-label="다음"
                      >›</button>
                    </>
                  )}

                  {/* 본문 이미지 */}
                  <a
                    href={active.href || '#'}
                    target={active.href && active.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    <Image
                      src={active.src}
                      alt=""
                      fill
                      unoptimized
                      sizes={`${DESKTOP_MODAL.width}px`}
                      className="object-cover"
                      priority
                    />
                  </a>

                  {/* 하단 바: 오늘 하루 보지 않음 + 닫기 */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-white/95 border-t flex items-center justify-between px-3">
                    <label className="inline-flex items-center gap-2 text-[12px] text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => setDontShowToday(e.target.checked)}
                        className="h-4 w-4"
                      />
                      오늘 하루 보지 않음
                    </label>
                    <button
                      type="button"
                      className="text-[12px] text-gray-900 font-medium"
                      onClick={() => setOpen(false)}
                    >닫기</button>
                  </div>
                </div>
              </div>
            )}

            {/* 모바일: half-sheet(60vh), 스와이프, 상단 1/N, 오늘하루 체크 */}
            {isMobileView && (
              <div className="absolute inset-x-0 bottom-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {/* 핸들 여백 최소화 */}
                <div className="relative mx-auto w-full max-w-[520px]">
                  <div className="mx-auto mt-1 mb-1 h-1 w-10 rounded-full bg-white/80" />
                </div>

                <div className="relative mx-auto w-full max-w-[520px] rounded-t-3xl shadow-2xl overflow-hidden bg-white">
                  {/* 상단 인디케이터 */}
                  {total > 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 text-[11px] px-2 py-0.5 rounded-full bg-black/60 text-white">
                      {index + 1} / {total}
                    </div>
                  )}

                  {/* 닫기 */}
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full bg-black text-white grid place-items-center z-10"
                    onClick={() => setOpen(false)}
                    aria-label="닫기"
                  >
                    ✕
                  </button>

                  <a
                    href={active.href || '#'}
                    target={active.href && active.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative w-full" style={{ height: `${MOBILE_SHEET_VH}vh` }}>
                      <Image
                        src={active.src}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 520px) 100vw, 520px"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </a>

                  <div className="flex items-center justify-between px-4 h-12 border-top border-t bg-white">
                    <label className="inline-flex items-center gap-2 text-[12px] text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => setDontShowToday(e.target.checked)}
                        className="h-4 w-4"
                      />
                      오늘 하루 보지 않음
                    </label>
                    <div className="flex items-center gap-2">
                      {total > 1 && (
                        <>
                          <button className="text-[12px]" onClick={() => go(-1)}>이전</button>
                          <button className="text-[12px]" onClick={() => go(1)}>다음</button>
                        </>
                      )}
                      <button type="button" className="text-[12px] text-gray-900 font-medium" onClick={() => setOpen(false)}>
                        닫기
                      </button>
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
