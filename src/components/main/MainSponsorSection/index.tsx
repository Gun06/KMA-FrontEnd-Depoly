'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SponsorBanner } from '@/types/event';

interface MainSponsorSectionProps {
  variant?: 'default' | 'embedded';
}

const SPONSOR_SECONDS_PER_LOGO = 2.6;
const SPONSOR_SECONDS_PER_LOGO_MOBILE = 5.0;
const SPONSOR_TRAVEL_PX_PER_LOGO = 200;
const LOGO_ROW_H_CLASS = 'h-[68px] max-h-[68px] md:h-[78px] md:max-h-[78px]';

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

  if (!loading && sponsors.length === 0) {
    return null;
  }

  const logoStrip = (
    <div
      className={`relative w-full overflow-hidden border-b-2 border-gray-200 bg-white ${LOGO_ROW_H_CLASS}`}
      role="region"
      aria-label="스폰서 배너 목록"
    >
      {!isEmbedded && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-white/36 via-white/14 to-transparent md:w-7" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-5 bg-gradient-to-l from-white/36 via-white/14 to-transparent md:w-7" />
        </>
      )}
      {loading ? (
        <ul className={`flex w-max list-none items-center gap-0 ${LOGO_ROW_H_CLASS}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={`sp-sk-${i}`} className="shrink-0 list-none">
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
  );

  if (isEmbedded) {
    return (
      <section className="m-0 w-full bg-white p-0" aria-label="스폰서">
        {logoStrip}
      </section>
    );
  }

  return (
    <section className="bg-white pt-8 pb-8" aria-label="스폰서">
      <div className="mx-auto max-w-[1920px] px-8 md:px-9 lg:px-10">
        <div className="flex items-end justify-between">
          <h2 className="font-giants text-[22px] md:text-[28px] text-gray-900">SPONSOR</h2>
        </div>
        <div className="mt-4">{logoStrip}</div>
      </div>
    </section>
  );
}

function SponsorBannerItem({ banner }: { banner: SponsorBanner }) {
  const inner = (
    <div className="flex h-full items-center">
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
    <div className="flex h-[68px] max-h-[68px] items-center overflow-hidden md:h-[78px] md:max-h-[78px]">
      <Image
        src={imageUrl}
        alt="스폰서"
        width={200}
        height={68}
        sizes="(max-width: 1023px) 28vw, 140px"
        className="block h-full max-h-full w-auto max-w-none object-contain object-center select-none"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}
