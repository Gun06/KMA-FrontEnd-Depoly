import type { EventTopSectionInfo } from '@/types/event';

export type MainPageImagesData = EventTopSectionInfo & {
  mainOutlinePcImageUrl: string;
  mainOutlineMobileImageUrl: string;
};

export function normalizeMainPageImagesResponse(
  raw: Record<string, unknown> | null
): MainPageImagesData | null {
  if (!raw || typeof raw !== 'object') return null;
  const get = (camel: string, snake: string): string => {
    const v = (raw[camel] ?? raw[snake]) as string | undefined;
    return typeof v === 'string' ? v : '';
  };
  const id = get('id', 'id');
  const nameKr = get('nameKr', 'name_kr');
  const nameEng = get('nameEng', 'name_eng');
  const startDate = get('startDate', 'start_date');
  const region = get('region', 'region');
  const mainBannerColor = get('mainBannerColor', 'main_banner_color');
  const mainBannerPcImageUrl = get('mainBannerPcImageUrl', 'main_banner_pc_image_url');
  const mainBannerMobileImageUrl = get('mainBannerMobileImageUrl', 'main_banner_mobile_image_url');
  const mainOutlinePcImageUrl = get('mainOutlinePcImageUrl', 'main_outline_pc_image_url');
  const mainOutlineMobileImageUrl = get('mainOutlineMobileImageUrl', 'main_outline_mobile_image_url');
  const youtubeUrl = get('youtubeUrl', 'youtube_url');
  const resolvedId = typeof id === 'string' && id ? id : String(raw?.id ?? '');
  return {
    id: resolvedId,
    nameKr,
    nameEng,
    startDate,
    region,
    mainBannerColor,
    mainBannerPcImageUrl,
    mainBannerMobileImageUrl,
    youtubeUrl,
    mainOutlinePcImageUrl,
    mainOutlineMobileImageUrl,
  };
}

export function hasBannerImages(info: MainPageImagesData | EventTopSectionInfo | null): boolean {
  if (!info) return false;
  const pc = (info.mainBannerPcImageUrl ?? '').trim();
  const mobile = (info.mainBannerMobileImageUrl ?? '').trim();
  return pc.length > 0 || mobile.length > 0;
}

export function hasOutlineImages(info: MainPageImagesData | null): boolean {
  if (!info) return false;
  const pc = (info.mainOutlinePcImageUrl ?? '').trim();
  const mobile = (info.mainOutlineMobileImageUrl ?? '').trim();
  return pc.length > 0 || mobile.length > 0;
}

export function collectMainPageImageUrls(
  main: MainPageImagesData | null,
  promotionBannerUrl?: string | null
): string[] {
  const urls = new Set<string>();
  const add = (url?: string | null) => {
    const trimmed = url?.trim();
    if (trimmed) urls.add(trimmed);
  };
  if (main) {
    add(main.mainBannerPcImageUrl);
    add(main.mainBannerMobileImageUrl);
    add(main.mainOutlinePcImageUrl);
    add(main.mainOutlineMobileImageUrl);
  }
  add(promotionBannerUrl);
  return [...urls];
}

export function preloadImages(urls: string[], timeoutMs = 15000): Promise<void> {
  const unique = [...new Set(urls.map(u => u.trim()).filter(Boolean))];
  if (unique.length === 0) return Promise.resolve();

  const loadOne = (url: string) =>
    new Promise<void>(resolve => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });

  const allLoaded = Promise.all(unique.map(loadOne)).then(() => undefined);
  const timeout = new Promise<void>(resolve => {
    window.setTimeout(resolve, timeoutMs);
  });
  return Promise.race([allLoaded, timeout]);
}
