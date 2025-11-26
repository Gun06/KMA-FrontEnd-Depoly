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

  return (
    <section className="relative bg-white sponsor-section rounded-xl border mb-56 md:mb-72 lg:mb-80" style={{ height: 'var(--sectionH)' }}>
      {/* 타이틀 */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 h-full">
          <div className="h-full flex items-center pl-6 md:pl-20">
            <h2 className="font-giants text-[clamp(12px,2.8vw,22px)] md:text-[clamp(14px,2.2vw,26px)] text-gray-900">
              SPONSOR
            </h2>
          </div>
        </div>
      </div>

      {/* 이미지 트랙 (12개 반복, 중앙 정렬, 무한 이동) */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden z-10"
        style={{ height: 'var(--imgH)' }}
      >
        <div className="marquee flex w-max items-center h-full leading-[0]">
          <ul className="flex items-center gap-0 px-0 h-full">
            {items.map((item, idx) => (
              <li key={`s-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <div className="block">
                  <Image 
                    src={item.url} 
                    alt={item.alt} 
                    height={100} 
                    width={200}
                    style={{ height: 'var(--imgH)' }} 
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
                    style={{ height: 'var(--imgH)' }} 
                    className="w-auto object-contain hover:opacity-80 transition-opacity" 
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 양쪽 파란 테두리 + 흰색 배경 영역 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20" style={{ width: 'var(--leftW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20" style={{ width: 'var(--rightW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>

      {/* 아래 구분선(회색 계열) */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 z-[60]" />

      <style jsx>{`
        .marquee { animation: marquee 45s linear infinite; will-change: transform; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        /* Desktop default (>=1280px) */
        .sponsor-section {
          --sectionH: 140px;  /* 기본 높이 증가 */
          --imgH: 80px;       /* 이미지 트랙 높이 증가 */
          --leftW: 320px;     /* 좌측 오버레이 폭 확장 */
          --rightW: 220px;    /* 우측 오버레이 폭 확장 */
        }
        /* 1024–1279px */
        @media (max-width: 1279px) and (min-width: 1024px) {
          .sponsor-section {
            --sectionH: 120px;
            --imgH: 70px;
            --leftW: 280px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 200px;  /* 우측 오버레이 폭 확장 */
          }
        }
        /* 768–1023px (Tablet) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .sponsor-section {
            --sectionH: 100px;
            --imgH: 60px;
            --leftW: 260px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 180px;  /* 우측 오버레이 폭 확장 */
          }
        }
        /* 480–767px (Phones) */
        @media (max-width: 767px) and (min-width: 480px) {
          .sponsor-section {
            --sectionH: 80px;
            --imgH: 50px;
            --leftW: 200px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 140px;  /* 우측 오버레이 폭 줄임 */
          }
        }
        /* <=479px (Small phones) */
        @media (max-width: 479px) {
          .sponsor-section {
            --sectionH: 70px;
            --imgH: 44px;
            --leftW: 160px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 100px;  /* 우측 오버레이 폭 줄임 */
          }
        }
      `}</style>
    </section>
  );
}