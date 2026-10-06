'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  collectMainPageImageUrls,
  hasBannerImages,
  hasOutlineImages,
  normalizeMainPageImagesResponse,
  preloadImages,
  type MainPageImagesData,
} from '@/lib/event/mainPageImages';
import { getEventSponsorBanners } from '@/services/eventSponsor';
import type { EventSponsorResponse } from '@/types/eventSponsor';

const CACHE_TTL = 15 * 60 * 1000;
/** 캐시 등으로 API가 빨리 끝나도 로딩 UI 최소 노출 */
const MIN_LOADER_DISPLAY_MS = 2000;

function waitForMinimumLoaderDisplay(startedAt: number): Promise<void> {
  const remaining = MIN_LOADER_DISPLAY_MS - (Date.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise(resolve => {
    window.setTimeout(resolve, remaining);
  });
}
const HERO_CACHE_KEY = (eventId: string) => `hero_main_${eventId}`;
const SNS_CACHE_KEY = (eventId: string) => `sns_section_${eventId}`;

export type PromotionBannerData = {
  eventPromotionBannerUrl: string;
};

type LoadPhase = 'loading' | 'ready' | 'not_found' | 'error';

function readHeroCache(eventId: string): MainPageImagesData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HERO_CACHE_KEY(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL) return null;
    return normalizeMainPageImagesResponse(parsed?.data ?? null);
  } catch {
    return null;
  }
}

function readPromotionCache(eventId: string): PromotionBannerData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SNS_CACHE_KEY(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL) return null;
    const data = parsed?.data;
    if (!data || typeof data !== 'object') return null;
    const url =
      (data as Record<string, unknown>).eventPromotionBannerUrl ??
      (data as Record<string, unknown>).event_promotion_banner_url;
    return {
      eventPromotionBannerUrl: typeof url === 'string' ? url : '',
    };
  } catch {
    return null;
  }
}

function collectSponsorImageUrls(data: EventSponsorResponse | null | undefined): string[] {
  if (!data) return [];
  const banners = [...(data.staticBanner ?? []), ...(data.nonStaticBanner ?? [])];
  return banners.map(b => b.imgUrl?.trim()).filter((url): url is string => Boolean(url));
}

async function loadSponsorAssets(
  eventId: string,
  queryClient: ReturnType<typeof useQueryClient>
): Promise<string[]> {
  const serviceTypes = ['DESKTOP', 'MOBILE'] as const;
  const results = await Promise.allSettled(
    serviceTypes.map(serviceType => getEventSponsorBanners({ eventId, serviceType }))
  );

  const imageUrls: string[] = [];
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return;
    const serviceType = serviceTypes[index];
    queryClient.setQueryData(
      ['eventSponsorBanners', eventId, serviceType],
      result.value
    );
    imageUrls.push(...collectSponsorImageUrls(result.value));
  });
  return imageUrls;
}

function normalizePromotion(raw: unknown): PromotionBannerData | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const url = record.eventPromotionBannerUrl ?? record.event_promotion_banner_url;
  return {
    eventPromotionBannerUrl: typeof url === 'string' ? url : '',
  };
}

export function useEventMainPageAssets(eventId: string) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [mainPage, setMainPage] = useState<MainPageImagesData | null>(null);
  const [promotion, setPromotion] = useState<PromotionBannerData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const startedAt = Date.now();
      setPhase('loading');
      setErrorMessage(null);

      const finishReady = async (
        nextMain: MainPageImagesData | null,
        nextPromo: PromotionBannerData | null
      ) => {
        await waitForMinimumLoaderDisplay(startedAt);
        if (cancelled) return;
        setMainPage(nextMain);
        setPromotion(nextPromo);
        setPhase('ready');
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      if (!API_BASE_URL) {
        if (!cancelled) {
          setPhase('error');
          setErrorMessage('API 서버 설정이 필요합니다.');
        }
        return;
      }

      let mainData = readHeroCache(eventId);
      let promoData = readPromotionCache(eventId);

      const needsMain =
        !mainData || !hasBannerImages(mainData) || !hasOutlineImages(mainData);
      const needsPromo = !promoData;

      try {
        const [mainRes, promoRes] = await Promise.all([
          needsMain
            ? fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`)
            : Promise.resolve(null),
          needsPromo
            ? fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/promotion-banner`)
            : Promise.resolve(null),
        ]);

        if (mainRes) {
          if (mainRes.status === 404) {
            if (!cancelled) setPhase('not_found');
            return;
          }
          if (!mainRes.ok) {
            if (!cancelled) setPhase('not_found');
            return;
          }
          const json = await mainRes.json();
          mainData = normalizeMainPageImagesResponse(json);
          if (mainData) {
            try {
              localStorage.setItem(
                HERO_CACHE_KEY(eventId),
                JSON.stringify({ data: mainData, ts: Date.now() })
              );
            } catch {
              /* noop */
            }
          }
        }

        if (promoRes) {
          if (promoRes.ok) {
            const json = await promoRes.json();
            promoData = normalizePromotion(json);
            if (promoData) {
              try {
                localStorage.setItem(
                  SNS_CACHE_KEY(eventId),
                  JSON.stringify({ data: promoData, ts: Date.now() })
                );
              } catch {
                /* noop */
              }
            }
          }
        }

        const sponsorImageUrls = await loadSponsorAssets(eventId, queryClient);
        const imageUrls = [
          ...collectMainPageImageUrls(mainData, promoData?.eventPromotionBannerUrl),
          ...sponsorImageUrls,
        ];
        await preloadImages(imageUrls);

        await finishReady(mainData, promoData);
      } catch {
        if (cancelled) return;
        if (mainData || promoData) {
          const sponsorImageUrls = await loadSponsorAssets(eventId, queryClient).catch(
            () => [] as string[]
          );
          const imageUrls = [
            ...collectMainPageImageUrls(mainData, promoData?.eventPromotionBannerUrl),
            ...sponsorImageUrls,
          ];
          await preloadImages(imageUrls);
          await finishReady(mainData, promoData);
          return;
        }
        setPhase('error');
        setErrorMessage('대회 정보를 불러올 수 없습니다.');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [eventId, queryClient]);

  return useMemo(
    () => ({
      isReady: phase === 'ready',
      isLoading: phase === 'loading',
      showNotFound: phase === 'not_found',
      errorMessage: phase === 'error' ? errorMessage : null,
      mainPage,
      promotion,
    }),
    [phase, errorMessage, mainPage, promotion]
  );
}
