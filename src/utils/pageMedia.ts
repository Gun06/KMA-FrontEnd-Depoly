import type { PageMediaItem } from '@/types/pageMedia';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function extractMediaUrl(item: unknown): string {
  if (typeof item === 'string') return item.trim();

  const record = asRecord(item);
  if (!record) return '';

  const candidates = [
    record.imageUrl,
    record.image_url,
    record.url,
    record.videoUrl,
    record.video_url,
    record.link,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  const record = asRecord(data);
  if (!record) return [];

  for (const key of ['data', 'content', 'items', 'images', 'result']) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

export function parsePageMediaResponse(
  data: unknown,
  fallbackUrlKeys: string[] = []
): PageMediaItem[] {
  const items = extractList(data)
    .map((item, index): PageMediaItem | null => {
      const imageUrl = extractMediaUrl(item);
      if (!imageUrl) return null;

      const record = asRecord(item);
      const orderNumberRaw = record?.orderNumber ?? record?.order_number;
      const orderNumber =
        typeof orderNumberRaw === 'number' && Number.isFinite(orderNumberRaw)
          ? orderNumberRaw
          : index;
      const mediaTypeRaw = record?.mediaType ?? record?.media_type;
      const mediaType = typeof mediaTypeRaw === 'string' ? mediaTypeRaw : undefined;

      return {
        imageUrl,
        orderNumber,
        ...(mediaType ? { mediaType } : {}),
      };
    })
    .filter((item): item is PageMediaItem => item !== null)
    .sort((a, b) => a.orderNumber - b.orderNumber);

  if (items.length > 0) return items;

  const record = asRecord(data);
  if (!record) return [];

  for (const key of fallbackUrlKeys) {
    const url = record[key];
    if (typeof url === 'string' && url.trim()) {
      return [{ imageUrl: url.trim(), orderNumber: 0 }];
    }
  }

  return [];
}

export function pickPageMediaList(
  source: unknown,
  keys: string[]
): PageMediaItem[] {
  const record = asRecord(source);
  if (!record) return [];

  const pools: Record<string, unknown>[] = [record];
  const eventInfo = asRecord(record.eventInfo);
  if (eventInfo) pools.push(eventInfo);

  for (const pool of pools) {
    for (const key of keys) {
      const value = pool[key];
      if (!Array.isArray(value) || value.length === 0) continue;
      const parsed = parsePageMediaResponse(value);
      if (parsed.length > 0) return parsed;
    }
  }

  return [];
}
