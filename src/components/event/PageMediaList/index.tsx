"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Portal from "@/components/common/portal";
import type { PageMediaItem } from "@/types/pageMedia";
import { cn } from "@/utils/cn";
import { extractMediaUrl } from "@/utils/pageMedia";
import {
  getYoutubeThumbnailUrl,
  isVideoLinkMedia,
  toYoutubeEmbedUrl,
} from "@/utils/youtube";

type Props = {
  items: PageMediaItem[];
  altPrefix: string;
};

type ResolvedMedia = {
  url: string;
  isVideo: boolean;
  thumbnailUrl: string;
  embedUrl: string | null;
  isDirectVideo: boolean;
};

const MAX_VISIBLE = 3;

function isDirectVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function resolveMedia(item: PageMediaItem): ResolvedMedia {
  const url = extractMediaUrl(item) || item.imageUrl;
  const isVideo = isVideoLinkMedia(item.mediaType, url);
  const embedUrl = toYoutubeEmbedUrl(url);
  const thumbnailUrl =
    (isVideo ? getYoutubeThumbnailUrl(url) : null) || url;

  return {
    url,
    isVideo,
    thumbnailUrl,
    embedUrl,
    isDirectVideo: isVideo && isDirectVideoUrl(url),
  };
}

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

function MediaPreview({
  items,
  altPrefix,
  index,
  onClose,
  onChangeIndex,
}: {
  items: ResolvedMedia[];
  altPrefix: string;
  index: number;
  onClose: () => void;
  onChangeIndex: (next: number) => void;
}) {
  const current = items[index];
  const total = items.length;
  const autoplayEmbedUrl = current?.embedUrl
    ? `${current.embedUrl}&autoplay=1`
    : null;

  const goPrev = useCallback(() => {
    onChangeIndex((index - 1 + total) % total);
  }, [index, onChangeIndex, total]);

  const goNext = useCallback(() => {
    onChangeIndex((index + 1) % total);
  }, [index, onChangeIndex, total]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[600] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`${altPrefix} 미리보기`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-2xl"
          aria-hidden="true"
          onClick={onClose}
        />

        <div className="relative flex items-center justify-between px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-sm text-white/80 sm:px-4 md:px-6">
          <p className="tabular-nums">
            {index + 1} / {total}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-10 md:px-20">
          {total > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-2 sm:h-10 sm:w-10 md:left-6"
              aria-label="이전"
            >
              ‹
            </button>
          )}

          {autoplayEmbedUrl ? (
            <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-md bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_80px_rgba(0,0,0,0.65)] sm:rounded-lg">
              <iframe
                key={current.url}
                src={autoplayEmbedUrl}
                title={`${altPrefix} 영상 ${index + 1}`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : current.isVideo && current.isDirectVideo ? (
            <video
              key={current.url}
              src={current.url}
              controls
              autoPlay
              playsInline
              className="max-h-[min(100%,72dvh)] max-w-full rounded-md bg-black object-contain sm:rounded-lg"
            />
          ) : current.isVideo ? (
            <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-md bg-black sm:rounded-lg">
              <iframe
                key={current.url}
                src={current.url}
                title={`${altPrefix} 영상 ${index + 1}`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <img
              src={current.url}
              alt={`${altPrefix} ${index + 1}`}
              className="max-h-[min(100%,72dvh)] max-w-full select-none rounded-md object-contain shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_80px_rgba(0,0,0,0.65)] sm:rounded-lg"
              draggable={false}
            />
          )}

          {total > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-2 sm:h-10 sm:w-10 md:right-6"
              aria-label="다음"
            >
              ›
            </button>
          )}
        </div>

        {total > 1 && (
          <div className="relative flex justify-center gap-1.5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-4">
            {items.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => onChangeIndex(dotIndex)}
                className={cn(
                  "h-1.5 rounded-full transition",
                  dotIndex === index
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                )}
                aria-label={`${dotIndex + 1}번째`}
              />
            ))}
          </div>
        )}
      </div>
    </Portal>
  );
}

export default function PageMediaList({ items, altPrefix }: Props) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const mediaItems = useMemo(
    () => items.map(resolveMedia).filter((item) => item.url),
    [items]
  );

  if (!mediaItems.length) return null;

  const visibleCount = Math.min(mediaItems.length, MAX_VISIBLE);
  const remainingCount = mediaItems.length - visibleCount;
  const gridCols =
    visibleCount === 1
      ? "grid-cols-1"
      : visibleCount === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <>
      <ul
        className={cn(
          "grid gap-0.5 overflow-hidden rounded-xl bg-black/40 sm:rounded-2xl",
          gridCols
        )}
      >
        {mediaItems.slice(0, visibleCount).map((item, index) => {
          const showMoreOverlay =
            remainingCount > 0 && index === visibleCount - 1;
          const label = showMoreOverlay
            ? `더보기, ${remainingCount}개`
            : `${altPrefix} ${index + 1}`;

          return (
            <li key={`${item.url}-${index}`} className="relative min-w-0">
              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                className="group relative block h-full w-full"
                aria-label={label}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={`${altPrefix} ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                {item.isVideo && !showMoreOverlay && <PlayBadge />}
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                {showMoreOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/75 text-xl font-semibold text-white backdrop-blur-[6px] sm:text-2xl md:text-3xl">
                    +{remainingCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {previewIndex !== null && (
        <MediaPreview
          items={mediaItems}
          altPrefix={altPrefix}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onChangeIndex={setPreviewIndex}
        />
      )}
    </>
  );
}
