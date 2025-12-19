"use client";

import React from "react";
import GalleryCard from "@/components/main/GallerySection/GalleryCard";

export type GalleryGridItem = {
  id: string;
  eventName: string;
  eventStartDate: string; // YYYY-MM-DD
  thumbnailUrl: string;
  googlePhotoUrl: string;
  tagName: string;
};

interface GalleryGridProps {
  items: GalleryGridItem[];
  onItemClick?: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  // "2025-12-17" -> "2025.12.17"
  return dateStr.replace(/-/g, ".");
};

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  if (!items.length) return null;

  return (
    <div className="w-full py-6">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => (
          <li key={item.id} className="w-full">
            <button
              type="button"
              onClick={onItemClick ? () => onItemClick(item.id) : undefined}
              className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-full flex justify-center">
                <GalleryCard
                  imageSrc={item.thumbnailUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E"}
                  imageAlt={item.eventName}
                  subtitle={item.tagName || "태그명"}
                  title={item.eventName}
                  date={formatDate(item.eventStartDate)}
                  disableAnimation
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
