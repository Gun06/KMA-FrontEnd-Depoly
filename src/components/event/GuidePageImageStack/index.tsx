'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/utils/cn';

const IMAGE_MAX_W_CLASS = 'w-full max-w-[800px]';

export function GuidePageImageSkeleton({ blocks = 1 }: { blocks?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="이미지 로딩 중">
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={`guide-img-sk-${i}`} className="flex justify-center">
          <div
            className={cn(
              IMAGE_MAX_W_CLASS,
              'aspect-[4/3] min-h-[220px] animate-pulse rounded-lg bg-gray-200 sm:min-h-[300px] md:min-h-[380px]'
            )}
          />
        </div>
      ))}
    </div>
  );
}

export function GuidePageRevealImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative flex justify-center', IMAGE_MAX_W_CLASS)}>
      {!loaded ? (
        <div
          className={cn(
            IMAGE_MAX_W_CLASS,
            'aspect-[4/3] min-h-[220px] animate-pulse rounded-lg bg-gray-200 sm:min-h-[300px] md:min-h-[380px]'
          )}
          aria-hidden
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        priority={priority}
        className={cn(
          'max-w-full h-auto transition-opacity duration-150',
          loaded ? 'opacity-100' : 'absolute inset-x-0 top-0 opacity-0'
        )}
        style={{ touchAction: 'auto' }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export type GuidePageImageItem = {
  imageUrl: string;
  orderNumber?: number;
};

export function GuidePageImageStack({
  images,
  altPrefix,
  isLoading,
}: {
  images: GuidePageImageItem[];
  altPrefix: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <GuidePageImageSkeleton blocks={1} />;
  }
  if (images.length === 0) return null;

  return (
    <div>
      {images.map((image, index) => (
        <div
          key={`${image.orderNumber ?? index}-${index}`}
          className="mb-4 flex justify-center last:mb-0"
        >
          <GuidePageRevealImage
            src={image.imageUrl}
            alt={`${altPrefix} ${index + 1}`}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function GuidePageSingleImage({
  src,
  alt,
  isLoading,
}: {
  src: string | null;
  alt: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <GuidePageImageSkeleton blocks={1} />;
  }
  if (!src) return null;

  return (
    <div className="flex justify-center">
      <GuidePageRevealImage src={src} alt={alt} priority />
    </div>
  );
}
