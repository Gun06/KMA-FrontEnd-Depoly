'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import MainHomeHero from '@/components/main/MainHomeHero';

const HEADER_OFFSET_VAR = 'var(--kma-main-header-offset, 64px)';
const HERO_HEIGHT_FALLBACK = 'var(--kma-main-hero-height-mobile, min(56vh, 400px))';
const HERO_MAX_HEIGHT_PC = 800;
const HERO_MAX_HEIGHT_MOBILE = 400;
const HERO_MAX_HEIGHT_TABLET = 560;
const HERO_MIN_HEIGHT_TABLET = 420;
const MOBILE_HERO_VH = 0.56;
const TABLET_HERO_VH = 0.52;
const LG_MEDIA = '(min-width: 1024px)';
const MOBILE_MEDIA = '(max-width: 639px)';
const TABLET_MEDIA = '(min-width: 640px) and (max-width: 1023px)';

interface MainHomeScrollLayoutProps {
  /** 덮개 시트: 주요대회일정·스폰서·갤러리 등 */
  children: ReactNode;
}

/**
 * - 고정 히어로(z-0)
 * - z-10 시트만 올라와 히어로를 덮음
 */
export default function MainHomeScrollLayout({ children }: MainHomeScrollLayoutProps) {
  /** 배너(.hero-section) 실제 하단 — -mt 헤더 보정으로 wrapper보다 짧음 */
  const [heroBottom, setHeroBottom] = useState(0);
  const heroMeasureRef = useRef<HTMLDivElement>(null);

  const measureHero = useCallback(() => {
    const carousel = heroMeasureRef.current?.querySelector('.hero-section') as HTMLElement | null;
    if (!carousel) return;

    const isPc = typeof window !== 'undefined' && window.matchMedia(LG_MEDIA).matches;
    const isMobile =
      typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA).matches;
    const isTablet =
      typeof window !== 'undefined' && window.matchMedia(TABLET_MEDIA).matches;

    let heightPx = Math.round(carousel.getBoundingClientRect().height);
    const offsetH = carousel.offsetHeight;
    if (offsetH > heightPx) heightPx = offsetH;

    if (isMobile) {
      heightPx = Math.max(
        heightPx,
        Math.min(Math.round(window.innerHeight * MOBILE_HERO_VH), HERO_MAX_HEIGHT_MOBILE)
      );
    } else if (isTablet) {
      heightPx = Math.min(
        Math.max(
          heightPx,
          HERO_MIN_HEIGHT_TABLET,
          Math.round(window.innerHeight * TABLET_HERO_VH)
        ),
        HERO_MAX_HEIGHT_TABLET
      );
    } else if (isPc) {
      heightPx = Math.min(heightPx, HERO_MAX_HEIGHT_PC);
    }

    if (heightPx > 0) setHeroBottom(heightPx);
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
    measureHero();

    const root = heroMeasureRef.current;
    const carousel = root?.querySelector('.hero-section');
    if (!carousel) return;

    const ro = new ResizeObserver(measureHero);
    ro.observe(carousel);
    window.addEventListener('resize', measureHero);

    const imgs = root?.querySelectorAll<HTMLImageElement>('.hero-section img') ?? [];
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', measureHero);
    });

    const t1 = window.setTimeout(measureHero, 100);
    const t2 = window.setTimeout(measureHero, 500);

    const headerEl = document.querySelector('header');
    const headerRo = headerEl ? new ResizeObserver(measureHero) : null;
    headerRo?.observe(headerEl as Element);

    return () => {
      ro.disconnect();
      headerRo?.disconnect();
      window.removeEventListener('resize', measureHero);
      imgs.forEach((img) => img.removeEventListener('load', measureHero));
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [measureHero]);

  const heroReady = heroBottom > 0;
  const stackHeightPx = heroReady ? heroBottom : 0;
  const stackH = stackHeightPx > 0 ? stackHeightPx : HERO_HEIGHT_FALLBACK;

  /** 푸터가 보이기 시작하면 고정 히어로 숨김 — 맨 아래에서 뒤 콘텐츠 비침 방지 */
  const [pinHeroLayers, setPinHeroLayers] = useState(true);

  useEffect(() => {
    const PIN_HIDE_AT = 48;
    const PIN_SHOW_AT = 112;
    let pinned = true;

    const update = () => {
      const zone = document.querySelector('[data-kma-footer-zone]');
      if (!zone) {
        const next = stackHeightPx === 0 || window.scrollY < stackHeightPx;
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
      {/* 고정 히어로 — 배너 하단까지만 (wrapper offsetHeight 여백 제거) */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-0 overflow-hidden transition-opacity duration-200 ${pinnedLayerClass}`}
        style={
          heroReady
            ? { height: heroBottom }
            : { height: 'auto', minHeight: HERO_HEIGHT_FALLBACK }
        }
      >
        <div ref={heroMeasureRef} className="pointer-events-auto w-full">
          <MainHomeHero />
        </div>
      </div>

      {/* 스크롤 여백: 히어로 높이만큼 */}
      <div className="shrink-0" style={{ height: stackH }} aria-hidden />

      {/* 덮개 시트 — 히어로 위로 겹쳐 상단 좌우 모서리가 보이게 */}
      <div className="relative z-10 -mt-6 overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_28px_rgba(0,0,0,0.12)] md:-mt-8 md:rounded-t-[32px] lg:-mt-10 lg:rounded-t-[40px]">
        {children}
      </div>
    </div>
  );
}
