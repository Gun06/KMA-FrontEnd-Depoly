'use client';

import Image from 'next/image';
import HeroButton from '@/components/common/Button/HeroButton';

/** API date(대회일)를 D-Day 형식으로 변환 (KMA-Mobile 동일) */
function toDFormat(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  const parsed = parseDate(value.trim());
  if (!parsed) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const days = Math.floor((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (days > 0) return `D-${days}`;
  if (days === 0) return 'D-Day';
  return `D+${-days}`;
}

function parseDate(s: string): Date | null {
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const match = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const d2 = new Date(y, m, d);
    if (!Number.isNaN(d2.getTime())) return d2;
  }
  return null;
}

interface ApiBannerSlideProps {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  date: string;
  eventId: string;
  total: number;
  currentIndex: number;
}

export default function ApiBannerSlide({
  imageUrl,
  title,
  subtitle,
  date,
  eventId,
  total,
  currentIndex,
}: ApiBannerSlideProps) {
  const hasEventId = eventId && eventId.trim() !== '';
  const SlideWrapper = hasEventId ? 'a' : 'div';
  const wrapperProps = hasEventId
    ? { href: `/event/${eventId}/guide/overview` }
    : {};

  const dateLabel = date?.trim() ? toDFormat(date) : '';
  const hasAnyText = dateLabel || (title?.trim()) || (subtitle?.trim());

  return (
    <SlideWrapper
      {...wrapperProps}
      className="relative block w-full hero-slide overflow-hidden motion-safe:transition-all motion-safe:duration-300"
      style={{ height: 'var(--heroH, clamp(220px, 48vw, 680px))' }}
    >
      <Image
        src={imageUrl || '/placeholder.svg'}
        alt={title}
        fill
        fetchPriority="auto"
        placeholder="empty"
        quality={70}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 1200px"
        className="object-cover object-center"
      />

      {/* KMA-Mobile 스타일: 하단 그라데이션 오버레이 (transparent → 0 → 0.6 black) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* 텍스트 오버레이 - KMA-Mobile처럼 왼쪽 하단 고정 */}
      {hasAnyText && (
        <div className="absolute left-4 sm:left-6 md:left-8 bottom-8 sm:bottom-10 md:bottom-12 right-4 sm:right-6 md:right-8 z-10 flex flex-col items-start text-left">
          {dateLabel && (
            <span
              className="hero-anim hero-badge inline-block px-2 py-1 rounded text-[11px] font-bold text-white mb-3"
              style={{ backgroundColor: '#FF4081' }}
            >
              {dateLabel}
            </span>
          )}
          {title?.trim() && (
            <h1 className="hero-anim hero-title text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight" style={{ letterSpacing: '-0.5px' }}>
              {title.trim()}
            </h1>
          )}
          {subtitle?.trim() && (
            <p className="hero-anim hero-date text-white/90 text-sm sm:text-base mt-2 leading-snug">
              {subtitle.trim()}
            </p>
          )}

          {/* Action buttons: 태블릿 이상에서만 노출 (KMA-Mobile에는 없음, 웹만 유지) */}
          {hasEventId && (
            <div className="hero-anim hero-buttons hidden sm:flex flex-row gap-2 md:gap-3 mt-4">
              <HeroButton
                variant="main"
                tone="blue"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>
              <HeroButton
                variant="main"
                tone="blue"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>
              <HeroButton
                variant="main"
                tone="blue"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
            </div>
          )}
        </div>
      )}

      {/* KMA-Mobile 스타일: 우하단 "1 / N" 인디케이터 (bg black/40, rounded-2xl) */}
      <div className="absolute right-5 bottom-5 z-10">
        <div className="px-3 py-1.5 rounded-[20px] bg-black/40 text-white text-xs font-medium">
          {currentIndex + 1} / {total}
        </div>
      </div>
    </SlideWrapper>
  );
}

