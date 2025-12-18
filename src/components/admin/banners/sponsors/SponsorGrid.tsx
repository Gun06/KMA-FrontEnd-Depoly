"use client";

import React from "react";
import Image from "next/image";

export type SponsorGridItem = {
  id: string | number;
  url: string;
  imageUrl: string | null;
  visible: boolean;
  orderNo: number;
};

interface SponsorGridProps {
  items: SponsorGridItem[];
  onItemClick?: (id: string | number) => void;
}

export default function SponsorGrid({ items, onItemClick }: SponsorGridProps) {
  if (!items.length) return null;

  // 기본 이미지
  const defaultImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f3f4f6' width='400' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

  return (
    <div className="w-full py-6">
      <ul className="flex flex-wrap items-start gap-4 md:gap-6">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              onClick={onItemClick ? () => onItemClick(item.id) : undefined}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="relative w-[300px] md:w-[400px] aspect-[2/1] overflow-hidden rounded-lg border-2 border-gray-200 bg-white group-hover:border-blue-400 transition-colors">
                <Image
                  src={item.imageUrl || defaultImageUrl}
                  alt={item.url || "스폰서 이미지"}
                  fill
                  sizes="(max-width: 768px) 300px, 400px"
                  unoptimized
                  style={{ objectFit: 'cover' }}
                  priority={false}
                  className="rounded-lg"
                />
                {/* 공개 여부 배지 */}
                <div className="absolute top-2 right-2">
                  {item.visible ? (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium bg-[#1E5EFF] text-white">
                      공개
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium bg-[#EF4444] text-white">
                      비공개
                    </span>
                  )}
                </div>
                {/* URL 오버레이 (있는 경우) */}
                {item.url && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate">
                    {item.url}
                  </div>
                )}
                {/* 호버 시 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                    클릭하여 수정
                  </span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
