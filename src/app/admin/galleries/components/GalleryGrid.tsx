"use client";

import React from "react";
import GalleryCard from "@/components/common/GalleryCard";

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

const formatDate = (dateStr: string) => (dateStr ? dateStr.replace(/-/g, ".") : "");

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  if (!items.length) return null;

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <GalleryCard
            imageSrc={item.thumbnailUrl}
            imageAlt={item.eventName}
            tagName={item.tagName}
            title={item.eventName}
            date={formatDate(item.eventStartDate)}
            onClick={onItemClick ? () => onItemClick(item.id) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
