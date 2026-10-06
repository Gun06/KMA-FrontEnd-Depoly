'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import MainHomeHero from '@/components/main/MainHomeHero';

const HEADER_OFFSET_VAR = 'var(--kma-main-header-offset, 64px)';

interface MainHomeScrollLayoutProps {
  /** 덮개 시트: 주요대회일정·스폰서·갤러리 등 */
  children: ReactNode;
}

/**
 * - 고정 히어로(z-0)
 * - z-10 시트만 올라와 히어로를 덮음
 */
export default function MainHomeScrollLayout({ children }: MainHomeScrollLayoutProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  /** 푸터 pin 판단용 — .kma-main-hero-height 실측 (레이아웃 높이는 CSS만 사용) */
  const [stackHeightPx, setStackHeightPx] = useState(0);

  const readSpacerHeight = () => {
    const h = spacerRef.current?.offsetHeight ?? 0;
    if (h > 0) setStackHeightPx((prev) => (prev === h ? prev : h));
  };

  useLayoutEffect(() => {
    readSpacerHeight();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    history.scrollRestoration = 'manual';
    const scrollTop = () => window.scrollTo(0, 0);
    scrollTop();
    requestAnimationFrame(scrollTop);
    const t = window.setTimeout(scrollTop, 0);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) scrollTop();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  useEffect(() => {
    const el = spacerRef.current;
    if (!el) return;

    readSpacerHeight();
    const ro = new ResizeObserver(readSpacerHeight);
    ro.observe(el);
    window.addEventListener('resize', readSpacerHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', readSpacerHeight);
    };
  }, []);

  /** 푸터가 보이기 시작하면 고정 히어로 숨김 — 맨 아래에서 뒤 콘텐츠 비침 방지 */
  const [pinHeroLayers, setPinHeroLayers] = useState(true);

  useEffect(() => {
    const PIN_HIDE_AT = 48;
    const PIN_SHOW_AT = 112;
    let pinned = true;

    const update = () => {
      const zone = document.querySelector('[data-kma-footer-zone]');
      const heroH = stackHeightPx || spacerRef.current?.offsetHeight || 0;

      if (!zone) {
        const next = heroH === 0 || window.scrollY < heroH;
        if (next !== pinned) {
          pinned = next;
          setPinHeroLayers(next);
        }
        return;
      }

      const { top } = zone.getBoundingClientRect();
      const vh = window.innerHeight;
      let next = pinned;

      if (pinned) {
        if (top <= vh - PIN_HIDE_AT) next = false;
      } else if (top > vh - PIN_SHOW_AT) {
        next = true;
      }

      if (next !== pinned) {
        pinned = next;
        setPinHeroLayers(next);
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const zone = document.querySelector('[data-kma-footer-zone]');
    const ro = zone ? new ResizeObserver(update) : null;
    ro?.observe(zone as Element);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [stackHeightPx]);

  const pinnedLayerClass = pinHeroLayers
    ? 'opacity-100'
    : 'pointer-events-none invisible opacity-0';

  return (
    <div
      className="relative w-full"
      style={{ marginTop: `calc(-1 * ${HEADER_OFFSET_VAR})` }}
    >
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-0 overflow-hidden transition-opacity duration-200 kma-main-hero-height ${pinnedLayerClass}`}
      >
        <div className="pointer-events-auto h-full w-full">
          <MainHomeHero />
        </div>
      </div>

      <div ref={spacerRef} className="kma-main-hero-height shrink-0" aria-hidden />

      <div className="relative z-10 -mt-5 overflow-hidden rounded-t-[22px] bg-white shadow-[0_-6px_22px_rgba(0,0,0,0.1)] sm:-mt-6 sm:rounded-t-3xl sm:shadow-[0_-8px_28px_rgba(0,0,0,0.12)] md:-mt-8 md:rounded-t-[32px] lg:-mt-10 lg:rounded-t-[40px]">
        {children}
      </div>
    </div>
  );
}
