const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export type PublicEventTerm = {
  id?: string;
  title: string;
  content: string;
  sortOrder: number;
};

function normalizeTermsPayload(data: unknown): PublicEventTerm[] {
  if (Array.isArray(data)) {
    return normalizeTermsPayload({ terms: data });
  }
  if (!data || typeof data !== 'object') return [];
  const o = data as Record<string, unknown>;
  const raw =
    o.termsInfo ?? o.eventTerms ?? o.eventTerm ?? o.terms ?? o.data;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): PublicEventTerm | null => {
      if (!item || typeof item !== 'object') return null;
      const t = item as Record<string, unknown>;
      const title = String(t.title ?? '').trim();
      const content = String(t.content ?? '').trim();
      if (!title && !content) return null;
      const sortOrder =
        typeof t.sortOrder === 'number' && !Number.isNaN(t.sortOrder)
          ? t.sortOrder
          : 0;
      return {
        id: t.id != null ? String(t.id) : undefined,
        title,
        content,
        sortOrder,
      };
    })
    .filter((x): x is PublicEventTerm => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * GET /api/v1/public/event/{eventId}/terms
 */
export async function fetchPublicEventTerms(
  eventId: string
): Promise<PublicEventTerm[]> {
  if (!API_BASE_URL) return [];

  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/terms`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) return [];

  const data = await response.json();
  return normalizeTermsPayload(data);
}
