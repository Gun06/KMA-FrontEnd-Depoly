const USER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export type PublicMainPageImagesResponse = {
  id?: string;
  nameKr?: string;
  nameEng?: string;
  startDate?: string;
  region?: string;
  mainBannerColor?: string;
  mainBannerPcImageUrl?: string;
  mainBannerMobileImageUrl?: string;
  mainOutlinePcImageUrl?: string;
  mainOutlineMobileImageUrl?: string;
  youtubeUrl?: string;
};

function getStringField(data: unknown, camel: string, snake: string): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  const value = record[camel] ?? record[snake];
  return typeof value === "string" ? value : "";
}

/**
 * GET /api/v1/public/event/{eventId}/mainpage-images
 */
export async function fetchPublicMainPageImages(
  eventId: string
): Promise<PublicMainPageImagesResponse | null> {
  if (!USER_API_BASE_URL) return null;
  const response = await fetch(
    `${USER_API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );
  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;
  return {
    id: getStringField(data, "id", "id"),
    nameKr: getStringField(data, "nameKr", "name_kr"),
    nameEng: getStringField(data, "nameEng", "name_eng"),
    startDate: getStringField(data, "startDate", "start_date"),
    region: getStringField(data, "region", "region"),
    mainBannerColor: getStringField(data, "mainBannerColor", "main_banner_color"),
    mainBannerPcImageUrl: getStringField(
      data,
      "mainBannerPcImageUrl",
      "main_banner_pc_image_url"
    ),
    mainBannerMobileImageUrl: getStringField(
      data,
      "mainBannerMobileImageUrl",
      "main_banner_mobile_image_url"
    ),
    mainOutlinePcImageUrl: getStringField(
      data,
      "mainOutlinePcImageUrl",
      "main_outline_pc_image_url"
    ),
    mainOutlineMobileImageUrl: getStringField(
      data,
      "mainOutlineMobileImageUrl",
      "main_outline_mobile_image_url"
    ),
    youtubeUrl: getStringField(data, "youtubeUrl", "youtube_url"),
  };
}

/**
 * GET /api/v1/public/event/{eventId}/special-event-image
 */
export async function fetchSpecialEventImageUrl(
  eventId: string
): Promise<string | null> {
  if (!USER_API_BASE_URL) return null;
  const response = await fetch(
    `${USER_API_BASE_URL}/api/v1/public/event/${eventId}/special-event-image`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );
  if (!response.ok) return null;
  const data = (await response.json()) as unknown;

  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const candidate =
    record.specialEventImageUrl ?? record.imageUrl ?? record.url ?? record.data;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
}

/**
 * GET /api/v1/public/event/{eventId}/award-info-image
 */
export async function fetchAwardInfoImageUrl(
  eventId: string
): Promise<string | null> {
  if (!USER_API_BASE_URL) return null;
  const response = await fetch(
    `${USER_API_BASE_URL}/api/v1/public/event/${eventId}/award-info-image`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );
  if (!response.ok) return null;
  const data = (await response.json()) as unknown;

  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const candidate =
    record.awardInfoImageUrl ?? record.imageUrl ?? record.url ?? record.data;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
}
