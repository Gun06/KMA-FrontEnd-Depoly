const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

export type PublicEventTerm = {
  id?: string;
  content: string;
  sortOrder: number;
  required: boolean;
  termsLabel: string;
};

export type PublicEventTermsResult = {
  allAgreeLabel: string;
  eventTerms: PublicEventTerm[];
};

function normalizeTermList(raw: unknown): PublicEventTerm[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): PublicEventTerm | null => {
      if (!item || typeof item !== 'object') return null;
      const t = item as Record<string, unknown>;
      const content = String(t.content ?? '')
        .replace(/\u000B/g, '\n')
        .trim();
      const termsLabel = String(t.termsLabel ?? '').trim();
      if (!content && !termsLabel) return null;
      const sortOrder =
        typeof t.sortOrder === 'number' && !Number.isNaN(t.sortOrder)
          ? t.sortOrder
          : 0;
      return {
        id: t.id != null ? String(t.id) : undefined,
        content,
        sortOrder,
        required: t.required === true,
        termsLabel,
      };
    })
    .filter((x): x is PublicEventTerm => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeTermsPayload(data: unknown): PublicEventTermsResult {
  if (Array.isArray(data)) {
    return {
      allAgreeLabel: '',
      eventTerms: normalizeTermList(data),
    };
  }
  if (!data || typeof data !== 'object') {
    return { allAgreeLabel: '', eventTerms: [] };
  }
  const o = data as Record<string, unknown>;
  const raw = o.eventTerms ?? o.termsInfo ?? o.eventTerm ?? o.terms ?? o.data;
  return {
    allAgreeLabel: String(o.allAgreeLabel ?? '').trim(),
    eventTerms: normalizeTermList(raw),
  };
}

/**
 * GET /api/v1/public/event/{eventId}/terms
 */
export async function fetchPublicEventTerms(
  eventId: string
): Promise<PublicEventTermsResult> {
  if (!API_BASE_URL) return { allAgreeLabel: '', eventTerms: [] };

  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/terms`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) return { allAgreeLabel: '', eventTerms: [] };

  const data = await response.json();
  return normalizeTermsPayload(data);
}
