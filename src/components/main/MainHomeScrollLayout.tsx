'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import MainHomeHero from '@/components/main/MainHomeHero';

const HEADER_OFFSET_VAR = 'var(--kma-main-header-offset, 64px)';
const HERO_HEIGHT_FALLBACK = 'min(62vh, 398px)';
/** 히어로·스폰서 사이 회색 구분 (MainSectionDivider와 동일) */
const HERO_SPONSOR_DIVIDER_PX = 8;

interface MainHomeScrollLayoutProps {
  /** 히어로 바로 아래. 덮개 시트(children)에는 없음 — 스크롤해도 시트와 같이 올라가지 않음 */
  belowHero?: ReactNode;
  /** 덮개 시트: 주요대회일정·갤러리 등 */
  children: ReactNode;
}

/**
 * WIP 메인과 동일 원리 + 스폰서 밴드
 * - 고정 히어로(z-0)
 * - 고정 스폰서(z-[5]): 히어로 바로 아래, 문서 스크롤·시트와 분리
 * - z-10 시트만 올라와 히어로·스폰서를 덮음 (시트 안에 스폰서 없음)
 */
export default function MainHomeScrollLayout({ belowHero, children }: MainHomeScrollLayoutProps) {
  /** 배너(.hero-section) 실제 하단 — -mt 헤더 보정으로 wrapper보다 짧음 */
  const [heroBottom, setHeroBottom] = useState(0);
  const [sponsorHeight, setSponsorHeight] = useState(0);
  const heroMeasureRef = useRef<HTMLDivElement>(null);
  const sponsorMeasureRef = useRef<HTMLDivElement>(null);

  const measureHero = useCallback(() => {
    const carousel = heroMeasureRef.current?.querySelector('.hero-section') as HTMLElement | null;
    if (!carousel) return;
    const bottom = Math.round(carousel.getBoundingClientRect().bottom);
    if (bottom > 0) setHeroBottom(bottom);
  }, []);

  useEffect(() => {
    measureHero();

    const root = heroMeasureRef.current;
    const carousel = root?.querySelector('.hero-section');
    if (!carousel) return;

    const ro = new ResizeObserver(measureHero);
    ro.observe(carousel);
    window.addEventListener('resize', measureHero);

    const imgs = root?.querySelectorAll('.hero-section img') ?? [];
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', measureHero);
    });

    const t1 = window.setTimeout(measureHero, 100);
    const t2 = window.setTimeout(measureHero, 500);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureHero);
      imgs.forEach((img) => img.removeEventListener('load', measureHero));
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [measureHero]);

  useEffect(() => {
    if (!belowHero) {
      setSponsorHeight(0);
      return;
    }

    const el = sponsorMeasureRef.current;
    if (!el) return;

    const update = () => setSponsorHeight(el.offsetHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [belowHero]);

  const heroReady = heroBottom > 0;
  const dividerTop = heroBottom;
  const sponsorTop = heroBottom + HERO_SPONSOR_DIVIDER_PX;

  const stackH =
    heroReady && sponsorHeight > 0
      ? heroBottom + HERO_SPONSOR_DIVIDER_PX + sponsorHeight
      : heroReady
        ? heroBottom
        : HERO_HEIGHT_FALLBACK;

  return (
    <div
      className="relative w-full"
      style={{ marginTop: `calc(-1 * ${HEADER_OFFSET_VAR})` }}
    >
      {/* 고정 히어로 — 배너 하단까지만 (wrapper offsetHeight 여백 제거) */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 overflow-hidden"
        style={heroReady ? { height: heroBottom } : { height: HERO_HEIGHT_FALLBACK }}
      >
        <div ref={heroMeasureRef} className="pointer-events-auto w-full">
          <MainHomeHero />
        </div>
      </div>

      {/* 히어로·스폰서 사이 회색 구분선만 */}
      {belowHero && heroReady ? (
        <div
          className="fixed inset-x-0 z-[5] h-2 shrink-0 bg-[#F2F4F6]"
          style={{ top: dividerTop }}
          aria-hidden
        />
      ) : null}

      {/* 고정 스폰서 */}
      {belowHero ? (
        <div
          ref={sponsorMeasureRef}
          className="fixed inset-x-0 z-[5] m-0 bg-white p-0"
          style={heroReady ? { top: sponsorTop } : undefined}
        >
          {belowHero}
        </div>
      ) : null}

      {/* 스크롤 여백: 히어로+구분+스폰서 */}
      <div className="shrink-0" style={{ height: stackH }} aria-hidden />

      {/* 덮개 시트 — 상단 좌우 모서리 둥글게 */}
      <div className="relative z-10 overflow-hidden rounded-t-2xl bg-white shadow-[0_-10px_36px_rgba(0,0,0,0.06)] md:rounded-t-3xl">
        {children}
      </div>
    </div>
  );
}
