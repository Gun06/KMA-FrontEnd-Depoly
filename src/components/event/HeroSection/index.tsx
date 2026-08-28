'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePublicMainPageImages } from '@/hooks/usePublicEventData';

interface HeroSectionProps {
  eventId: string;
  className?: string;
  eventInfo?: {
    eventInfo: {
      nameKr: string;
      nameEng: string;
      startDate: string;
      region: string;
      mainBannerPcImageUrl: string;
      mainBannerMobileImageUrl: string;
      mainBannerColor: string;
    };
  } | null;
}

function normalizeHeroFromMainPageImages(data: {
  nameKr?: string;
  nameEng?: string;
  startDate?: string;
  region?: string;
  mainBannerPcImageUrl?: string;
  mainBannerMobileImageUrl?: string;
  mainBannerColor?: string;
}) {
  return {
    eventInfo: {
      nameKr: data.nameKr ?? '',
      nameEng: data.nameEng ?? '',
      startDate: data.startDate ?? '',
      region: data.region ?? '',
      mainBannerPcImageUrl: data.mainBannerPcImageUrl ?? '',
      mainBannerMobileImageUrl: data.mainBannerMobileImageUrl ?? '',
      mainBannerColor: data.mainBannerColor ?? '',
    },
  };
}

export default function HeroSection({
  eventId,
  className = '',
  eventInfo: propEventInfo,
}: HeroSectionProps) {
  const shouldFetchImages = !propEventInfo;
  const { data: mainPageImages, isError: isMainPageImagesError } =
    usePublicMainPageImages(eventId, { enabled: shouldFetchImages });

  const fetchedEventData = useMemo(
    () => (mainPageImages ? normalizeHeroFromMainPageImages(mainPageImages) : null),
    [mainPageImages]
  );

  const eventData = propEventInfo ?? fetchedEventData;
  const [error, setError] = useState<string | null>(null);
  const [titleEng, setTitleEng] = useState<string>('');
  const [titleKr, setTitleKr] = useState<string>('');

  const readCachedSideBanner = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`hero_side_banner_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < 60 * 60 * 1000) {
        return parsed.url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const [sideBannerImageUrl, setSideBannerImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetchImages) {
      setError(null);
      return;
    }
    if (isMainPageImagesError) {
      setError('이벤트 정보를 불러올 수 없습니다.');
      return;
    }
    setError(null);
  }, [shouldFetchImages, isMainPageImagesError]);

  useEffect(() => {
    const eng = eventData?.eventInfo?.nameEng ?? '';
    const kr = eventData?.eventInfo?.nameKr ?? '';
    setTitleEng(eng);
    setTitleKr(kr);
  }, [
    eventData?.eventInfo?.nameEng,
    eventData?.eventInfo?.nameKr,
  ]);

  useEffect(() => {
    const cached = readCachedSideBanner();
    if (cached) setSideBannerImageUrl(cached);
  }, [eventId]);

  useEffect(() => {
    const fetchSideBanner = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) return;

        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/event/${eventId}/side-banner`,
          { cache: 'no-store' }
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.sideBannerImgUrl) {
            setSideBannerImageUrl((prev) => {
              if (prev === data.sideBannerImgUrl) return prev;
              return data.sideBannerImgUrl;
            });
            try {
              localStorage.setItem(
                `hero_side_banner_${eventId}`,
                JSON.stringify({ url: data.sideBannerImgUrl, ts: Date.now() })
              );
            } catch {}
          }
        }
      } catch {
        // 사이드배너 실패 시 기본 이미지 유지
      }
    };

    if (eventId) {
      void fetchSideBanner();
    }
  }, [eventId]);

  const hasSideBanner = !!sideBannerImageUrl;

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative w-full">
        <div className="aspect-[5/1] w-full sm:aspect-[21/5] lg:aspect-[21/4]" />
        {sideBannerImageUrl && (
          <Image
            src={sideBannerImageUrl}
            alt=""
            aria-hidden={true}
            fill
            className="object-cover relative z-10"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        )}

        <div className="absolute inset-0 flex items-center z-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-white ${hasSideBanner ? 'opacity-0' : ''}`}>
              <h1 className="text-sm sm:text-lg md:text-lg lg:text-2xl xl:text-2xl font-vitro-core mb-1 sm:mb-2">
                {titleEng}
              </h1>
              <p className="text-xl sm:text-3xl md:text-3xl lg:text-5xl xl:text-5xl font-vitro-core">
                {titleKr}
              </p>
            </div>
          </div>
        </div>
      </div>
      {error ? <span className="sr-only">{error}</span> : null}
    </section>
  );
}
