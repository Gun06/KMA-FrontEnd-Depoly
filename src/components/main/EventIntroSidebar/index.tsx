'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MainPageAdvertiseItem } from '@/types/event';

/** 스폰서와 동일한 세로 마퀴 속도 */
const SPEED = 0.5;
const FADE_H = 24;

function advertiseHref(item: MainPageAdvertiseItem): string {
  if (item.eventId?.trim()) return `/event/${item.eventId.trim()}/guide/overview`;
  return '#';
}

function formatDate(iso: string | undefined): string {
  if (!iso?.trim()) return '';
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function parseItems(json: unknown): MainPageAdvertiseItem[] {
  if (Array.isArray(json)) return json as MainPageAdvertiseItem[];
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    const inner = o.content ?? o.data ?? o.items;
    if (Array.isArray(inner)) return inner as MainPageAdvertiseItem[];
  }
  return [];
}

/* ──────────────────────────────────────────────
   팝아웃 카드 — absolute, 왼쪽으로 슬라이드
   position 은 부모(outerRef)로부터 계산한 top을 인라인으로 주입
─────────────────────────────────────────────── */
interface PopCardProps {
  item: MainPageAdvertiseItem;
  visible: boolean;
  topPx: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
function PopCard({ item, visible, topPx, onMouseEnter, onMouseLeave }: PopCardProps) {
  const href = advertiseHref(item);
  return (
    <div
      aria-hidden={!visible}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        right: 'calc(100% + 6px)',
        top: topPx,
        transform: visible
          ? 'translateY(-50%) translateX(0)'
          : 'translateY(-50%) translateX(20px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        width: '260px',
        zIndex: 200,
      }}
    >
      <Link
        href={href}
        className="block overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10"
        tabIndex={visible ? 0 : -1}
      >
        <div className="relative aspect-[332/166] w-full bg-gray-200">
          {item.url?.trim() ? (
            <Image
              src={item.url.trim()}
              alt={item.eventName?.trim() || '대회 배너'}
              fill
              className="object-cover"
              sizes="260px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800" />
          )}
        </div>
        <div className="bg-white px-3 py-2.5">
          <p className="text-[11px] text-gray-400">{formatDate(item.startTime)}</p>
          <p className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug text-gray-900">
            {item.eventName?.trim() || '대회 안내'}
          </p>
          <span className="mt-1.5 inline-block rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">
            바로가기 →
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────
   마퀴 아이템 — 가로 꽉 채운 이미지
─────────────────────────────────────────────── */
interface ItemProps {
  item: MainPageAdvertiseItem;
  keyPrefix: string;
  idx: number;
  hoveredKey: string | null;
  outerRef: React.RefObject<HTMLDivElement | null>;
  onEnter: (key: string, y: number) => void;
  onLeave: () => void;
}
function MarqueeItem({ item, keyPrefix, idx, hoveredKey, outerRef, onEnter, onLeave }: ItemProps) {
  const key = `${keyPrefix}-${item.eventId ?? item.url}-${idx}`;
  const isHovered = hoveredKey === key;
  const href = advertiseHref(item);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!outerRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const outerRect = outerRef.current.getBoundingClientRect();
    const y = rect.top + rect.height / 2 - outerRect.top;
    onEnter(key, y);
  };

  return (
    <li
      className="relative w-full shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      <a
        href={href}
        className="block w-full"
        {...(href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {item.url?.trim() ? (
          <Image
            src={item.url.trim()}
            alt={item.eventName?.trim() || '대회 배너'}
            width={400}
            height={200}
            sizes="190px"
            className="h-auto w-full select-none object-cover"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{
              outline: isHovered ? '3px solid #F97316' : '3px solid transparent',
              outlineOffset: '-3px',
              transition: 'outline-color 0.15s',
            }}
          />
        ) : (
          <div className="aspect-[2/1] w-full bg-gray-200" />
        )}
      </a>
    </li>
  );
}

/* ──────────────────────────────────────────────
   메인 컴포넌트
─────────────────────────────────────────────── */
export default function EventIntroSidebar() {
  const [items, setItems] = useState<MainPageAdvertiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popInfo, setPopInfo] = useState<{ key: string; y: number } | null>(null);

  const outerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 데이터 fetch */
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
    if (!BASE) { setLoading(false); return; }
    fetch(`${BASE}/api/v1/public/main-page/advertise`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        const list = parseItems(json).filter((x) => Boolean(x?.url?.trim()));
        setItems(list.slice(0, 9));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  /* 루프용 아이템 — 최소 6개 이상 × 3배 복사 */
  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    return Array.from(
      { length: Math.max(6, items.length * 3) },
      (_, i) => items[i % items.length]
    );
  }, [items]);

  /* 세로 마퀴 — 스폰서와 동일한 rAF 방식 */
  useEffect(() => {
    if (!marqueeRef.current || !listRef.current || loopItems.length === 0) return;

    let offset = 0;
    let listHeight = listRef.current.scrollHeight;

    const updateHeight = () => {
      if (listRef.current) listHeight = listRef.current.scrollHeight;
    };
    const ro = new ResizeObserver(updateHeight);
    ro.observe(listRef.current);

    const tick = () => {
      if (!pausedRef.current && listHeight > 0) {
        offset -= SPEED;
        if (Math.abs(offset) >= listHeight) offset += listHeight;
        if (marqueeRef.current) {
          marqueeRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [loopItems.length]);

  /* 휠 스크롤: 오프셋 직접 이동 */
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
  }, []);

  /* 호버 핸들러 — li → PopCard 이동 시 사라지지 않도록 타이머 방식 */
  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleEnter = useCallback((key: string, y: number) => {
    cancelHide();
    pausedRef.current = true;
    setPopInfo({ key, y });
  }, [cancelHide]);

  const handleLeave = useCallback(() => {
    /* 150ms 후 숨김 — PopCard onMouseEnter 가 먼저 오면 취소됨 */
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      setPopInfo(null);
      hideTimerRef.current = null;
    }, 150);
  }, [cancelHide]);

  const handlePopCardEnter = useCallback(() => {
    cancelHide();
    pausedRef.current = true;
  }, [cancelHide]);

  const handlePopCardLeave = useCallback(() => {
    pausedRef.current = false;
    setPopInfo(null);
  }, []);

  /* 현재 팝아웃 아이템 */
  const popItem = useMemo(() => {
    if (!popInfo) return null;
    return loopItems.find((_, i) => {
      const k1 = `a-${loopItems[i]?.eventId ?? loopItems[i]?.url}-${i}`;
      const k2 = `b-${loopItems[i]?.eventId ?? loopItems[i]?.url}-${i}`;
      return k1 === popInfo.key || k2 === popInfo.key;
    }) ?? null;
  }, [popInfo, loopItems]);

  /* 팝아웃 아이템을 key로 직접 찾기 */
  const popItemFromKey = useMemo(() => {
    if (!popInfo) return null;
    const parts = popInfo.key.split('-');
    const prefix = parts[0];
    const idxStr = parts[parts.length - 1];
    const idx = parseInt(idxStr, 10);
    if (Number.isNaN(idx)) return null;
    return prefix === 'a' || prefix === 'b' ? loopItems[idx] ?? null : null;
  }, [popInfo, loopItems]);

  return (
    /* outer: overflow:visible → PopCard 가 왼쪽으로 나올 수 있음 */
    <div
      ref={outerRef}
      className="relative h-full w-full"
      style={{ overflow: 'visible' }}
    >
      {/* 스크롤 클립 영역 — overflow:hidden 으로 마퀴를 잘라냄 */}
      <div
        className="absolute inset-0 overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; setPopInfo(null); }}
        onWheel={onWheel}
      >
        {loading ? (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[2/1] w-full animate-pulse bg-zinc-200" />
            ))}
          </div>
        ) : (
          <div
            ref={marqueeRef}
            className="flex w-full flex-col will-change-transform"
          >
            {/* 리스트 A — 높이 측정 기준 */}
            <ul ref={listRef} className="flex w-full flex-col">
              {loopItems.map((item, i) => (
                <MarqueeItem
                  key={`a-${item.eventId ?? item.url}-${i}`}
                  item={item}
                  keyPrefix="a"
                  idx={i}
                  hoveredKey={popInfo?.key ?? null}
                  outerRef={outerRef}
                  onEnter={handleEnter}
                  onLeave={handleLeave}
                />
              ))}
            </ul>
            {/* 리스트 B — 끊김 없는 루프용 */}
            <ul className="flex w-full flex-col" aria-hidden>
              {loopItems.map((item, i) => (
                <MarqueeItem
                  key={`b-${item.eventId ?? item.url}-${i}`}
                  item={item}
                  keyPrefix="b"
                  idx={i}
                  hoveredKey={popInfo?.key ?? null}
                  outerRef={outerRef}
                  onEnter={handleEnter}
                  onLeave={handleLeave}
                />
              ))}
            </ul>
          </div>
        )}

        {/* 상단 페이드 */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: FADE_H,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, transparent 100%)',
          }}
        />
        {/* 하단 페이드 */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: FADE_H,
            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* 팝아웃 카드 — 클립 영역 밖(outerRef 기준) absolute */}
      {popInfo && (popItemFromKey ?? popItem) && (
        <PopCard
          item={(popItemFromKey ?? popItem)!}
          visible
          topPx={popInfo.y}
          onMouseEnter={handlePopCardEnter}
          onMouseLeave={handlePopCardLeave}
        />
      )}
    </div>
  );
}
