/** approach 응답에서 마감임박 배너 URL·대회 ID 추출 */
export function parseApproachPreview(json: unknown): {
  eventId: string;
  url: string;
} | null {
  const pickFrom = (raw: unknown): { eventId: string; url: string } | null => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const r = raw as Record<string, unknown>;
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = r[k];
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
      return '';
    };
    const url = pick(
      'url',
      'imageUrl',
      'bannerUrl',
      'image_url',
      'banner_url'
    );
    if (!url) return null;
    const eventId = pick('eventId', 'event_id');
    return { eventId, url };
  };

  if (json == null) return null;

  if (Array.isArray(json)) {
    for (const el of json) {
      const n = pickFrom(el);
      if (n) return n;
    }
    return null;
  }

  if (typeof json === 'object') {
    const direct = pickFrom(json);
    if (direct) return direct;

    const o = json as Record<string, unknown>;
    const inner = o.content ?? o.data ?? o.items ?? o.result ?? o.body;
    if (Array.isArray(inner)) {
      for (const el of inner) {
        const n = pickFrom(el);
        if (n) return n;
      }
    } else {
      const single = pickFrom(inner);
      if (single) return single;
    }
  }

  return null;
}

/** 대회 상세에서 마감임박 배너 후보 URL (approach와 유사 우선순위) */
export function pickClosingBannerFromEventInfo(info: {
  eventAdvertiseBannerUrl?: string | null;
  promotionBanner?: string | null;
  mainBannerPcImageUrl?: string | null;
}): string | null {
  const candidates = [
    info.eventAdvertiseBannerUrl,
    info.promotionBanner,
    info.mainBannerPcImageUrl,
  ];
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return null;
}
