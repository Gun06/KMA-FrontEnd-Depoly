"use client";

import React from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export type MainBannerGridItem = {
  id: string | number;
  title: string;
  subtitle: string;
  date: string;
  eventId?: string;
  imageUrl: string | null;
  visible: boolean;
  orderNo: number;
};

interface MainBannerGridProps {
  items: MainBannerGridItem[];
  onItemClick?: (id: string | number) => void;
  onReorder?: (items: MainBannerGridItem[]) => void;
}

function SortableBannerItem({
  item,
  onItemClick,
}: {
  item: MainBannerGridItem;
  onItemClick?: (id: string | number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const defaultImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f3f4f6' width='400' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

  return (
    <li ref={setNodeRef} style={style} className="shrink-0 transition-transform duration-200 ease-out relative">
      <div className="relative overflow-visible">
        <button
          type="button"
          onClick={onItemClick ? () => onItemClick(item.id) : undefined}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group w-full overflow-visible"
        >
          <div className={`relative w-[300px] md:w-[400px] aspect-[2/1] overflow-visible rounded-lg border-2 ${
            isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
          } bg-white group-hover:border-blue-400 transition-colors`}>
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <Image
                src={item.imageUrl || defaultImageUrl}
                alt={item.title || "메인 배너 이미지"}
                fill
                sizes="(max-width: 768px) 300px, 400px"
                unoptimized
                style={{ objectFit: 'cover' }}
                priority={false}
                className="rounded-lg"
              />
            </div>
            {/* 순서 번호 배지와 드래그 핸들 - 왼쪽 상단 */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/70 text-white text-xs font-bold backdrop-blur-sm border border-white/20 flex-shrink-0">
                {item.orderNo}
              </span>
              {/* 드래그 핸들 - 순서 번호 바로 옆 */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm relative group/drag inline-flex items-center justify-center flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
                style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
              >
                <GripVertical className="w-4 h-4 text-white" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                {/* 툴팁 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/drag:block z-[100] pointer-events-none whitespace-nowrap">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                    드래그하여 순서 변경
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* 배너 정보 오버레이 - 텍스트가 있을 때만 표시 */}
            {(item.title || item.subtitle || item.date) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/40 text-white p-3">
                {item.title && (
                  <div className="text-sm font-semibold truncate mb-1">{item.title}</div>
                )}
                {item.subtitle && (
                  <div className="text-xs truncate mb-1">{item.subtitle}</div>
                )}
                {item.date && (
                  <div className="text-xs text-white/80">{item.date}</div>
                )}
              </div>
            )}
            {/* 호버 시 오버레이 */}
            {!isDragging && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                  클릭하여 수정
                </span>
              </div>
            )}
          </div>
        </button>
      </div>
    </li>
  );
}

export default function MainBannerGrid({ items, onItemClick, onReorder }: MainBannerGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => String(item.id) === active.id);
      const newIndex = items.findIndex((item) => String(item.id) === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      // orderNo 업데이트
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        orderNo: index + 1,
      }));

      if (onReorder) {
        onReorder(updatedItems);
      }
    }
  };

  if (!items.length) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full py-6 overflow-visible">
        <SortableContext
          items={items.map((item) => String(item.id))}
          strategy={rectSortingStrategy}
        >
          <ul className="flex flex-wrap items-start gap-4 md:gap-6 overflow-visible">
            {items.map((item) => (
              <SortableBannerItem
                key={item.id}
                item={item}
                onItemClick={onItemClick}
              />
            ))}
          </ul>
        </SortableContext>
      </div>
    </DndContext>
  );
}

