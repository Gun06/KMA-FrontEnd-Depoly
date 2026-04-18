'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SponsorBanner } from '@/types/event';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/** 기존 대비 약 1/3 축소(세로 기준) */
const STRIP_H_PX = Math.round(76 * (2 / 3));
const MARQUEE_SPEED = 0.85;

/**
 * 우측 플로팅 스폰서(`FloatingPanels`, lg 이상)가 없을 때만 보이도록 `lg:hidden`.
 * 메인 홈 주요대회일정 위 — 가로 무한 순환, 세로 STRIP 높이에 맞춰 원본 비율(object-contain).
 */
export default function MainSponsorMarqueeStrip() {
  const [items, setItems] = useState<SponsorBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const isLgUp = useMediaQuery('(min-width: 1024px)');

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
    if (!API_BASE_URL) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/public/main-page/main-sponsor`, {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        });
        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }
        const data: SponsorBanner[] = await res.json();
        if (!cancelled) {
          setItems(
            data
              .filter((b) => b.visible)
              .sort((a, b) => a.orderNo - b.orderNo)
          );
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unique = useMemo(
    () => items.filter((b, i, arr) => arr.findIndex((o) => o.imageUrl === b.imageUrl) === i),
    [items]
  );

  const loop = useMemo(() => {
    if (unique.length === 0) return [];
    return Array.from({ length: Math.max(16, unique.length * 4) }, (_, i) => unique[i % unique.length]);
  }, [unique]);

  useEffect(() => {
    if (isLgUp || !marqueeRef.current || !listRef.current || loop.length === 0) return;

    let raf = 0;
    let offset = 0;
    let listWidth = listRef.current.scrollWidth;

    const updateWidth = () => {
      if (!listRef.current) return;
      listWidth = listRef.current.scrollWidth;
    };

    const ro = new ResizeObserver(updateWidth);
    ro.observe(listRef.current);

    const tick = () => {
      if (!marqueeRef.current || listWidth <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      offset -= MARQUEE_SPEED;
      if (Math.abs(offset) >= listWidth) offset += listWidth;
      marqueeRef.current.style.transform = `translate3d(${offset}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isLgUp, loop.length]);

  if (!loading && unique.length === 0) {
    return null;
  }

  const fadeW = 'clamp(12px, 4vw, 40px)';

  return (
    <section
      aria-label="스폰서"
      className="main-home-sponsor-strip relative border-b border-zinc-100 bg-white lg:hidden"
      style={
        {
          ['--strip-h']: `${STRIP_H_PX}px`,
          ['--fade-w']: fadeW,
        } as React.CSSProperties
      }
    >
      <div
        className="relative z-10 overflow-hidden"
        style={{ height: 'var(--strip-h)', minHeight: 'var(--strip-h)' }}
      >
        {loading && (
          <div className="flex h-full items-center justify-center gap-0 px-2" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[calc(var(--strip-h)-10px)] w-14 shrink-0 animate-pulse rounded-sm bg-zinc-100"
              />
            ))}
          </div>
        )}

        {!loading && loop.length > 0 && (
          <div className="absolute inset-0 flex items-center overflow-hidden">
            <div
              ref={marqueeRef}
              className="flex h-full w-max items-center will-change-transform"
            >
              <ul ref={listRef} className="m-0 flex h-full list-none items-center gap-0 p-0">
                {loop.map((banner, idx) => (
                  <li
                    key={`a-${banner.orderNo}-${idx}`}
                    className="m-0 flex h-full shrink-0 list-none items-center p-0"
                  >
                    {banner.url?.trim() ? (
                      <a
                        href={banner.url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full max-h-full items-center"
                      >
                        <Image
                          src={banner.imageUrl}
                          alt="스폰서"
                          width={200}
                          height={STRIP_H_PX}
                          sizes="(max-width: 1023px) 28vw, 140px"
                          className="block h-full max-h-full w-auto max-w-none object-contain object-center select-none"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </a>
                    ) : (
                      <Image
                        src={banner.imageUrl}
                        alt="스폰서"
                        width={200}
                        height={STRIP_H_PX}
                        sizes="(max-width: 1023px) 28vw, 140px"
                        className="h-full max-h-full w-auto max-w-none object-contain object-center select-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    )}
                  </li>
                ))}
              </ul>
              <ul className="m-0 flex h-full list-none items-center gap-0 p-0" aria-hidden>
                {loop.map((banner, idx) => (
                  <li
                    key={`b-${banner.orderNo}-${idx}`}
                    className="m-0 flex h-full shrink-0 list-none items-center p-0"
                  >
                    {banner.url?.trim() ? (
                      <a
                        href={banner.url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full max-h-full items-center"
                      >
                        <Image
                          src={banner.imageUrl}
                          alt=""
                          width={200}
                          height={STRIP_H_PX}
                          sizes="(max-width: 1023px) 28vw, 140px"
                          className="block h-full max-h-full w-auto max-w-none object-contain object-center select-none"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </a>
                    ) : (
                      <Image
                        src={banner.imageUrl}
                        alt=""
                        width={200}
                        height={STRIP_H_PX}
                        sizes="(max-width: 1023px) 28vw, 140px"
                        className="block h-full max-h-full w-auto max-w-none object-contain object-center select-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20"
        style={{
          width: 'var(--fade-w)',
          background:
            'linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.65) 55%, transparent 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-20"
        style={{
          width: 'var(--fade-w)',
          background:
            'linear-gradient(to left, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.65) 55%, transparent 100%)',
        }}
        aria-hidden
      />

      <style jsx global>{`
        .main-home-sponsor-strip a {
          pointer-events: auto;
        }
        .main-home-sponsor-strip img {
          pointer-events: none;
          -webkit-user-drag: none;
          user-select: none;
        }
      `}</style>
    </section>
  );
}
