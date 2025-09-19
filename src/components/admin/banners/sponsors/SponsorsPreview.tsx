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
function extractFileObject(f: any): File | undefined {
  return f instanceof File
    ? f
    : f?.file instanceof File
    ? f.file
    : f?.rawFile instanceof File
    ? f.rawFile
    : f?.originFileObj instanceof File
    ? f.originFileObj
    : undefined;
}

export default function SponsorsPreview({ rows }: Props) {
  const [items, setItems] = React.useState<{ src: string; href: string }[]>([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      // 1) 공개 항목만
      const visible = rows.filter((r) => r.visible);

      // 2) src 만들기: previewUrl > http(s) url > File -> dataURL
      const built = await Promise.all(
        visible.map(async (r) => {
          const f: any = r.file;
          if (!f) return null;

          if (typeof f?.previewUrl === 'string' && f.previewUrl) {
            return { src: f.previewUrl as string, href: r.url || '#' };
          }
          if (typeof f?.url === 'string' && /^https?:\/\//i.test(f.url)) {
            return { src: f.url as string, href: r.url || '#' };
          }
          const fileObj = extractFileObject(f);
          if (fileObj) {
            try {
              const dataUrl = await readAsDataURL(fileObj);
              return { src: dataUrl, href: r.url || '#' };
            } catch {
              return null;
            }
          }
          return null;
        })
      );

      const base = (built.filter(Boolean) as { src: string; href: string }[]) ?? [];

      // 3) 무한 마퀴 자연스럽게: 최소 12칸 이상 채우기
      const dup = base.length
        ? Array.from({ length: Math.max(12, base.length * 3) }, (_, i) => base[i % base.length])
        : [];

      if (alive) setItems(dup);
    })();

    return () => {
      alive = false;
    };
  }, [rows]);

  return (
  <section className="relative bg-white sponsor-section rounded-xl border mb-56 md:mb-72 lg:mb-80">
      {/* 좌측 SPONSOR 라벨 */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 h-full">
          <div className="h-full flex items-center pl-6 md:pl-20">
            <h2 className="font-giants text-[clamp(12px,2.8vw,22px)] md:text-[clamp(14px,2.2vw,26px)] text-gray-900">
              SPONSOR
            </h2>
          </div>
        </div>
      </div>

      {/* 트랙 */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden z-10"
        style={{ height: 'var(--imgH)' }}
      >
        {items.length > 0 ? (
          <div className="marquee flex items-center h-full leading-[0]">
            {[0, 1].map((k) => (
              <ul key={k} className="flex items-center gap-0 px-0 h-full whitespace-nowrap">
                {items.map((it, idx) => (
                  <li
                    key={`${k}-${idx}`}
                    className="shrink-0 flex items-center justify-center h-full relative"
                    style={{ minWidth: 'calc(var(--imgH) * 1.4)' }}
                  >
                    <a
                      href={it.href || '#'}
                      target={it.href && it.href !== '#' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="inline-block h-full w-full"
                    >
                      {/* Image: fill + object-contain, 최적화 off(관리 미리보기) */}
                      <div className="relative h-full" style={{ width: 'calc(var(--imgH) * 1.4)' }}>
                        <Image
                          src={it.src}
                          alt=""
                          fill
                          unoptimized
                          sizes="(max-width: 1920px) 20vw, 360px"
                          className="object-contain"
                          onError={(e) =>
                            console.warn('[SponsorsPreview] 이미지 로드 실패:', (e as any).target?.src)
                          }
                          priority={k === 0 && idx < 6}
                        />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-gray-500">노출할 스폰서 이미지가 없습니다.</span>
          </div>
        )}
      </div>

      {/* 페이드 마스크 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20" style={{ width: 'var(--leftW)' }}>
        <div
          className="h-full w-full"
          style={{ background: 'linear-gradient(to right, #fff 0%, #fff 70%, rgba(255,255,255,0) 100%)' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20" style={{ width: 'var(--rightW)' }}>
        <div
          className="h-full w-full"
          style={{ background: 'linear-gradient(to left, #fff 0%, #fff 70%, rgba(255,255,255,0) 100%)' }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 z-[60]" />

      <style jsx>{`
        .marquee {
          animation: marquee 45s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .sponsor-section {
          --sectionH: 140px;
          --imgH: 80px;
          --leftW: 320px;
          --rightW: 220px;
          height: var(--sectionH);
        }
        @media (max-width: 1279px) and (min-width: 1024px) {
          .sponsor-section {
            --sectionH: 120px;
            --imgH: 70px;
            --leftW: 280px;
            --rightW: 200px;
          }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .sponsor-section {
            --sectionH: 100px;
            --imgH: 60px;
            --leftW: 260px;
            --rightW: 180px;
          }
        }
        @media (max-width: 767px) and (min-width: 480px) {
          .sponsor-section {
            --sectionH: 80px;
            --imgH: 50px;
            --leftW: 200px;
            --rightW: 140px;
          }
        }
        @media (max-width: 479px) {
          .sponsor-section {
            --sectionH: 70px;
            --imgH: 44px;
            --leftW: 160px;
            --rightW: 100px;
          }
        }
      `}</style>
    </section>
  );
}
