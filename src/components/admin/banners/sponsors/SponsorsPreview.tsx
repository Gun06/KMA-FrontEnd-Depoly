'use client';

import React from 'react';
import Image from 'next/image';
import type { UploadItem } from '@/components/common/Upload/types';

export type SponsorsPreviewRow = {
  visible: boolean;
  url: string;
  file: UploadItem | null;
};

type Props = { rows: SponsorsPreviewRow[] };

/** File -> data:URL (미리보기 전용) */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ''));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

/** UploadItem에서 File 객체 추출 */
function extractFileObject(f: unknown): File | undefined {
  if (f instanceof File) return f;
  if (f && typeof f === 'object') {
    const obj = f as Record<string, unknown>;
    if (obj.file instanceof File) return obj.file;
  }
  return undefined;
}

export default function SponsorsPreview({ rows }: Props) {
  const [items, setItems] = React.useState<Array<{ url: string; alt: string }>>([]);
  const marqueeRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      // 1. File 객체가 있는 항목들을 data:URL로 변환
      const filePromises = rows
        .filter((r) => r.visible && r.file)
        .map(async (r) => {
          const file = extractFileObject(r.file);
          if (!file) return null;

          try {
            const dataUrl = await readAsDataURL(file);
            return { url: dataUrl, alt: file.name };
          } catch (_error) {
            return null;
          }
        });

      const fileResults = await Promise.all(filePromises);
      const fileItems = fileResults.filter((item): item is { url: string; alt: string } => item !== null);

      // 2. URL이 있는 항목들 (서버에서 가져온 이미지)
      const urlItems = rows
        .filter((r) => r.visible && r.url)
        .map((r) => ({ url: r.url, alt: 'Sponsor' }));

      // 3. 합치고 중복 제거 (URL 기준)
      const allItems = [...fileItems, ...urlItems];
      const uniqueItems = allItems.filter((item, index, arr) => 
        arr.findIndex(other => other.url === item.url) === index
      );

      // 4. 최소 12개가 되도록 반복 (기존 로직 유지)
      const base = uniqueItems;
      const dup = base.length > 0
        ? Array.from({ length: Math.max(12, base.length * 3) }, (_, i) => base[i % base.length])
        : [];

      if (alive) setItems(dup);
    })();

    return () => {
      alive = false;
    };
  }, [rows]);

  React.useEffect(() => {
    if (!marqueeRef.current || !listRef.current || items.length === 0) return;

    let animationFrameId: number;
    let offset = 0;
    let listWidth = listRef.current.scrollWidth;
    const speed = 1.6;

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
  }, [items.length]);

  return (
    <section
      className="relative bg-white sponsor-section rounded-xl border mb-56 md:mb-72 lg:mb-80 z-0"
      style={{
        height: 'var(--sectionH, 140px)',
        minHeight: 'var(--sectionH, 140px)'
      }}
    >

      {/* 이미지 트랙 (12개 반복, 중앙 정렬, 무한 이동) */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden z-10"
        style={{ height: 'var(--imgH, 80px)', minHeight: 'var(--imgH, 80px)' }}
      >
        <div ref={marqueeRef} className="marquee-track flex w-max items-center h-full leading-[0]">
          <ul ref={listRef} className="flex items-center gap-0 h-full px-0">
            {items.map((item, idx) => (
              <li key={`s-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <div className="block">
                  <Image 
                    src={item.url} 
                    alt={item.alt} 
                    height={100} 
                    width={200}
                    style={{ height: 'var(--imgH, 80px)' }} 
                    className="w-auto object-contain hover:opacity-80 transition-opacity" 
                  />
                </div>
              </li>
            ))}
          </ul>
          {/* 두 번째 트랙을 이어붙여 끊김 없는 루프 */}
          <ul className="flex items-center gap-0 px-0 h-full">
            {items.map((item, idx) => (
              <li key={`s2-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <div className="block">
                  <Image 
                    src={item.url} 
                    alt={item.alt} 
                    height={100} 
                    width={200}
                    style={{ height: 'var(--imgH, 80px)' }} 
                    className="w-auto object-contain hover:opacity-80 transition-opacity" 
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 양쪽 파란 테두리 + 흰색 배경 영역 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10" style={{ width: 'var(--leftW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10" style={{ width: 'var(--rightW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>

      {/* 아래 구분선(회색 계열) */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 z-10" />

      <style jsx>{`
        .marquee-track { will-change: transform; }
        /* Desktop default (>=1280px) */
        .sponsor-section {
          --sectionH: clamp(140px, 9vw, 160px); /* 자연스럽게 증가 */
          --imgH: clamp(80px, 5.4vw, 96px);
          --imgW: clamp(200px, 17vw, 300px);
          --leftW: clamp(96px, 6.5vw, 120px);
          --rightW: clamp(96px, 6.5vw, 120px);
        }
        /* 1024–1279px */
        @media (max-width: 1279px) and (min-width: 1024px) {
          .sponsor-section {
            --sectionH: 120px;
            --imgH: 70px;
            --leftW: 96px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 96px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* 768–1023px (Tablet) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .sponsor-section {
            --sectionH: 100px;
            --imgH: 60px;
            --leftW: 32px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 32px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* 480–767px (Phones) */
        @media (max-width: 767px) and (min-width: 480px) {
          .sponsor-section {
            --sectionH: 80px;
            --imgH: 50px;
            --leftW: 12px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 12px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* <=479px (Small phones) */
        @media (max-width: 479px) {
          .sponsor-section {
            --sectionH: 70px;
            --imgH: 44px;
            --leftW: 12px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 12px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
      `}</style>
    </section>
  );
}