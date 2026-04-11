"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { SponsorBanner } from "@/types/event";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function SponsorSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const [sponsorData, setSponsorData] = useState<SponsorBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLgUp = useMediaQuery("(min-width: 1024px)");

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const deskMarqueeRef = useRef<HTMLDivElement | null>(null);
  const deskListRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const fetchSponsorData = async () => {
      try {
        setIsLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          setSponsorData([]);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/v1/public/main-page/main-sponsor`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data: SponsorBanner[] = await response.json();
          const visibleBanners = data
            .filter((banner) => banner.visible)
            .sort((a, b) => a.orderNo - b.orderNo);
          setSponsorData(visibleBanners);
        } else {
          setSponsorData([]);
        }
      } catch {
        setSponsorData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSponsorData();
  }, []);

  const unique = sponsorData.filter(
    (b, i, arr) => arr.findIndex((o) => o.imageUrl === b.imageUrl) === i
  );

  /** 모바일·태블릿 가로 마퀴 */
  const marqueeLoop = useMemo(() => {
    if (unique.length === 0) return [];
    return Array.from({ length: Math.max(12, unique.length * 3) }, (_, i) => unique[i % unique.length]);
  }, [unique]);

  /** PC 세로 마퀴(끊김 없는 루프) */
  const deskVerticalLoop = useMemo(() => {
    if (unique.length === 0) return [];
    return Array.from({ length: Math.max(8, unique.length * 3) }, (_, i) => unique[i % unique.length]);
  }, [unique]);

  useEffect(() => {
    if (isLgUp || !marqueeRef.current || !listRef.current || marqueeLoop.length === 0) return;

    let animationFrameId: number;
    let offset = 0;
    let listWidth = listRef.current.scrollWidth;
    const speed = 0.85;

    const updateWidth = () => {
      if (!listRef.current) return;
      listWidth = listRef.current.scrollWidth;
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(listRef.current);

    const animate = () => {
      if (!marqueeRef.current || listWidth === 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      offset -= speed;
      if (Math.abs(offset) >= listWidth) {
        offset += listWidth;
      }

      marqueeRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isLgUp, marqueeLoop.length]);

  /** PC: 세로 순환 */
  useEffect(() => {
    if (!isLgUp || !deskMarqueeRef.current || !deskListRef.current || deskVerticalLoop.length === 0)
      return;

    let animationFrameId: number;
    let offset = 0;
    let listHeight = deskListRef.current.scrollHeight;
    const speed = 0.45;

    const updateHeight = () => {
      if (!deskListRef.current) return;
      listHeight = deskListRef.current.scrollHeight;
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(deskListRef.current);

    const animate = () => {
      if (!deskMarqueeRef.current || listHeight === 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      offset -= speed;
      if (Math.abs(offset) >= listHeight) {
        offset += listHeight;
      }

      deskMarqueeRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isLgUp, deskVerticalLoop.length]);

  const renderMarqueeImages = (keyPrefix: string) =>
    marqueeLoop.map((banner, idx) => (
      <li
        key={`${keyPrefix}-${banner.orderNo}-${idx}`}
        className="flex h-full shrink-0 items-stretch"
      >
        <a
          href={banner.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full max-h-full items-center"
        >
          <Image
            src={banner.imageUrl}
            alt={banner.url || "스폰서 배너"}
            width={320}
            height={120}
            sizes="(max-width: 1023px) 30vw, 200px"
            className="h-full max-h-full w-auto max-w-none object-contain object-center select-none"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </a>
      </li>
    ));

  const renderDeskVerticalItems = (keyPrefix: string) =>
    deskVerticalLoop.map((banner, idx) => (
      <li
        key={`${keyPrefix}-${banner.orderNo}-${idx}`}
        className="flex w-full shrink-0 items-center justify-center"
      >
        <a
          href={banner.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Image
            src={banner.imageUrl}
            alt={banner.url || "스폰서 배너"}
            width={640}
            height={360}
            sizes="(max-width: 1280px) 280px, 300px"
            className="h-auto w-full max-w-full object-contain select-none"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </a>
      </li>
    ));

  return (
    <section
      className="flex w-full min-h-0 flex-col lg:h-full lg:min-h-0"
      aria-labelledby="main-sponsors-heading"
    >
      {/* 주황 헤더 — hideHeader=true 이면 숨김 (page.tsx 에서 직접 렌더링) */}
      {!hideHeader && (
        <div
          className="mb-3 shrink-0 px-2 py-1.5"
          style={{ backgroundColor: '#F97316', borderRadius: '6px' }}
        >
          <h2
            id="main-sponsors-heading"
            className="font-giants text-[14px] font-bold tracking-wide text-white"
          >
            SPONSOR
          </h2>
        </div>
      )}
      {hideHeader && <h2 id="main-sponsors-heading" className="sr-only">스폰서</h2>}

      {/* 모바일 · 태블릿: 가로 무한 순환(마퀴) */}
      <div
        className="sponsor-marquee-area relative mt-3 overflow-hidden lg:hidden"
        style={
          {
            ["--marquee-h"]: "88px",
            ["--marquee-inner-h"]: "calc(var(--marquee-h) - 16px)",
            ["--fade-w"]: "clamp(12px, 4vw, 48px)",
          } as React.CSSProperties
        }
      >
        <div
          className="relative z-10 overflow-hidden"
          style={{ height: "var(--marquee-h)", minHeight: "var(--marquee-h)" }}
        >
          {isLoading && (
            <div
              className="absolute inset-0 z-20 flex items-center gap-2 overflow-hidden px-1.5 py-2 md:gap-2.5"
              aria-hidden
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`sk-${idx}`}
                  className="h-[var(--marquee-inner-h)] min-h-[52px] w-24 shrink-0 rounded-lg bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse sm:w-28 md:w-32"
                />
              ))}
            </div>
          )}

          {!isLoading && marqueeLoop.length > 0 && (
            <div
              className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 overflow-hidden"
              style={{ height: "var(--marquee-inner-h)" }}
            >
              <div
                ref={marqueeRef}
                className="marquee-track flex h-full w-max items-center leading-[0] will-change-transform"
              >
                <ul ref={listRef} className="flex h-full items-center gap-0 px-0">
                  {renderMarqueeImages("a")}
                </ul>
                <ul className="flex h-full items-center gap-0 px-0" aria-hidden>
                  {renderMarqueeImages("b")}
                </ul>
              </div>
            </div>
          )}

          {!isLoading && unique.length === 0 && (
            <div className="flex min-h-[var(--marquee-h)] items-center justify-center px-4 py-6 text-center text-sm text-zinc-400">
              등록된 스폰서 배너가 없습니다.
            </div>
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20"
          style={{
            width: "var(--fade-w)",
            background:
              "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20"
          style={{
            width: "var(--fade-w)",
            background:
              "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* 데스크톱: 주요대회일정+갤러리 열 높이까지 채우는 세로 순환 */}
      <div
        className="sponsor-desk-marquee-area relative mt-3 hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex"
        style={
          {
            ["--desk-fade-h"]: "28px",
          } as React.CSSProperties
        }
      >
        <div className="relative z-10 h-full min-h-0 flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex flex-col gap-1.5 p-2" aria-hidden>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`sk-desk-${i}`}
                  className="aspect-[16/9] w-full animate-pulse rounded-lg bg-zinc-200"
                />
              ))}
            </div>
          )}

          {!isLoading && deskVerticalLoop.length > 0 && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                ref={deskMarqueeRef}
                className="desk-marquee-track flex w-full flex-col will-change-transform"
              >
                <ul ref={deskListRef} className="flex w-full flex-col gap-0">
                  {renderDeskVerticalItems("va")}
                </ul>
                <ul className="flex w-full flex-col gap-0" aria-hidden>
                  {renderDeskVerticalItems("vb")}
                </ul>
              </div>
            </div>
          )}

          {!isLoading && unique.length === 0 && (
            <div className="flex min-h-[160px] items-center justify-center px-4 py-10 text-center text-sm text-zinc-400">
              등록된 스폰서 배너가 없습니다.
            </div>
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          style={{
            height: "var(--desk-fade-h)",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
          style={{
            height: "var(--desk-fade-h)",
            background:
              "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)",
          }}
        />
      </div>

      <style jsx global>{`
        .sponsor-marquee-area .marquee-track img {
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none;
        }
        .sponsor-marquee-area .marquee-track a {
          pointer-events: auto;
        }
        .sponsor-desk-marquee-area .desk-marquee-track img {
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none;
        }
        .sponsor-desk-marquee-area .desk-marquee-track a {
          pointer-events: auto;
        }
      `}</style>
    </section>
  );
}
