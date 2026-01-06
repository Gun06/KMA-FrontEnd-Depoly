// src/components/common/Upload/SortableFileUploader.tsx
"use client";

import React from "react";
import { cn } from "@/utils/cn";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import UploadButton from "./UploadButton";
import SortableFileItem from "./SortableFileItem";
import { mapFilesToItems } from "./utils";
import type { MultipleUploaderProps, UploadItem } from "./types";

type Props = MultipleUploaderProps & {
  /** true면 파일 1개만 업로드 가능, 업로드 후 버튼 숨김, 카운트/전체삭제 숨김 */
  single?: boolean;
};

export default function SortableFileUploader({
  single = false,
  label = "첨부파일 업로드",
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg",
  maxSizeMB = 20,
  helper = "선택된 파일 없음. 최대 10개 / 20MB 이내",
  multiple = true,
  maxCount = 10,
  totalMaxMB,
  disabled,
  value,
  onChange,
  className,
}: Props) {
  const effectiveMultiple = single ? false : multiple;
  const effectiveMaxCount = single ? 1 : maxCount;

  const [items, setItems] = React.useState<UploadItem[]>(value ?? []);
  const controlled = value !== undefined;

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (controlled) setItems(value ?? []);
  }, [controlled, value]);

  const setList = (next: UploadItem[]) => {
    onChange?.(next);
    if (!controlled) setItems(next);
  };

  const handleSelect = (list: FileList) => {
    const files = Array.from(list);
    if (!files.length) return;

    if (single) {
      const picked = files.slice(0, 1);
      const added = mapFilesToItems(picked, maxSizeMB);

      if (totalMaxMB) {
        const sum = added.reduce((acc, f) => acc + f.sizeMB, 0);
        if (sum > totalMaxMB) {
          alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
          return;
        }
      }
      setList(added);
      return;
    }

    const remain = Math.max(0, effectiveMaxCount - items.length);
    const picked = remain ? files.slice(0, remain) : [];
    const added = mapFilesToItems(picked, maxSizeMB);
    const merged = [...items, ...added];

    if (totalMaxMB) {
      const sum = merged.reduce((acc, f) => acc + f.sizeMB, 0);
      if (sum > totalMaxMB) {
        alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
        return;
      }
    }
    setList(merged);
  };

  const removeOne = (id: string) => setList(items.filter((it) => it.id !== id));
  const removeAll = () => setList([]);

  // 드래그 종료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      setList(reordered);
    }
  };

  // 위/아래 버튼으로 순서 변경
  const moveUp = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index > 0) {
      const reordered = arrayMove(items, index, index - 1);
      setList(reordered);
    }
  };

  const moveDown = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index < items.length - 1) {
      const reordered = arrayMove(items, index, index + 1);
      setList(reordered);
    }
  };

  const hasItems = items.length > 0;

  return (
    <div className={cn("w-full min-w-0", className)}>
      {/* 버튼 + 설명 (single 모드: 업로드 후 버튼/헬퍼 숨김) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        {!(single && hasItems) && (
          <UploadButton
            label={label}
            accept={accept}
            multiple={effectiveMultiple}
            disabled={disabled}
            onFilesSelected={handleSelect}
            className="self-start"
          />
        )}
        {!(single && hasItems) && (
          <p className="text-xs sm:text-sm text-[#8A949E] sm:ml-2">
            {single ? `선택된 파일 없음 / ${maxSizeMB}MB 이내` : helper}
          </p>
        )}
      </div>

      {/* 멀티 전용: 카운트 + 전체 삭제 */}
      {!single && hasItems && (
        <div className="mt-3 flex items-center justify-between" aria-live="polite">
          <span className="text-[14px] sm:text-[15px] text-[#0F1113]">
            <b className="text-[#256EF4]">{items.length}개</b> / {effectiveMaxCount}개
          </span>
          <button
            type="button"
            onClick={removeAll}
            className="rounded-[8px] border border-[#D1D5DB] px-3 py-1.5 text-sm text-[#374151] hover:bg-gray-50"
          >
            전체 파일 삭제
          </button>
        </div>
      )}

      {/* 드래그 앤 드롭 리스트 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <div className={cn("space-y-3", !single && hasItems && "mt-3")}>
            {items.map((it, index) => (
              <SortableFileItem
                key={it.id}
                item={it}
                index={index}
                totalCount={items.length}
                onRemove={removeOne}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

