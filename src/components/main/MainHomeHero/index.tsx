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
  if (e.eventId?.trim()) return `/event/${e.eventId.trim()}/guide/overview`;
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
    ? `/event/${item.eventId.trim()}/guide/overview`
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
  const push = (raw: unknown) => {
    const n = normalizePopularAdvertiseRaw(raw);
    if (n && out.length < limit) out.push(n);
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
    const direct = normalizePopularAdvertiseRaw(o);
    if (direct) {
      out.push(direct);
      return out.slice(0, limit);
    }

    const inner = o.content ?? o.data ?? o.items ?? o.result ?? o.body;
    if (Array.isArray(inner)) {
      for (const el of inner) {
        push(el);
        if (out.length >= limit) break;
      }
      return out;
    }
    const single = normalizePopularAdvertiseRaw(inner);
    if (single) out.push(single);

    if (out.length < limit) {
      for (const v of Object.values(o)) {
        if (Array.isArray(v)) {
          for (const el of v) {
            push(el);
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

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

/** 접수 마감일(deadline)까지 남은 일·시·분·초 (1초마다 갱신) */
function useDeadlineCountdown(deadlineIso: string | undefined) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!deadlineIso?.trim()) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [deadlineIso]);

  return useMemo(() => {
    if (!deadlineIso?.trim()) {
      return {
        days: 0,
        hrs: 0,
        mins: 0,
        secs: 0,
        expired: true as const,
      };
    }
    let s = deadlineIso.trim();
    if (!s.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(s)) {
      s = `${s}Z`;
    }
    const end = new Date(s).getTime();
    if (Number.isNaN(end)) {
      return {
        days: 0,
        hrs: 0,
        mins: 0,
        secs: 0,
        expired: true as const,
      };
    }
    const now = Date.now();
    const diff = Math.max(0, end - now);
    const expired = end <= now;
    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hrs = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return { days, hrs, mins, secs, expired };
  }, [deadlineIso, tick]);
}

/** 마감임박 1건: 이미지 + 하단 Tissot식 카운트다운 오버레이 */
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
  const cd = useDeadlineCountdown(item?.deadline);

  if (loading) {
    /* 데스크톱: 실제 카드와 동일 — 이미지 열 + 겹친 D-day 패널 */
    if (!isMobile || isDesktopLikeMobile) {
      return (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              'flex w-full items-stretch',
              isDesktopLikeMobile
                ? 'max-w-[min(86vw,17.5rem)] origin-top-left sm:max-w-[min(90vw,19rem)]'
                : 'origin-center rotate-[-4.5deg]'
            )}
            aria-busy="true"
            aria-label="마감임박 대회 로딩"
          >
            <div
              className={cn(
                'relative min-w-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15',
                isDesktopLikeMobile
                  ? 'basis-[54%] max-w-[54%] shrink-0 sm:basis-[66%] sm:max-w-[66%] sm:shrink sm:flex-1'
                  : 'flex-1'
              )}
            >
              <div
                className="w-full animate-pulse bg-white/20"
                style={{ aspectRatio: '332/166' }}
              />
            </div>
            <div
              className={cn(
                'relative z-10 flex shrink-0 flex-col justify-center rounded-2xl shadow-xl ring-1 ring-white/10',
                isDesktopLikeMobile
                  ? 'items-end -ml-[2.65rem] w-[min(42vw,10.5rem)] pr-1.5 pl-3 sm:-ml-14 sm:w-40 sm:pr-2 sm:pl-7'
                  : 'items-center justify-center -ml-32 w-80 pr-8 pl-20'
              )}
              style={{
                background: isDesktopLikeMobile
                  ? 'linear-gradient(to right, transparent 0%, rgba(9,9,11,0.55) 22%, #09090b 52%, #09090b 100%)'
                  : 'linear-gradient(to right, transparent 0%, rgba(9,9,11,0.7) 30%, #09090b 60%)',
              }}
            >
              <div className={cn('flex flex-col items-center', isDesktopLikeMobile ? '-translate-x-2 gap-2.5 pr-0.5 sm:-translate-x-1 sm:gap-3 sm:pr-1' : 'translate-x-10 gap-[2.125rem]')}>
                <div className={cn('animate-pulse rounded-xl bg-[#FFDC12]/45', isDesktopLikeMobile ? 'h-5 w-10 sm:h-6 sm:w-12' : 'h-9 w-[4.25rem]')} />
                <div className="flex items-end justify-center gap-1 tabular-nums">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={cn('animate-pulse rounded bg-white/30', isDesktopLikeMobile ? 'h-3.5 w-5' : 'h-5 w-7')} />
                    <div className={cn('animate-pulse rounded bg-white/15', isDesktopLikeMobile ? 'h-1.5 w-5' : 'h-2 w-7')} />
                  </div>
                  <div className="mb-3 h-4 w-1 animate-pulse rounded-sm bg-white/25" />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={cn('animate-pulse rounded bg-white/30', isDesktopLikeMobile ? 'h-3.5 w-5' : 'h-5 w-7')} />
                    <div className={cn('animate-pulse rounded bg-white/15', isDesktopLikeMobile ? 'h-1.5 w-5' : 'h-2 w-8')} />
                  </div>
                  <div className="mb-3 h-4 w-1 animate-pulse rounded-sm bg-white/25" />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={cn('animate-pulse rounded bg-white/30', isDesktopLikeMobile ? 'h-3.5 w-5' : 'h-5 w-7')} />
                    <div className={cn('animate-pulse rounded bg-white/15', isDesktopLikeMobile ? 'h-1.5 w-5' : 'h-2 w-8')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    /* 모바일: aspect 카드 + 우하단 카운트다운 패널 (로드 후 레이아웃과 동일) */
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl bg-zinc-200 ring-1 ring-black/10',
            isCompactMobile ? 'aspect-[17/12]' : SIDEBAR_AD_ASPECT_CLASS
          )}
          aria-busy="true"
          aria-label="마감임박 대회 로딩"
        >
          <div className="absolute inset-0 animate-pulse bg-zinc-300/90" />
          <div
            className={cn(
              'absolute z-[2] overflow-hidden rounded-lg shadow-[0_8px_28px_rgba(0,0,0,0.55)] ring-2 ring-black/30',
              isCompactMobile
                ? 'bottom-2 right-2 w-[calc(100%-1rem)]'
                : 'bottom-3 right-3 w-[min(calc(100%-1.5rem),20rem)]'
            )}
          >
            <div className={cn('animate-pulse bg-[#FFFF00]/55', isCompactMobile ? 'h-7' : 'h-9 sm:h-10')} />
            <div className={cn('animate-pulse bg-zinc-900/90', isCompactMobile ? 'h-5' : 'h-7 sm:h-8')} />
          </div>
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

  const href = advertiseHref(item);
  const daysLabel = cd.expired ? 0 : cd.days;

  /* ── default 변형: 두 개의 겹친 pill 카드 ── */
  if (!isMobile || isDesktopLikeMobile) {
    const isDesktopLike = isDesktopLikeMobile;
    /* 좌측 이미지 카드 (파란 테두리) + 우측 카운트다운 카드 (빨간 테두리) 겹침 */
    const card = (
      <div
        className={cn(
          'flex w-full items-stretch',
          isDesktopLike
            ? 'max-w-[min(86vw,17.5rem)] origin-top-left sm:max-w-[min(90vw,19rem)]'
            : 'max-w-[92%] origin-center rotate-[-4.5deg]'
        )}
      >

        {/* 좌측 — 이미지 카드 (자연 비율) */}
        <div
          className={cn(
            'relative min-w-0 overflow-hidden rounded-2xl',
            isDesktopLike ? 'basis-[54%] max-w-[54%] min-w-0 aspect-[332/166] sm:basis-[66%] sm:max-w-[66%] md:basis-[72%] md:max-w-[72%]' : 'flex-1'
          )}
        >
          {isDesktopLike ? (
            <Image
              src={item.url.trim()}
              alt={item.eventName?.trim() || '마감임박 대회'}
              fill
              className={cn('object-cover object-center', cd.expired && 'grayscale opacity-70')}
              sizes="(max-width: 768px) 46vw, 220px"
            />
          ) : (
            <Image
              src={item.url.trim()}
              alt={item.eventName?.trim() || '마감임박 대회'}
              width={332}
              height={166}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              className={cn(cd.expired && 'grayscale opacity-70')}
              sizes="(max-width:1024px) 60vw, 320px"
            />
          )}
        </div>

        {/* 우측 — D-day 카드 (이미지 위로 살짝 겹침) */}
        <div
          className={cn(
            'relative z-10 flex shrink-0 flex-col justify-center rounded-2xl shadow-xl',
            isDesktopLike
              ? 'items-end -ml-[2.65rem] w-[min(42vw,10.5rem)] pr-1.5 pl-3 sm:-ml-14 sm:w-40 sm:pr-2 sm:pl-7'
              : 'items-center justify-center -ml-28 w-72 pr-6 pl-16'
          )}
          style={{
            background: isDesktopLike
              ? 'linear-gradient(to right, transparent 0%, rgba(9,9,11,0.55) 22%, #09090b 52%, #09090b 100%)'
              : 'linear-gradient(to right, transparent 0%, rgba(9,9,11,0.7) 30%, #09090b 60%)',
          }}
          role="timer"
          aria-live="off"
          aria-label={`접수 마감까지 남은 시간: ${daysLabel}일 ${pad2(cd.hrs)}시간 ${pad2(cd.mins)}분 ${pad2(cd.secs)}초`}
        >
          {/* 가운데 정렬 유지 + 블록만 오른쪽으로 이동 */}
          <div
            className={cn(
              'flex flex-col items-center text-center',
              isDesktopLike
                ? '-translate-x-2 gap-2 pr-0.5 sm:-translate-x-1 sm:gap-3 sm:pr-1'
                : 'translate-x-10 gap-[2.125rem]'
            )}
          >
            {/* D-N 뱃지 */}
            <div
              className={cn(
                'rounded-xl bg-[#FFDC12] shadow-lg',
                isDesktopLike ? 'px-1.5 py-0.5 sm:px-2 sm:py-1' : 'px-3 py-1.5'
              )}
            >
              <span
                className={cn(
                  'font-giants font-black leading-none tracking-tight text-black',
                  isDesktopLike
                    ? 'text-[clamp(11px,3vw,15px)]'
                    : 'text-[clamp(16px,2.6vw,26px)]'
                )}
              >
                D-{daysLabel}
              </span>
            </div>
            {/* HH : MM : SS + 라벨 */}
            <div
              className={cn(
                'flex items-end justify-center tabular-nums',
                isDesktopLike ? 'gap-0.5 sm:gap-1' : 'gap-1'
              )}
            >
              <div className="flex flex-col items-center gap-0">
                <span className={cn('font-giants font-bold leading-none text-white', isDesktopLike ? 'text-[clamp(11px,3.2vw,17px)]' : 'text-[clamp(13px,2vw,20px)]')}>{pad2(cd.hrs)}</span>
                <span className={cn('font-semibold tracking-widest text-white/60 uppercase', isDesktopLike ? 'text-[8px] sm:text-[9px]' : 'text-[9px]')}>hrs</span>
              </div>
              <span className={cn('font-giants font-bold leading-none text-white/35', isDesktopLike ? 'mb-1 text-[clamp(10px,2.8vw,14px)] sm:mb-2' : 'mb-3 text-[clamp(13px,2vw,20px)]')}>:</span>
              <div className="flex flex-col items-center gap-0">
                <span className={cn('font-giants font-bold leading-none text-white', isDesktopLike ? 'text-[clamp(11px,3.2vw,17px)]' : 'text-[clamp(13px,2vw,20px)]')}>{pad2(cd.mins)}</span>
                <span className={cn('font-semibold tracking-widest text-white/60 uppercase', isDesktopLike ? 'text-[8px] sm:text-[9px]' : 'text-[9px]')}>mins</span>
              </div>
              <span className={cn('font-giants font-bold leading-none text-white/35', isDesktopLike ? 'mb-1 text-[clamp(10px,2.8vw,14px)] sm:mb-2' : 'mb-3 text-[clamp(13px,2vw,20px)]')}>:</span>
              <div className="flex flex-col items-center gap-0">
                <span className={cn('font-giants font-bold leading-none text-white', isDesktopLike ? 'text-[clamp(11px,3.2vw,17px)]' : 'text-[clamp(13px,2vw,20px)]')}>{pad2(cd.secs)}</span>
                <span className={cn('font-semibold tracking-widest text-white/60 uppercase', isDesktopLike ? 'text-[8px] sm:text-[9px]' : 'text-[9px]')}>secs</span>
              </div>
            </div>
            {cd.expired && (
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/90">접수 마감</span>
            )}
          </div>
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
        {href ? <Link href={href} className="block w-full">{card}</Link> : card}
      </motion.div>
    );
  }

  /** 티쏘형: D-day 열 + 시:분:초 열, ch·콜론 폭 맞춤으로 라벨 정렬 */
  const countdownPanel = (
    <div
      className={cn(
        'absolute z-[2] overflow-hidden rounded-lg',
        isMobile
          ? isCompactMobile
            ? 'bottom-2 right-2 w-[calc(100%-1rem)] shadow-[0_7px_20px_rgba(0,0,0,0.5)] ring-1 ring-black/25'
            : 'bottom-3 right-3 w-[min(calc(100%-1.5rem),20rem)] shadow-[0_8px_28px_rgba(0,0,0,0.55)] ring-2 ring-black/30'
          : 'bottom-2 right-2 w-[min(94%,13rem)] shadow-[0_4px_18px_rgba(0,0,0,0.4)] ring-1 ring-black/15',
        cd.expired && 'opacity-95'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center gap-x-2.5 bg-[#FFFF00] px-2 py-1 font-black tabular-nums leading-none text-black sm:gap-x-3 sm:px-2.5 sm:py-1.5',
          isMobile && (isCompactMobile ? 'gap-x-2 px-2 py-1' : 'gap-x-3 px-3 py-1.5 sm:py-2')
        )}
        role="timer"
        aria-live="off"
        aria-label={`접수 마감까지 남은 시간: ${daysLabel}일 ${pad2(cd.hrs)}시간 ${pad2(cd.mins)}분 ${pad2(cd.secs)}초`}
      >
        <span
          className={cn(
            'min-w-[2.85rem] shrink-0 text-center sm:min-w-[3.1rem]',
            isMobile
              ? isCompactMobile
                ? 'text-xs sm:text-sm'
                : 'text-sm sm:text-base md:text-lg'
              : '[font-size:clamp(11px,3.4vw,16px)]'
          )}
        >
          D-{daysLabel}
        </span>
        <div
          className={cn(
            'flex items-center justify-center gap-x-0.5 sm:gap-x-1',
            isMobile
              ? isCompactMobile
                ? 'text-xs sm:text-sm'
                : 'text-sm sm:text-base md:text-lg'
              : '[font-size:clamp(11px,3.4vw,16px)]'
          )}
        >
          <span className="inline-block min-w-[2.35ch] text-center">{pad2(cd.hrs)}</span>
          <span className="inline-flex w-2 shrink-0 justify-center font-bold opacity-90 sm:w-2.5">
            :
          </span>
          <span className="inline-block min-w-[2.35ch] text-center">{pad2(cd.mins)}</span>
          <span className="inline-flex w-2 shrink-0 justify-center font-bold opacity-90 sm:w-2.5">
            :
          </span>
          <span className="inline-block min-w-[2.35ch] text-center">{pad2(cd.secs)}</span>
        </div>
      </div>
      <div
        className={cn(
          'flex items-start justify-center gap-x-2.5 bg-black px-2 py-1 font-medium leading-none tracking-wide text-white sm:gap-x-3 sm:px-2.5 sm:py-1',
          isMobile && (isCompactMobile ? 'px-2 py-1' : 'px-3 py-1.5 sm:py-2'),
          !isMobile && 'lowercase'
        )}
      >
        <span
          className={cn(
            'min-w-[2.85rem] shrink-0 text-center sm:min-w-[3.1rem]',
            isMobile
              ? isCompactMobile
                ? 'text-[10px] font-semibold'
                : 'text-xs font-semibold sm:text-sm'
              : 'lowercase [font-size:clamp(6.5px,2vw,9px)]'
          )}
        >
          {isMobile ? '일' : 'days'}
        </span>
        <div
          className={cn(
            'flex items-start justify-center gap-x-0.5 sm:gap-x-1',
            isMobile
              ? isCompactMobile
                ? 'text-[10px] font-semibold'
                : 'text-xs font-semibold sm:text-sm'
              : '[font-size:clamp(6.5px,2vw,9px)]'
          )}
        >
          <span className="inline-block min-w-[2.35ch] text-center">
            {isMobile ? '시' : 'hrs'}
          </span>
          <span className="inline-flex w-2 shrink-0 sm:w-2.5" aria-hidden />
          <span className="inline-block min-w-[2.35ch] text-center">
            {isMobile ? '분' : 'mins'}
          </span>
          <span className="inline-flex w-2 shrink-0 sm:w-2.5" aria-hidden />
          <span className="inline-block min-w-[2.35ch] text-center">
            {isMobile ? '초' : 'secs'}
          </span>
        </div>
      </div>
      {cd.expired ? (
        <div
          className={cn(
            'bg-[#FFFF00]/95 py-1 text-center font-semibold leading-none text-neutral-900',
            isMobile
              ? isCompactMobile
                ? 'text-[10px]'
                : 'text-xs sm:text-sm'
              : 'py-0.5 text-[8px] sm:text-[9px]'
          )}
        >
          접수 마감
        </div>
      ) : null}
    </div>
  );

  const imageBlock = (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-gray-100 transition',
        isCompactMobile ? 'aspect-[17/12]' : SIDEBAR_AD_ASPECT_CLASS,
        isMobile
          ? 'rounded-2xl'
          : 'rounded-lg bg-black ring-1 ring-white/15 backdrop-blur-sm',
        !isMobile && href && 'hover:ring-white/35'
      )}
    >
      <Image
        src={item.url.trim()}
        alt={item.eventName?.trim() ? `${item.eventName} 접수 마감 카운트다운` : ''}
        fill
        className={cn('object-cover object-center', cd.expired && 'opacity-60')}
        sizes={isCompactMobile ? '(max-width: 768px) 170px, 180px' : '(max-width: 1024px) 100vw, 300px'}
      />
      <span className="sr-only">
        {item.eventName?.trim() || '마감임박 대회'}
      </span>
      {countdownPanel}
    </div>
  );

  const body = href ? (
    <Link href={href} className="block w-full">
      {imageBlock}
    </Link>
  ) : (
    imageBlock
  );

  return (
    <motion.div
      key={item.eventId || item.url}
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {body}
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
      <div className="pointer-events-auto bg-gradient-to-b from-black/70 via-black/35 to-transparent px-4 pb-10 pt-[calc(var(--kma-main-header-offset,64px)+0.8rem)] md:px-6 md:pb-12 md:pt-[calc(var(--kma-main-header-offset,64px)+1rem)]">
        <div className="flex items-end justify-end gap-2" />
      </div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-8 sm:px-5 sm:pb-6 sm:pt-12 md:px-6 md:pb-7 md:pt-14">
        <div className="w-full max-w-[min(86vw,17.5rem)] sm:max-w-[min(90vw,19rem)]">
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
      aria-label="주요대회일정"
    >
      <div className="mx-auto max-w-[1920px] space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10">
        <div>
          <MobileScheduleSectionHeader
            title={
              <h2 className="font-giants text-[22px] text-gray-900 md:text-[28px]">
                주요대회일정
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
  // 기본: 스폰서 펼침, 대회안내 접힘. 동시에 둘 다 열 수 없음, 둘 다 접는 것은 가능
  const [openPanel, setOpenPanel] = useState<'ad' | 'sp' | null>('sp');
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
      try {
        setPopularLoading(true);
        const response = await fetch(
          '/api/v1/public/main-page/advertise/approach',
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
    <section className="relative -mt-[var(--kma-main-header-offset,64px)] w-full">

      {/* 히어로 높이만 포함: absolute(bottom) 칩·PC 오버레이 기준이 하단 섹션과 섞이지 않도록 */}
      <div className="relative w-full">
        <MarathonHeroCarousel />
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
