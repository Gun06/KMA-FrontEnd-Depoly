'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MainPageAdvertiseItem, SponsorBanner } from '@/types/event';

/* ─── 공용 상수 ─── */
const PANEL_W     = 200;
const POPCARD_W   = 260;
const POPCARD_GAP = 10;

/* 대회안내 마퀴 */
const AD_MARQUEE_SPEED = 0.5;
const AD_VISIBLE       = 6;
const AD_GAP           = 8;
const AD_ASPECT        = 166 / 332;

/* 스폰서 마퀴 */
const SP_MARQUEE_SPEED = 0.5;
const SP_VISIBLE       = 5.5;
const SP_GAP           = 8;
const SP_ASPECT        = 9 / 16;

interface AdHoverInfo { item: MainPageAdvertiseItem; top: number; }
interface SpHoverInfo { item: SponsorBanner;          top: number; }

/** 헤더와 동일한 다크 프로스트 글라스 */
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,15,15,0.68)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

/* ─── 패널 헤더 ─── */
function PanelHeader({ title, accent, collapsed, onToggle }: {
  title: string; accent: string; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? '펼치기' : '접기'}
      className="pointer-events-auto flex w-full items-center justify-between rounded-2xl px-4 py-2.5 ring-1 ring-white/15 transition-all hover:brightness-125 active:opacity-80"
      style={GLASS_STYLE}
    >
      <h2 className="text-sm font-bold tracking-widest text-white" style={{ color: accent }}>{title}</h2>
      <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          className={`h-3 w-3 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} aria-hidden>
          <path d="M5 15l7-7 7 7" />
        </svg>
      </span>
    </button>
  );
}

/* ─── 대회안내 마퀴 ─── */
function AdMarquee({ items, loading, outerRef, onHoverChange }: {
  items: MainPageAdvertiseItem[];
  loading: boolean;
  outerRef: React.RefObject<HTMLDivElement | null>;
  onHoverChange: (info: AdHoverInfo | null) => void;
}) {
  const itemH        = Math.round(PANEL_W * AD_ASPECT);
  const itemWithGap  = itemH + AD_GAP;
  const containerH   = AD_VISIBLE * itemWithGap - AD_GAP;

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    const min = Math.max(AD_VISIBLE * 2, items.length);
    return Array.from({ length: min * 2 }, (_, i) => items[i % items.length]);
  }, [items]);

  const wrapRef            = useRef<HTMLDivElement>(null);
  const offsetRef          = useRef(0);
  const pausedRef          = useRef(false);
  const rafRef             = useRef<number>(0);
  const listARef           = useRef<HTMLDivElement>(null);
  const leaveTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const half  = Math.ceil(loopItems.length / 2);
  const listA = loopItems.slice(0, half);
  const listB = loopItems.slice(half);

  const renderItem = (item: MainPageAdvertiseItem, key: string) => {
    const handleEnter = (e: React.MouseEvent) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      pausedRef.current = true;
      const rect      = e.currentTarget.getBoundingClientRect();
      const panelRect = outerRef.current?.getBoundingClientRect();
      onHoverChange({ item, top: panelRect ? rect.top - panelRect.top : 0 });
    };
    const handleLeave = () => {
      leaveTimer.current = setTimeout(() => { pausedRef.current = false; onHoverChange(null); }, 120);
    };
    const inner = (
      <>
        <div className="absolute inset-0">
          <Image src={item.url} alt={item.eventName ?? '대회안내'} fill className="object-cover object-center" sizes={`${PANEL_W}px`} />
        </div>
        <div className="absolute inset-0" style={{ height: itemH }} />
        <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
      </>
    );
    const common = { className: cardShell, style: { height: itemH, flexShrink: 0 as const }, onMouseEnter: handleEnter, onMouseLeave: handleLeave };
    const href = item.eventId?.trim() ? `/event/${item.eventId.trim()}/guide/overview` : undefined;
    if (href) return <a key={key} href={href} {...common}>{inner}</a>;
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

/* ─── 스폰서 마퀴 ─── */
function SponsorMarquee({ items, loading, outerRef, onHoverChange }: {
  items: SponsorBanner[];
  loading: boolean;
  outerRef: React.RefObject<HTMLDivElement | null>;
  onHoverChange: (info: SpHoverInfo | null) => void;
}) {
  const itemH       = Math.round(PANEL_W * SP_ASPECT);
  const itemWithGap = itemH + SP_GAP;
  const containerH  = SP_VISIBLE * itemWithGap - SP_GAP;

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    const min = Math.max(SP_VISIBLE * 2, items.length);
    return Array.from({ length: min * 2 }, (_, i) => items[i % items.length]);
  }, [items]);

  const wrapRef            = useRef<HTMLDivElement>(null);
  const offsetRef          = useRef(0);
  const pausedRef          = useRef(false);
  const rafRef             = useRef<number>(0);
  const listARef           = useRef<HTMLDivElement>(null);
  const leaveTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const half  = Math.ceil(loopItems.length / 2);
  const listA = loopItems.slice(0, half);
  const listB = loopItems.slice(half);

  const renderItem = (item: SponsorBanner, key: string) => {
    const handleEnter = (e: React.MouseEvent) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      pausedRef.current = true;
      const rect      = e.currentTarget.getBoundingClientRect();
      const panelRect = outerRef.current?.getBoundingClientRect();
      onHoverChange({ item, top: panelRect ? rect.top - panelRect.top : 0 });
    };
    const handleLeave = () => {
      leaveTimer.current = setTimeout(() => { pausedRef.current = false; onHoverChange(null); }, 120);
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

/* ─── 팝아웃 카드 ─── */
function AdPopCard({ info, onEnter, onLeave }: { info: AdHoverInfo; onEnter: () => void; onLeave: () => void }) {
  const adW = Math.round(POPCARD_W * AD_ASPECT);
  const inner = (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10" style={{ width: POPCARD_W }}>
      <div className="relative w-full" style={{ height: adW }}>
        <Image src={info.item.url} alt={info.item.eventName ?? '대회안내'} fill className="object-cover object-center" sizes={`${POPCARD_W}px`} />
      </div>
      {info.item.eventName && (
        <div className="px-3 py-2 text-sm font-semibold text-gray-800 line-clamp-2">{info.item.eventName}</div>
      )}
    </div>
  );
  const common = {
    style: { position: 'absolute' as const, right: `calc(100% + ${POPCARD_GAP}px)`, top: info.top, zIndex: 60 },
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    className: 'animate-in fade-in slide-in-from-right-2 duration-150',
  };
  const href = info.item.eventId?.trim() ? `/event/${info.item.eventId.trim()}/guide/overview` : undefined;
  if (href) return <a href={href} {...common}>{inner}</a>;
  return <div {...common}>{inner}</div>;
}

function SpPopCard({ info, onEnter, onLeave }: { info: SpHoverInfo; onEnter: () => void; onLeave: () => void }) {
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

/* ─── 메인 export: 레이아웃에서 사용 ─── */
export default function FloatingPanels() {
  const [advertiseItems, setAdvertiseItems]   = useState<MainPageAdvertiseItem[]>([]);
  const [advertiseLoading, setAdvertiseLoading] = useState(true);
  const [sponsorItems, setSponsorItems]       = useState<SponsorBanner[]>([]);
  const [sponsorLoading, setSponsorLoading]   = useState(true);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

    const fetchAdvertise = async () => {
      try {
        if (!API_BASE_URL) { setAdvertiseItems([]); setAdvertiseLoading(false); return; }
        const res = await fetch(`${API_BASE_URL}/api/v1/public/main-page/advertise`, {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        });
        if (!res.ok) { setAdvertiseItems([]); return; }
        const json = await res.json();
        let list: MainPageAdvertiseItem[] = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (json && typeof json === 'object') {
          const o = json as Record<string, unknown>;
          const inner = o.content ?? o.data ?? o.items;
          if (Array.isArray(inner)) list = inner as MainPageAdvertiseItem[];
        }
        setAdvertiseItems(list.filter(x => Boolean(x?.url?.trim())).slice(0, 9));
      } catch { setAdvertiseItems([]); }
      finally { setAdvertiseLoading(false); }
    };

    const fetchSponsors = async () => {
      try {
        if (!API_BASE_URL) { setSponsorItems([]); setSponsorLoading(false); return; }
        const res = await fetch(`${API_BASE_URL}/api/v1/public/main-page/main-sponsor`, {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        });
        if (!res.ok) { setSponsorItems([]); return; }
        const data: SponsorBanner[] = await res.json();
        setSponsorItems(data.filter(b => b.visible).sort((a, b) => a.orderNo - b.orderNo));
      } catch { setSponsorItems([]); }
      finally { setSponsorLoading(false); }
    };

    void fetchAdvertise();
    void fetchSponsors();
  }, []);

  const panelRef     = useRef<HTMLDivElement>(null);
  const [openPanel, setOpenPanel] = useState<'ad' | 'sp' | null>('sp');
  const [adPopInfo, setAdPopInfo] = useState<AdHoverInfo | null>(null);
  const [spPopInfo, setSpPopInfo] = useState<SpHoverInfo | null>(null);
  const adLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePanel = (panel: 'ad' | 'sp') =>
    setOpenPanel(cur => (cur === panel ? null : panel));

  return (
    <div
      ref={panelRef}
      className="pointer-events-none fixed right-3 z-[145] hidden md:flex md:flex-col md:gap-3 md:pb-4 lg:right-[6vw] lg:gap-4"
      style={{ top: 'calc(var(--kma-main-header-offset, 80px) + 0.35rem)', width: PANEL_W }}
    >
      {adPopInfo && (
        <AdPopCard
          info={adPopInfo}
          onEnter={() => { if (adLeaveTimer.current) clearTimeout(adLeaveTimer.current); }}
          onLeave={() => { adLeaveTimer.current = setTimeout(() => setAdPopInfo(null), 120); }}
        />
      )}
      {spPopInfo && (
        <SpPopCard
          info={spPopInfo}
          onEnter={() => { if (spLeaveTimer.current) clearTimeout(spLeaveTimer.current); }}
          onLeave={() => { spLeaveTimer.current = setTimeout(() => setSpPopInfo(null), 120); }}
        />
      )}

      {/* 대회안내 패널 — 제목만 헤더 pill 글라스, 본문은 펼쳤을 때만 글라스 */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <PanelHeader title="대회안내" accent="#4ade80" collapsed={openPanel !== 'ad'}
          onToggle={() => { setAdPopInfo(null); togglePanel('ad'); }} />
        {openPanel === 'ad' && (
          <div className="overflow-hidden rounded-2xl p-2 ring-1 ring-white/15" style={GLASS_STYLE}>
            <AdMarquee
              items={advertiseItems}
              loading={advertiseLoading}
              outerRef={panelRef}
              onHoverChange={(info) => {
                if (adLeaveTimer.current) clearTimeout(adLeaveTimer.current);
                setAdPopInfo(info);
              }}
            />
          </div>
        )}
      </div>

      {/* 스폰서 패널 */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <PanelHeader title="SPONSOR" accent="#60a5fa" collapsed={openPanel !== 'sp'}
          onToggle={() => { setSpPopInfo(null); togglePanel('sp'); }} />
        {openPanel === 'sp' && (
          <div className="overflow-hidden rounded-2xl p-2 ring-1 ring-white/15" style={GLASS_STYLE}>
            <SponsorMarquee
              items={sponsorItems}
              loading={sponsorLoading}
              outerRef={panelRef}
              onHoverChange={(info) => {
                if (spLeaveTimer.current) clearTimeout(spLeaveTimer.current);
                setSpPopInfo(info);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
