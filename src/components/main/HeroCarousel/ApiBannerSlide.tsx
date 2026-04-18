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

/** D-Day 뱃지가 비어도 대회일이 보이도록 YYYY.MM.DD (파싱 실패 시 원문) */
function formatBannerDisplayDate(value: string): string {
  const t = value.trim();
  if (!t) return '';
  const parsed = parseDate(t);
  if (!parsed) return t;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function toDateOnlyIso(parsed: Date): string {
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const HERO_TEXT_SHADOW =
  '[text-shadow:0_2px_24px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.75)]';

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
  const overviewHref = hasEventId ? `/event/${eventId.trim()}/guide/overview` : '';
  const SlideWrapper = hasEventId ? 'a' : 'div';
  const wrapperProps = hasEventId ? { href: overviewHref } : {};

  const trimmedDate = date?.trim() ?? '';
  const parsedBannerDate = trimmedDate ? parseDate(trimmedDate) : null;
  const dDayLabel = trimmedDate ? toDFormat(trimmedDate) : '';
  const displayDate = trimmedDate ? formatBannerDisplayDate(trimmedDate) : '';
  const hasDateRow = Boolean(dDayLabel || displayDate);
  const hasAnyText = hasDateRow || Boolean(title?.trim()) || Boolean(subtitle?.trim());
  const showOverlay = hasAnyText || hasEventId;

  const safeIndex =
    typeof currentIndex === 'number' && Number.isFinite(currentIndex) && currentIndex >= 0 && currentIndex < total
      ? currentIndex
      : 0;

  return (
    <SlideWrapper
      {...wrapperProps}
      className="relative block w-full h-full hero-slide overflow-hidden"
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

      {/* 전면 검정 반투명 (카드 오버레이와 톤 통일) */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/45"
        aria-hidden
      />

      {/* 텍스트 오버레이 — 모바일·태블릿: 좌측 하단 / 데스크톱: 투르 드 프랑스형 좌상단(≈left 10%, 세로는 히어로 비율+헤더 안전) */}
      {showOverlay && (
        <div
          className="absolute left-3 right-4 top-[calc(var(--kma-main-header-offset,64px)+0.75rem)] z-10 flex max-w-[min(100%,1000px)] flex-col items-start pb-[clamp(6.75rem,28vw,10rem)] text-left sm:left-4 sm:right-6 sm:top-[calc(var(--kma-main-header-offset,64px)+0.9rem)] md:left-5 md:right-8 md:top-[calc(var(--kma-main-header-offset,64px)+1.05rem)] lg:right-auto lg:left-[6%] lg:top-[max(24%,calc(var(--kma-main-header-offset,64px)+1rem))] lg:max-w-[min(1000px,64vw)] lg:px-0 lg:pb-0 xl:top-[max(26%,calc(var(--kma-main-header-offset,64px)+1.25rem))]"
        >
          {hasDateRow && (
            <div className="hero-anim hero-badge mb-2 flex flex-col items-start gap-1.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
              {dDayLabel ? (
                <span
                  className="inline-flex shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold leading-none text-white sm:px-3.5 sm:py-2 sm:text-sm md:text-base font-pretendard-bold"
                  style={{ backgroundColor: '#FF4081' }}
                >
                  {dDayLabel}
                </span>
              ) : null}
              {displayDate ? (
                <time
                  dateTime={parsedBannerDate ? toDateOnlyIso(parsedBannerDate) : undefined}
                  className={`font-pretendard text-[13px] font-semibold tracking-wide text-white sm:text-base lg:text-lg xl:text-xl ${HERO_TEXT_SHADOW}`}
                >
                  {displayDate}
                </time>
              ) : null}
            </div>
          )}
          {title?.trim() && (
            <h1
              className={`hero-anim hero-title font-giants text-[clamp(1.0625rem,4.2vw+0.55rem,1.625rem)] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-3xl sm:leading-tight sm:tracking-[-0.025em] md:text-4xl md:leading-[1.1] lg:text-5xl lg:leading-[1.06] xl:text-[3.125rem] 2xl:text-[3.375rem] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] sm:[-webkit-line-clamp:2] [-webkit-box-orient:vertical] ${HERO_TEXT_SHADOW}`}
            >
              {title.trim()}
            </h1>
          )}
          {subtitle?.trim() && (
            <p
              className={`hero-anim hero-date font-pretendard mt-1.5 max-w-prose text-[0.9375rem] font-medium leading-snug text-white sm:mt-3 sm:text-lg sm:leading-relaxed md:text-xl lg:mt-4 lg:text-xl xl:text-2xl ${HERO_TEXT_SHADOW} line-clamp-2 sm:line-clamp-none`}
            >
              {subtitle.trim()}
            </p>
          )}

          {hasEventId ? (
            <span className="hero-anim hero-readmore pointer-events-none mt-3 inline-flex items-center justify-center rounded-md bg-[#FFED00] px-4 py-2 font-pretendard-bold text-xs font-bold uppercase tracking-[0.12em] text-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:mt-5 sm:px-6 sm:py-3 sm:text-base sm:tracking-[0.14em]">
              READ MORE
            </span>
          ) : null}

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
      {total > 0 && (
        <div className="absolute right-3 z-10 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:right-5 sm:bottom-5">
          <div className="rounded-[20px] bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white sm:px-3 sm:py-1.5 sm:text-xs">
            {safeIndex + 1} / {total}
          </div>
        </div>
      )}
    </SlideWrapper>
  );
}

