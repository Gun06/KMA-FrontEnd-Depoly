'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SponsorBanner } from '@/types/event';

interface MainSponsorSectionProps {
  variant?: 'default' | 'embedded';
}

const SPONSOR_SECONDS_PER_LOGO = 2.0;
const SPONSOR_SECONDS_PER_LOGO_MOBILE = 4.0;
const SPONSOR_TRAVEL_PX_PER_LOGO = 200;
const LOGO_ROW_H_CLASS = 'h-[60px] max-h-[60px] md:h-[70px] md:max-h-[70px]';
const ITEM_SIDE_PAD_CLASS = '';

/** 주요 대회 일정 `ul` px와 동일 — 고정 칸(회전해도 왼쪽 여백 유지) */
const EMBEDDED_GUTTER = 'shrink-0 w-4 md:w-6 lg:w-[6vw]';
const DEFAULT_GUTTER = 'shrink-0 w-[18px] md:w-[82px]';

export default function MainSponsorSection({ variant = 'default' }: MainSponsorSectionProps) {
  const [items, setItems] = useState<SponsorBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  const sponsors = useMemo(
    () => items.filter((b, i, arr) => arr.findIndex((o) => o.imageUrl === b.imageUrl) === i),
    [items]
  );

  const loop = useMemo(() => {
    if (sponsors.length === 0) return [];
    return Array.from(
      { length: Math.max(16, sponsors.length * 4) },
      (_, i) => sponsors[i % sponsors.length]
    );
  }, [sponsors]);

  useEffect(() => {
    if (!marqueeRef.current || !listRef.current || loop.length === 0) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let raf = 0;
    let offset = 0;
    let listWidth = listRef.current.scrollWidth;
    let speedPerMs = 0;
    let lastTs = 0;

    const updateMetrics = () => {
      if (!listRef.current) return;
      listWidth = listRef.current.scrollWidth;
      const gapPx = Number.parseFloat(getComputedStyle(listRef.current).columnGap || '0') || 0;
      /**
       * 로고 실제 렌더폭은 배너별 비율 차이가 커서 첫 아이템 기준 계산 시 체감 속도가 흔들림.
       * 스폰서는 "로고 1개 슬롯(220px)" 기준으로 고정해 섹션 속도를 안정화한다.
       */
      const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
      const secondsPerLogo = isMobile ? SPONSOR_SECONDS_PER_LOGO_MOBILE : SPONSOR_SECONDS_PER_LOGO;
      const travelPx = SPONSOR_TRAVEL_PX_PER_LOGO + gapPx;
      speedPerMs = travelPx > 0 ? travelPx / (secondsPerLogo * 1000) : 0;
    };
    updateMetrics();

    const ro = new ResizeObserver(updateMetrics);
    ro.observe(listRef.current);

    const tick = (ts: number) => {
      if (!marqueeRef.current || listWidth <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (lastTs === 0) lastTs = ts;
      const delta = ts - lastTs;
      lastTs = ts;

      if (speedPerMs > 0) {
        offset -= delta * speedPerMs;
        if (Math.abs(offset) >= listWidth) offset += listWidth;
        marqueeRef.current.style.transform = `translate3d(${offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [loop.length]);

  const isEmbedded = variant === 'embedded';
  const gutterClass = isEmbedded ? EMBEDDED_GUTTER : DEFAULT_GUTTER;

  if (!loading && sponsors.length === 0) {
    return null;
  }

  return (
    <section className={`bg-white ${isEmbedded ? 'pt-0 pb-5' : 'pt-8 pb-8'}`} aria-labelledby="main-sponsor-heading">
      <div className={isEmbedded ? 'w-full' : 'mx-auto max-w-[1920px] px-8 md:px-9 lg:px-10'}>
        <div className="flex items-end justify-between">
          <h2 id="main-sponsor-heading" className="font-giants text-[22px] md:text-[28px] text-gray-900">
            SPONSOR
          </h2>
          <span className="invisible text-xs font-medium" aria-hidden>
            더보기 &gt;
          </span>
        </div>
      </div>

      <div className={isEmbedded ? 'mt-4 -mx-4 md:-mx-6 lg:-mx-[6vw]' : 'mt-4'}>
        <div className="flex" role="region" aria-label="스폰서 배너 목록">
          <div className={gutterClass} aria-hidden />
          <div
            className={`relative min-w-0 flex-1 overflow-hidden ${LOGO_ROW_H_CLASS}`}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-white/36 via-white/14 to-transparent md:w-7" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-5 bg-gradient-to-l from-white/36 via-white/14 to-transparent md:w-7" />
            {loading ? (
              <ul className={`flex w-max list-none items-center gap-0 ${LOGO_ROW_H_CLASS}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <li key={`sp-sk-${i}`} className={`shrink-0 list-none ${ITEM_SIDE_PAD_CLASS}`}>
                    <div className="h-full w-24 animate-pulse rounded bg-gray-200 md:w-28" />
                  </li>
                ))}
              </ul>
            ) : (
              <div ref={marqueeRef} className={`flex w-max will-change-transform ${LOGO_ROW_H_CLASS}`}>
                <ul ref={listRef} className={`m-0 flex list-none items-center gap-0 ${LOGO_ROW_H_CLASS}`}>
                  {loop.map((banner, idx) => (
                    <SponsorBannerItem key={`a-${banner.orderNo}-${idx}`} banner={banner} />
                  ))}
                </ul>
                <ul className={`m-0 flex list-none items-center gap-0 ${LOGO_ROW_H_CLASS}`} aria-hidden>
                  {loop.map((banner, idx) => (
                    <SponsorBannerItem key={`b-${banner.orderNo}-${idx}`} banner={banner} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SponsorBannerItem({ banner }: { banner: SponsorBanner }) {
  const inner = (
    <div className={`flex h-full items-center ${ITEM_SIDE_PAD_CLASS}`}>
      <SponsorLogo imageUrl={banner.imageUrl} />
    </div>
  );

  return (
    <li className={`m-0 shrink-0 list-none p-0 pr-2 md:pr-3 ${LOGO_ROW_H_CLASS}`}>
      {banner.url?.trim() ? (
        <a
          href={banner.url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-opacity hover:opacity-90"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

function SponsorLogo({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="flex h-[60px] max-h-[60px] items-center overflow-hidden md:h-[70px] md:max-h-[70px]">
      <Image
        src={imageUrl}
        alt="스폰서"
        width={200}
        height={60}
        sizes="(max-width: 1023px) 28vw, 140px"
        className="block h-full max-h-full w-auto max-w-none object-contain object-center select-none"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}
