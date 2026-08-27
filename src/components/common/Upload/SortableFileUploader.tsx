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
import { createVideoLinkUploadItem, mapFilesToItems } from "./utils";
import type { MultipleUploaderProps, UploadItem } from "./types";
import type { PageMediaKey } from "@/utils/pendingVideoLinks";
import { registerPageMedia } from "@/utils/pendingVideoLinks";
import { getYoutubeVideoId } from "@/utils/youtube";

type Props = MultipleUploaderProps & {
  /** true면 파일 1개만 업로드 가능, 업로드 후 버튼 숨김, 카운트/전체삭제 숨김 */
  single?: boolean;
  /** 유튜브 영상 링크를 이미지와 함께 등록 */
  allowVideoLink?: boolean;
  /** 저장 직전 입력 중인 영상 링크를 반영할 페이지 키 */
  pageMediaKey?: PageMediaKey;
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
  allowVideoLink = false,
  pageMediaKey,
}: Props) {
  const effectiveMultiple = single ? false : multiple;
  const effectiveMaxCount = single ? 1 : maxCount;

  const [items, setItems] = React.useState<UploadItem[]>(value ?? []);
  const [pendingVideoUrl, setPendingVideoUrl] = React.useState("");
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const controlled = value !== undefined;
  const itemsRef = React.useRef<UploadItem[]>(value ?? []);
  const pendingVideoUrlRef = React.useRef("");
  const onChangeRef = React.useRef(onChange);
  const controlledRef = React.useRef(controlled);
  onChangeRef.current = onChange;
  controlledRef.current = controlled;

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (controlled) setItems(value ?? []);
  }, [controlled, value]);

  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const setList = (next: UploadItem[]) => {
    itemsRef.current = next;
    onChangeRef.current?.(next);
    if (!controlledRef.current) setItems(next);
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

    const current = itemsRef.current;
    const remain = Math.max(0, effectiveMaxCount - current.length);
    const picked = remain ? files.slice(0, remain) : [];
    const added = mapFilesToItems(picked, maxSizeMB);
    const merged = [...current, ...added];

    if (totalMaxMB) {
      const sum = merged.reduce((acc, f) => acc + f.sizeMB, 0);
      if (sum > totalMaxMB) {
        alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
        return;
      }
    }
    setList(merged);
  };

  const addVideoLink = React.useCallback(
    (rawUrl?: string): boolean => {
      const url = (rawUrl ?? pendingVideoUrlRef.current).trim();
      if (!url) return false;

      if (!getYoutubeVideoId(url)) {
        setVideoError("유튜브 링크를 확인해주세요.");
        return false;
      }

      const current = itemsRef.current;
      if (current.length >= effectiveMaxCount) {
        setVideoError(`최대 ${effectiveMaxCount}개까지 등록할 수 있습니다.`);
        return false;
      }

      const exists = current.some(
        (item) => (item.url ?? "").trim() === url
      );
      if (exists) {
        setVideoError("이미 등록된 링크입니다.");
        return false;
      }

      setList([...current, createVideoLinkUploadItem(url)]);
      pendingVideoUrlRef.current = "";
      setPendingVideoUrl("");
      setVideoError(null);
      return true;
    },
    // setList는 ref 기반이라 최신 onChange를 사용함
    [effectiveMaxCount]
  );

  const addVideoLinkRef = React.useRef(addVideoLink);
  addVideoLinkRef.current = addVideoLink;

  React.useEffect(() => {
    if (!allowVideoLink || !pageMediaKey) return;
    return registerPageMedia(pageMediaKey, {
      flush: () => {
        addVideoLinkRef.current();
      },
      getItems: () => itemsRef.current,
    });
  }, [allowVideoLink, pageMediaKey]);

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
  const canAddVideo = allowVideoLink && !disabled && items.length < effectiveMaxCount;

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {!(single && hasItems) && (
          <UploadButton
            label={allowVideoLink ? "이미지 업로드" : label}
            accept={accept}
            multiple={effectiveMultiple}
            disabled={disabled}
            onFilesSelected={handleSelect}
          />
        )}
        <p className="flex-1 min-w-0 text-[13px] text-[#8A949E]" aria-live="polite">
          {hasItems ? (
            <>
              <b className="text-[#256EF4] font-semibold">{items.length}</b>
              <span> / {effectiveMaxCount}</span>
            </>
          ) : (
            helper || (single ? `${maxSizeMB}MB 이내` : null)
          )}
        </p>
        {!single && hasItems && (
          <button
            type="button"
            onClick={removeAll}
            className="text-[13px] text-[#6B7280] hover:text-[#DC2626]"
          >
            전체 삭제
          </button>
        )}
      </div>

      {allowVideoLink && !(single && hasItems) && (
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="url"
            value={pendingVideoUrl}
            onChange={(e) => {
              pendingVideoUrlRef.current = e.target.value;
              setPendingVideoUrl(e.target.value);
              if (videoError) setVideoError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVideoLink();
              }
            }}
            placeholder="유튜브 링크 붙여넣기"
            disabled={!canAddVideo}
            className="flex-1 min-w-0 h-9 bg-transparent border-0 border-b border-[#D1D5DB] px-0 text-[13px] outline-none focus:border-[#256EF4] disabled:text-gray-400"
          />
          <button
            type="button"
            onClick={() => addVideoLink()}
            disabled={!canAddVideo || !pendingVideoUrl.trim()}
            className="shrink-0 text-[13px] text-[#256EF4] font-medium disabled:text-[#C0C5CC]"
          >
            영상 추가
          </button>
        </div>
      )}
      {videoError && (
        <p className="mt-1 text-[12px] text-[#B42318]">{videoError}</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <div className={cn(hasItems && "mt-2")}>
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
