'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import EventCard from '@/components/main/EventSection/EventCard';
import type {
  BlockEventItem,
  MainPageAdvertiseItem,
  MainPagePopularAdvertiseItem,
  SponsorBanner,
} from '@/types/event';
import MarathonHeroCarousel from '@/components/main/HeroCarousel/HeroCarousel';
import { blockListDisplayImageSrc } from '@/services/schedule';

const ADV_PAGE_SIZE = 3;
const ADV_ROTATE_MS = 4500;

/** 메인·마감임박 광고 배너 설계 해상도 332×166 */
const SIDEBAR_AD_ASPECT_CLASS = 'aspect-[332/166]';

function formatEventDate(value: string | undefined): string {
  if (!value?.trim()) return '';
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) return value.trim();
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function eventHref(e: BlockEventItem): string | undefined {
  if (e.eventUrl?.trim()) {
    const u = e.eventUrl.trim();
    if (u.startsWith('/')) return u;
    return u;
  }
  if (e.eventId?.trim()) return `/event/${e.eventId.trim()}`;
  return undefined;
}

function isExternalHref(href: string | undefined): boolean {
  return !!href && /^https?:\/\//i.test(href);
}

function parseAdvertiseResponse(json: unknown): MainPageAdvertiseItem[] {
  if (Array.isArray(json)) {
    return json as MainPageAdvertiseItem[];
  }
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    const inner = o.content ?? o.data ?? o.items;
    if (Array.isArray(inner)) return inner as MainPageAdvertiseItem[];
  }
  return [];
}

function advertiseHref(item: MainPageAdvertiseItem): string | undefined {
  return item.eventId?.trim() !== ''
    ? `/event/${item.eventId.trim()}`
    : undefined;
}

/** 백엔드 필드명(camel/snake/래핑) 차이 흡수 */
function normalizePopularAdvertiseRaw(
  raw: unknown
): MainPagePopularAdvertiseItem | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  };
  const url = pick(
    'url',
    'imageUrl',
    'bannerUrl',
    'image_url',
    'banner_url',
    'imageURL'
  );
  if (!url) return null;
  const eventId = pick('eventId', 'event_id');
  const deadline = pick(
    'deadline',
    'registDeadline',
    'regist_deadline',
    'registrationDeadline',
    'registerDeadline'
  );
  const startTime = pick(
    'startTime',
    'start_time',
    'eventStartTime',
    'event_start_time'
  );
  const eventName = pick('eventName', 'event_name', 'name', 'nameKr', 'title');

  let registrationCount: number | undefined;
  const rc = r.registrationCount ?? r.registration_count;
  if (typeof rc === 'number' && Number.isFinite(rc)) {
    registrationCount = rc;
  }

  return {
    eventId,
    url,
    deadline: deadline || startTime,
    startTime: startTime || deadline,
    eventName,
    registrationCount,
  };
}

/** approach 응답에서 유효 항목만 최대 `limit`개 */
function parsePopularAdvertiseList(
  json: unknown,
  limit: number
): MainPagePopularAdvertiseItem[] {
  const out: MainPagePopularAdvertiseItem[] = [];
  const push = (raw: unknown, type?: MainPagePopularAdvertiseItem['type']) => {
    const n = normalizePopularAdvertiseRaw(raw);
    if (n && out.length < limit) {
      out.push(type ? { ...n, type } : n);
    }
  };

  const pickType = (raw: Record<string, unknown>) => {
    const t = raw.type;
    if (t === 'REGISTRATION' || t === 'D_DAY') return t;
    return undefined;
  };

  if (json == null) return out;

  if (Array.isArray(json)) {
    for (const el of json) {
      push(el);
      if (out.length >= limit) break;
    }
    return out;
  }

  if (typeof json === 'object') {
    const o = json as Record<string, unknown>;
    const responseType = pickType(o);

    // { type, bannerInfo: {...} }
    if (o.bannerInfo != null) {
      push(o.bannerInfo, responseType);
      if (out.length >= limit) return out.slice(0, limit);
    }

    const direct = normalizePopularAdvertiseRaw(o);
    if (direct) {
      out.push(responseType ? { ...direct, type: responseType } : direct);
      return out.slice(0, limit);
    }

    const inner = o.content ?? o.data ?? o.items ?? o.result ?? o.body;
    if (Array.isArray(inner)) {
      for (const el of inner) {
        push(el, responseType);
        if (out.length >= limit) break;
      }
      return out;
    }
    const single = normalizePopularAdvertiseRaw(inner);
    if (single) {
      out.push(responseType ? { ...single, type: responseType } : single);
    }

    if (out.length < limit) {
      for (const v of Object.values(o)) {
        if (Array.isArray(v)) {
          for (const el of v) {
            push(el, responseType);
            if (out.length >= limit) break;
          }
        }
        if (out.length >= limit) break;
      }
    }
  }

  if (out.length === 0) {
    const list = parseAdvertiseResponse(json);
    for (const row of list) {
      push(row);
      if (out.length >= limit) break;
    }
  }

  return out.slice(0, limit);
}

/** 접수/개최 기준일이 지났는지 판별 (D-day 숫자 표시 없이 만료 UI만 사용) */
function isDeadlineExpired(deadlineIso: string | undefined): boolean {
  if (!deadlineIso?.trim()) return true;
  let s = deadlineIso.trim();
  if (!s.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(s)) {
    s = `${s}Z`;
  }
  const end = new Date(s).getTime();
  if (Number.isNaN(end)) return true;
  return end <= Date.now();
}

/** 마감임박 1건: 배너 이미지 (검정 패널·D-day 없음) */
function PopularDeadlineBanner({
  item,
  loading,
  variant = 'default',
}: {
  item: MainPagePopularAdvertiseItem | null;
  loading: boolean;
  variant?: 'default' | 'mobile' | 'mobileCompact' | 'mobileDesktopLike';
}) {
  const isMobile =
    variant === 'mobile' ||
    variant === 'mobileCompact' ||
    variant === 'mobileDesktopLike';
  const isCompactMobile = variant === 'mobileCompact';
  const isDesktopLikeMobile = variant === 'mobileDesktopLike';
  const isDdayType = item?.type === 'D_DAY';
  const countdownIso = isDdayType
    ? item?.startTime || item?.deadline
    : item?.deadline || item?.startTime;
  const expired = isDeadlineExpired(countdownIso);
  const statusLabel = expired
    ? isDdayType
      ? '개최일 지남'
      : '접수 마감'
    : isDdayType
      ? '개최 임박'
      : '접수마감 임박';

  const href =
    !loading && item?.url?.trim() ? advertiseHref(item) : undefined;

  const shellClassName = cn(
    'w-full',
    isDesktopLikeMobile
      ? 'max-w-[min(52vw,10.25rem)] origin-top-left sm:max-w-[min(48vw,12.5rem)]'
      : !isMobile && 'max-w-[332px]'
  );

  const imageFrameClassName = cn(
    'relative w-full overflow-hidden rounded-2xl',
    isCompactMobile ? 'aspect-[17/12]' : SIDEBAR_AD_ASPECT_CLASS,
    isMobile && !isDesktopLikeMobile && 'rounded-2xl',
    !isMobile && 'ring-1 ring-white/15'
  );

  if (loading) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={shellClassName} aria-busy="true" aria-label="마감임박 대회 로딩">
          <div
            className={cn(
              imageFrameClassName,
              'animate-pulse bg-white/15 ring-1 ring-white/10',
              isMobile && !isDesktopLikeMobile && 'bg-zinc-200 ring-black/10'
            )}
          />
        </div>
      </motion.div>
    );
  }

  if (!item?.url?.trim()) {
    const useDesktopFallback = !isMobile || isDesktopLikeMobile;
    return (
      <p
        className={cn(
          'flex items-center justify-center px-3 text-center text-[11px] leading-relaxed md:text-xs',
          isCompactMobile ? 'aspect-[17/12]' : SIDEBAR_AD_ASPECT_CLASS,
          useDesktopFallback
            ? 'rounded-lg bg-black/30 py-8 text-white/55 ring-1 ring-white/10'
            : 'rounded-2xl bg-zinc-100 py-8 text-zinc-500'
        )}
      >
        마감임박 배너를 불러오지 못했거나, 표시할 대회가 없습니다.
      </p>
    );
  }

  const card = (
    <div className={shellClassName}>
      <div className={imageFrameClassName}>
        <Image
          src={item.url.trim()}
          alt={item.eventName?.trim() || '마감임박 대회'}
          fill
          className={cn(
            'object-cover object-center',
            expired && (isMobile && !isDesktopLikeMobile ? 'opacity-60' : 'grayscale opacity-70')
          )}
          sizes={
            isCompactMobile
              ? '(max-width: 768px) 170px, 180px'
              : isDesktopLikeMobile
                ? '(max-width: 768px) 46vw, 220px'
                : '(max-width: 1024px) 60vw, 320px'
          }
        />
        <span className="sr-only">
          {[item.eventName?.trim(), statusLabel].filter(Boolean).join(' · ')}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      key={item.eventId || item.url}
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {href ? (
        <Link href={href} className="block w-full transition hover:opacity-95">
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  );
}

function EventsAdvertiseRotator({
  items,
  loading,
}: {
  items: MainPageAdvertiseItem[];
  loading: boolean;
}) {
  const chunks = useMemo(() => {
    if (items.length === 0) return [];
    const out: MainPageAdvertiseItem[][] = [];
    for (let i = 0; i < items.length; i += ADV_PAGE_SIZE) {
      out.push(items.slice(i, i + ADV_PAGE_SIZE));
    }
    return out;
  }, [items]);

  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [items]);

  useEffect(() => {
    if (loading || chunks.length <= 1 || paused) return;
    const t = window.setInterval(() => {
      setPage((p) => (p + 1) % chunks.length);
    }, ADV_ROTATE_MS);
    return () => window.clearInterval(t);
  }, [loading, chunks.length, paused]);

  const safePage = chunks.length ? Math.min(page, chunks.length - 1) : 0;
  const current = chunks[safePage] ?? [];

  const slotMotion = {
    initial: { opacity: 0, x: 18, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  };

  if (loading) {
    return (
      <div
        className="flex flex-col gap-2"
        aria-busy="true"
        aria-label="이벤트 배너 로딩"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={`adv-sk-${i}`}
            className={cn(
              'relative w-full overflow-hidden rounded-lg bg-black/35 ring-1 ring-white/10',
              SIDEBAR_AD_ASPECT_CLASS
            )}
          >
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (chunks.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="w-full"
        role="list"
        aria-label={`이벤트 광고 배너 ${safePage + 1} / ${chunks.length}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safePage}
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {[0, 1, 2].map((slot) => {
              const item = current[slot];
              const href = item ? advertiseHref(item) : undefined;
              const inner = item?.url?.trim() ? (
                <div
                  className={cn(
                    'relative w-full overflow-hidden rounded-lg bg-black ring-1 ring-white/15 backdrop-blur-sm transition hover:ring-white/35',
                    SIDEBAR_AD_ASPECT_CLASS
                  )}
                >
                  <Image
                    src={item.url.trim()}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 300px"
                    className="object-cover object-center"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    'w-full rounded-lg bg-black/25 ring-1 ring-white/10',
                    SIDEBAR_AD_ASPECT_CLASS
                  )}
                  aria-hidden
                />
              );

              return (
                <motion.div
                  key={`${safePage}-${item?.eventId ?? item?.url ?? `empty-${slot}`}`}
                  className="relative w-full shrink-0"
                  {...slotMotion}
                  transition={{
                    ...slotMotion.transition,
                    delay: slot * 0.07,
                  }}
                >
                  {href ? (
                    <Link href={href} className="block w-full">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {chunks.length > 1 ? (
        <div
          className="flex justify-center gap-1.5 pt-0.5"
          role="tablist"
          aria-label="배너 페이지"
        >
          {chunks.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === safePage}
              aria-label={`${i + 1}번째 묶음 보기`}
              onClick={() => setPage(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === safePage
                  ? 'w-5 bg-white shadow-sm'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function toYmd(iso: string | undefined): string {
  if (!iso?.trim()) return '';
  return iso.trim().split('T')[0] ?? '';
}

/**
 * 메인 본문·스폰서 열과 동일 리듬: SPONSORS 제목과 같은 타이포 + 더보기
 * `srOnlyTitle`만 있을 때(인기 대회): 시각 제목은 배너 뱃지에 두고 여기서는 더보기 정렬만 유지
 */
function MobileScheduleSectionHeader({
  title,
  moreHref = '/schedule',
  srOnlyTitle,
}: {
  title?: ReactNode | null;
  moreHref?: string;
  srOnlyTitle?: string;
}) {
  const hasVisibleTitle = title != null && title !== false;
  return (
    <div className="flex w-full items-end justify-between gap-3">
      <div className={cn('min-w-0', !hasVisibleTitle && 'flex-1')}>
        {srOnlyTitle ? <h2 className="sr-only">{srOnlyTitle}</h2> : null}
        {hasVisibleTitle ? title : null}
      </div>
      <Link
        href={moreHref}
        className="shrink-0 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        더보기 &gt;
      </Link>
    </div>
  );
}

/** EventSection과 동일한 드래그 가로 스크롤 래퍼 */
function HeroOliveCarousel({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return;
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startXRef.current - clientX;
    scrollRef.current.scrollLeft = scrollLeftRef.current + diff;
    if ('touches' in e) e.preventDefault();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div className="mt-3 -mx-4 md:-mx-6">
      <div
        ref={scrollRef}
        role="region"
        aria-label="대회 카드 목록"
        className={cn(
          'h-[250px] md:h-[280px] overflow-x-auto overflow-y-hidden scrollbar-hide',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        )}
        style={{ touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <ul className="flex w-max min-w-full list-none gap-3 pb-2 pl-4 pr-3 md:pl-6 md:pr-4">
          {children}
        </ul>
      </div>
    </div>
  );
}

/** 모바일·태블릿: 히어로 하단 오버레이에 마감임박 배너 1건 고정 노출 */
function HeroMobileDeadlineInBanner({
  popularItems,
  popularLoading,
}: {
  popularItems: MainPagePopularAdvertiseItem[];
  popularLoading: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 lg:hidden"
      aria-label="마감임박 대회"
      aria-busy={popularLoading}
    >
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-10 pt-8 sm:px-5 sm:pb-12 sm:pt-12 md:px-6 md:pb-14 md:pt-14">
        <div className="w-full max-w-[min(52vw,10.25rem)] sm:max-w-[min(48vw,12.5rem)]">
          <PopularDeadlineBanner
            variant="mobileDesktopLike"
            item={popularItems[0] ?? null}
            loading={popularLoading}
          />
        </div>
      </div>
    </div>
  );
}

function oliveCardSkeletonLi(key: string) {
  return (
    <li key={key} className="w-[240px] shrink-0 list-none md:w-[267px]">
      <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-gray-200" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3 w-8 animate-pulse rounded bg-gray-200" />
        <div className="h-3.5 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
      </div>
    </li>
  );
}

/** 모바일·태블릿: 히어로 밖(하단) — 주요대회일정·갤러리와 동일한 섹션 리듬 */
function HeroMobileBelowHero({
  events,
  isLoading,
}: {
  events: BlockEventItem[];
  isLoading: boolean;
}) {
  const mainThree = Array.from({ length: 3 }, (_, i) => events[i]);

  const cardHover =
    'transition-transform duration-300 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100';

  return (
    <section
      className="relative z-[11] border-t border-gray-200/80 bg-white lg:hidden"
      aria-label="주요 대회 일정"
    >
      <div className="mx-auto max-w-[1920px] space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10">
        <div>
          <MobileScheduleSectionHeader
            title={
              <h2 className="font-giants text-[22px] text-gray-900 md:text-[28px]">
                주요 대회 일정
              </h2>
            }
          />
          <HeroOliveCarousel>
            {isLoading
              ? [0, 1, 2].map((i) => oliveCardSkeletonLi(`m-bl-sk-${i}`))
              : mainThree.map((ev, i) => {
                if (!ev) {
                  return (
                    <li
                      key={`m-bl-empty-${i}`}
                      className="w-[240px] shrink-0 list-none md:w-[267px]"
                      aria-hidden
                    >
                      <div className="aspect-[16/10] w-full rounded-xl border border-dashed border-gray-200 bg-gray-50" />
                      <div className="mt-2.5 h-10 rounded bg-gray-50" />
                    </li>
                  );
                }
                const ymd = toYmd(ev.eventDate) || '2099-12-31';
                return (
                  <EventCard
                    key={ev.eventId || `bl-${i}`}
                    imageSrc={blockListDisplayImageSrc(ev)}
                    imageAlt={ev.eventNameKr}
                    title={ev.eventNameKr}
                    subtitle={ev.eventNameEn}
                    date={new Date(ymd).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    categoryNames={ev.categoryNames}
                    status={ev.status}
                    eventDate={ymd}
                    eventDeadLine={
                      ev.registDeadline
                        ? toYmd(ev.registDeadline)
                        : ev.eventDeadLine
                          ? toYmd(ev.eventDeadLine)
                          : undefined
                    }
                    eventId={ev.eventId}
                    eventUrl={ev.eventUrl}
                    size="olive"
                    className={cardHover}
                  />
                );
              })}
          </HeroOliveCarousel>
        </div>
      </div>
    </section>
  );
}

/** ─── 플로팅 사이드 패널 공용 상수 ─── */
const PANEL_W = 200;          // 패널 너비(px)
const POPCARD_W = 260;        // 팝아웃 카드 너비(px)
const POPCARD_GAP = 10;       // 패널↔카드 간격(px)

/* 대회안내 마퀴 */
const AD_MARQUEE_SPEED = 0.5;
const AD_VISIBLE = 6;
const AD_GAP = 8;
const AD_ASPECT = 166 / 332;

/* 스폰서 마퀴 */
const SP_MARQUEE_SPEED = 0.5;
const SP_VISIBLE = 5.5;
const SP_GAP = 8;
const SP_ASPECT = 9 / 16; // 가로형 로고

interface AdHoverInfo { item: MainPageAdvertiseItem; top: number; }
interface SpHoverInfo { item: SponsorBanner; top: number; }

/** 공용 마퀴 빌더 */
function buildMarquee<T>(
  items: T[],
  visible: number,
  speed: number,
  gap: number,
  itemH: number,
  renderItem: (item: T, key: string) => React.ReactNode,
  outerRef: React.RefObject<HTMLDivElement | null>,
  onHoverChange: (info: { item: T; top: number } | null) => void,
  loading: boolean,
  skeletonClass = 'animate-pulse rounded-xl bg-white/15 ring-1 ring-white/10',
) {
  const itemWithGap = itemH + gap;
  const containerH = visible * itemWithGap - gap;

  const minCount = Math.max(visible * 2, items.length);
  const loopItems = items.length === 0 ? [] : Array.from(
    { length: minCount * 2 }, (_, i) => items[i % items.length]
  );

  return { itemH, itemWithGap, containerH, loopItems };
}

/** 대회안내 마퀴 */
function AdMarquee({ items, loading, outerRef, onHoverChange }: {
  items: MainPageAdvertiseItem[];
  loading: boolean;
  outerRef: React.RefObject<HTMLDivElement | null>;
  onHoverChange: (info: AdHoverInfo | null) => void;
}) {
  const itemH = Math.round(PANEL_W * AD_ASPECT);
  const itemWithGap = itemH + AD_GAP;
  const containerH = AD_VISIBLE * itemWithGap - AD_GAP;

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    const minCount = Math.max(AD_VISIBLE * 2, items.length);
    return Array.from({ length: minCount * 2 }, (_, i) => items[i % items.length]);
  }, [items]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const listARef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loopItems.length === 0) return;
    const tick = () => {
      const listH = listARef.current?.offsetHeight ?? (loopItems.length / 2 * itemWithGap);
      if (!pausedRef.current) {
        offsetRef.current += AD_MARQUEE_SPEED;
        if (offsetRef.current >= listH) offsetRef.current -= listH;
      }
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(0,${-offsetRef.current}px,0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loopItems.length, itemWithGap]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const listH = listARef.current?.offsetHeight ?? 1;
      offsetRef.current = (offsetRef.current + e.deltaY * 0.4 + listH * 10) % listH;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const cardShell = 'group relative block w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-white/15';

  if (loading) return (
    <div className="flex flex-col" style={{ height: containerH, gap: AD_GAP }}>
      {Array.from({ length: AD_VISIBLE }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white/15 ring-1 ring-white/10 shrink-0" style={{ height: itemH }} />
      ))}
    </div>
  );

  const half = Math.ceil(loopItems.length / 2);
  const listA = loopItems.slice(0, half);
  const listB = loopItems.slice(half);

  const renderItem = (item: MainPageAdvertiseItem, key: string) => {
    const href = advertiseHref(item);
    const style = { height: itemH, flexShrink: 0 as const };
    const handleEnter = (e: React.MouseEvent) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      pausedRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const panelRect = outerRef.current?.getBoundingClientRect();
      onHoverChange({ item, top: panelRect ? rect.top - panelRect.top : 0 });
    };
    const handleLeave = () => {
      leaveTimer.current = setTimeout(() => {
        pausedRef.current = false;
        onHoverChange(null);
      }, 120);
    };
    const inner = (
      <>
        {item.url?.trim() && (
          <div className="absolute inset-0">
            <Image src={item.url.trim()} alt={item.eventName?.trim() || '대회 안내'} fill className="object-cover object-center" sizes={`${PANEL_W}px`} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2 transition-transform duration-200 group-hover:translate-y-0">
          <p className="line-clamp-1 text-xs font-semibold text-white drop-shadow">{item.eventName?.trim()}</p>
        </div>
      </>
    );
    const common = { className: cardShell, style, onMouseEnter: handleEnter, onMouseLeave: handleLeave };
    if (href) return <Link key={key} href={href} {...common}>{inner}</Link>;
    return <div key={key} {...common}>{inner}</div>;
  };

  return (
    <div ref={scrollContainerRef} className="relative overflow-hidden rounded-xl" style={{ height: containerH }}>
      <div ref={wrapRef} className="flex flex-col will-change-transform" style={{ gap: AD_GAP }}>
        <div ref={listARef} className="flex flex-col" style={{ gap: AD_GAP }}>
          {listA.map((item, i) => renderItem(item, `a-${i}`))}
        </div>
        <div className="flex flex-col" style={{ gap: AD_GAP }}>
          {listB.map((item, i) => renderItem(item, `b-${i}`))}
        </div>
      </div>
    </div>
  );
}

/** 스폰서 마퀴 */
function SponsorMarquee({ items, loading, outerRef, onHoverChange }: {
  items: SponsorBanner[];
  loading: boolean;
  outerRef: React.RefObject<HTMLDivElement | null>;
  onHoverChange: (info: SpHoverInfo | null) => void;
}) {
  const itemH = Math.round(PANEL_W * SP_ASPECT);
  const itemWithGap = itemH + SP_GAP;
  const containerH = SP_VISIBLE * itemWithGap - SP_GAP;

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    const minCount = Math.max(SP_VISIBLE * 2, items.length);
    return Array.from({ length: minCount * 2 }, (_, i) => items[i % items.length]);
  }, [items]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const listARef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loopItems.length === 0) return;
    const tick = () => {
      const listH = listARef.current?.offsetHeight ?? (loopItems.length / 2 * itemWithGap);
      if (!pausedRef.current) {
        offsetRef.current += SP_MARQUEE_SPEED;
        if (offsetRef.current >= listH) offsetRef.current -= listH;
      }
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(0,${-offsetRef.current}px,0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loopItems.length, itemWithGap]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const listH = listARef.current?.offsetHeight ?? 1;
      offsetRef.current = (offsetRef.current + e.deltaY * 0.4 + listH * 10) % listH;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const cardShell = 'group relative block w-full overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/20';

  if (loading) return (
    <div className="flex flex-col" style={{ height: containerH, gap: SP_GAP }}>
      {Array.from({ length: SP_VISIBLE }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white/15 ring-1 ring-white/10 shrink-0" style={{ height: itemH }} />
      ))}
    </div>
  );

  const half = Math.ceil(loopItems.length / 2);
  const listA = loopItems.slice(0, half);
  const listB = loopItems.slice(half);

  const renderItem = (item: SponsorBanner, key: string) => {
    const handleEnter = (e: React.MouseEvent) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      pausedRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const panelRect = outerRef.current?.getBoundingClientRect();
      onHoverChange({ item, top: panelRect ? rect.top - panelRect.top : 0 });
    };
    const handleLeave = () => {
      leaveTimer.current = setTimeout(() => {
        pausedRef.current = false;
        onHoverChange(null);
      }, 120);
    };
    const inner = (
      <>
        <Image
          src={item.imageUrl}
          alt="스폰서"
          width={PANEL_W}
          height={Math.round(PANEL_W * SP_ASPECT)}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          sizes={`${PANEL_W}px`}
        />
        <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
      </>
    );
    const common = { className: cardShell, onMouseEnter: handleEnter, onMouseLeave: handleLeave };
    if (item.url?.trim()) return <a key={key} href={item.url.trim()} target="_blank" rel="noopener noreferrer" {...common}>{inner}</a>;
    return <div key={key} {...common}>{inner}</div>;
  };

  return (
    <div ref={scrollContainerRef} className="relative overflow-hidden rounded-xl" style={{ height: containerH }}>
      <div ref={wrapRef} className="flex flex-col will-change-transform" style={{ gap: SP_GAP }}>
        <div ref={listARef} className="flex flex-col" style={{ gap: SP_GAP }}>
          {listA.map((item, i) => renderItem(item, `sp-a-${i}`))}
        </div>
        <div className="flex flex-col" style={{ gap: SP_GAP }}>
          {listB.map((item, i) => renderItem(item, `sp-b-${i}`))}
        </div>
      </div>
    </div>
  );
}

/** 패널 헤더 행 (제목 + 접기/펼치기 버튼) */
function PanelHeader({ title, color, collapsed, onToggle }: {
  title: string; color: string; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? '펼치기' : '접기'}
      className="pointer-events-auto flex w-full items-center justify-between rounded-md px-3 py-1 transition-opacity hover:opacity-90 active:opacity-75"
      style={{ backgroundColor: color }}
    >
      <h2 className="font-giants text-base font-bold tracking-tight text-white">{title}</h2>
      <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          className={`h-3 w-3 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} aria-hidden>
          <path d="M5 15l7-7 7 7" />
        </svg>
      </span>
    </button>
  );
}

/** 대회안내 팝아웃 카드 */
function AdPopCard({ info, onEnter, onLeave }: {
  info: AdHoverInfo;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const href = advertiseHref(info.item);
  const inner = (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10" style={{ width: POPCARD_W }}>
      {info.item.url?.trim() && (
        <div className="relative w-full" style={{ aspectRatio: '332/166' }}>
          <Image src={info.item.url.trim()} alt={info.item.eventName?.trim() || ''} fill className="object-cover" sizes={`${POPCARD_W}px`} />
        </div>
      )}
      {info.item.eventName?.trim() && (
        <p className="px-3 py-2 text-sm font-semibold text-gray-800 line-clamp-2">{info.item.eventName.trim()}</p>
      )}
    </div>
  );
  const common = {
    style: { position: 'absolute' as const, right: `calc(100% + ${POPCARD_GAP}px)`, top: info.top, zIndex: 60 },
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    className: 'animate-in fade-in slide-in-from-right-2 duration-150',
  };
  if (href) return <Link href={href} onClick={() => onLeave()} {...common}>{inner}</Link>;
  return <div {...common}>{inner}</div>;
}

/** 스폰서 팝아웃 카드 */
function SpPopCard({ info, onEnter, onLeave }: {
  info: SpHoverInfo;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const inner = (
    <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10" style={{ width: POPCARD_W }}>
      <Image
        src={info.item.imageUrl}
        alt="스폰서"
        width={POPCARD_W}
        height={Math.round(POPCARD_W * SP_ASPECT)}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        sizes={`${POPCARD_W}px`}
      />
    </div>
  );
  const common = {
    style: { position: 'absolute' as const, right: `calc(100% + ${POPCARD_GAP}px)`, top: info.top, zIndex: 60 },
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    className: 'animate-in fade-in slide-in-from-right-2 duration-150',
  };
  if (info.item.url?.trim()) return <a href={info.item.url.trim()} target="_blank" rel="noopener noreferrer" {...common}>{inner}</a>;
  return <div {...common}>{inner}</div>;
}

/** 화면 우측 고정 패널 — 대회안내 + 스폰서 */
function FloatingSidePanels({ advertiseItems, advertiseLoading, sponsorItems, sponsorLoading }: {
  advertiseItems: MainPageAdvertiseItem[];
  advertiseLoading: boolean;
  sponsorItems: SponsorBanner[];
  sponsorLoading: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // 기본: 둘 다 접힘. 동시에 둘 다 열 수 없음
  const [openPanel, setOpenPanel] = useState<'ad' | 'sp' | null>(null);
  const [adPopInfo, setAdPopInfo] = useState<AdHoverInfo | null>(null);
  const [spPopInfo, setSpPopInfo] = useState<SpHoverInfo | null>(null);
  const adLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePanel = (panel: 'ad' | 'sp') =>
    setOpenPanel(cur => (cur === panel ? null : panel)); // 같은 패널 누르면 접힘

  return (
    <div
      ref={panelRef}
      className="pointer-events-none fixed right-[6vw] z-[50] hidden lg:flex lg:flex-col lg:gap-4 lg:pb-4"
      style={{ top: 'calc(var(--kma-main-header-offset, 80px) + 1rem)', width: PANEL_W }}
    >
      {/* 대회안내 팝아웃 */}
      {adPopInfo && (
        <AdPopCard
          info={adPopInfo}
          onEnter={() => { if (adLeaveTimer.current) clearTimeout(adLeaveTimer.current); }}
          onLeave={() => {
            adLeaveTimer.current = setTimeout(() => setAdPopInfo(null), 120);
          }}
        />
      )}

      {/* 스폰서 팝아웃 */}
      {spPopInfo && (
        <SpPopCard
          info={spPopInfo}
          onEnter={() => { if (spLeaveTimer.current) clearTimeout(spLeaveTimer.current); }}
          onLeave={() => {
            spLeaveTimer.current = setTimeout(() => setSpPopInfo(null), 120);
          }}
        />
      )}

      {/* 대회안내 패널 */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <PanelHeader title="대회안내" color="#16a34a" collapsed={openPanel !== 'ad'} onToggle={() => { setAdPopInfo(null); togglePanel('ad'); }} />
        {openPanel === 'ad' && (
          <AdMarquee
            items={advertiseItems}
            loading={advertiseLoading}
            outerRef={panelRef}
            onHoverChange={(info) => {
              if (adLeaveTimer.current) clearTimeout(adLeaveTimer.current);
              setAdPopInfo(info);
            }}
          />
        )}
      </div>

      {/* 스폰서 패널 */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <PanelHeader title="SPONSOR" color="#1d4ed8" collapsed={openPanel !== 'sp'} onToggle={() => { setSpPopInfo(null); togglePanel('sp'); }} />
        {openPanel === 'sp' && (
          <SponsorMarquee
            items={sponsorItems}
            loading={sponsorLoading}
            outerRef={panelRef}
            onHoverChange={(info) => {
              if (spLeaveTimer.current) clearTimeout(spLeaveTimer.current);
              setSpPopInfo(info);
            }}
          />
        )}
      </div>
    </div>
  );
}

function HeroEventOverlay({
  popularItems,
  popularLoading,
}: {
  events: BlockEventItem[];
  isLoading: boolean;
  advertiseItems: MainPageAdvertiseItem[];
  advertiseLoading: boolean;
  popularItems: MainPagePopularAdvertiseItem[];
  popularLoading: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[12] hidden lg:flex lg:flex-col lg:justify-end lg:pb-24 lg:pt-[max(5.5rem,calc(var(--kma-main-header-offset,64px)+1.75rem))]"
      role="region"
      aria-label="주요 대회 미리보기"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[1920px] px-4 lg:px-[6vw]">
        {/* 좌: 마감임박 카드 */}
        <div className="flex w-[min(100%,540px)] shrink-0 flex-col">
          <PopularDeadlineBanner
            item={popularItems[0] ?? null}
            loading={popularLoading}
          />
        </div>
      </div>
    </div>
  );
}


export default function MainHomeHero() {
  const [events, setEvents] = useState<BlockEventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [advertiseItems, setAdvertiseItems] = useState<MainPageAdvertiseItem[]>([]);
  const [advertiseLoading, setAdvertiseLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<MainPagePopularAdvertiseItem[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;


    const fetchPopularAdvertise = async () => {
      if (!API_BASE_URL) {
        setPopularItems([]);
        setPopularLoading(false);
        return;
      }
      try {
        setPopularLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/main-page/advertise/deadline-approach`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        if (!response.ok) {
          setPopularItems([]);
          return;
        }
        const json = await response.json();
        setPopularItems(parsePopularAdvertiseList(json, 3));
      } catch {
        setPopularItems([]);
      } finally {
        setPopularLoading(false);
      }
    };

    void fetchPopularAdvertise();

    if (!API_BASE_URL) {
      setEventsLoading(false);
      setAdvertiseLoading(false);
      return;
    }

    const fetchBlockList = async () => {
      try {
        setEventsLoading(true);
        const qs = new URLSearchParams({
          year: '0',
          month: '0',
          type: 'ALL',
          filter: 'ALL',
        });
        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/main-page/block-list?${qs.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        const all: BlockEventItem[] = [];
        Object.values(data).forEach((list) => {
          if (Array.isArray(list)) all.push(...list);
        });
        const sorted = all.sort((a, b) => {
          const ta = new Date(a.eventDate).getTime();
          const tb = new Date(b.eventDate).getTime();
          return ta - tb;
        });
        setEvents(sorted.slice(0, 20));
      } catch {
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchAdvertise = async () => {
      try {
        setAdvertiseLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/main-page/advertise`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        if (!response.ok) {
          setAdvertiseItems([]);
          return;
        }
        const json = await response.json();
        const list = parseAdvertiseResponse(json).filter((x) =>
          Boolean(x?.url?.trim())
        );
        setAdvertiseItems(list.slice(0, 9));
      } catch {
        setAdvertiseItems([]);
      } finally {
        setAdvertiseLoading(false);
      }
    };

    void fetchBlockList();
    void fetchAdvertise();
  }, []);

  return (
    <section className="relative w-full">
      <div className="relative w-full">
        <MarathonHeroCarousel fillViewport={false} />
        <HeroMobileDeadlineInBanner
          popularItems={popularItems}
          popularLoading={popularLoading}
        />
        <HeroEventOverlay
          events={events}
          isLoading={eventsLoading}
          advertiseItems={advertiseItems}
          advertiseLoading={advertiseLoading}
          popularItems={popularItems}
          popularLoading={popularLoading}
        />
      </div>
    </section>
  );
}
