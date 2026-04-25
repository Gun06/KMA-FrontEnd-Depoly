import type { PublicEventTerm } from "../api/terms";
import type { EventTermsAgreeRequestItem } from "../types/common";

export const getEventTermsAgreementStorageKey = (eventId: string) =>
  `event_terms_agreement_${eventId}`;

export const buildEventTermsAgreeRequestList = (
  terms: PublicEventTerm[],
  checkedTermIds: Record<string, boolean>,
  getKey: (term: PublicEventTerm, idx: number) => string
): EventTermsAgreeRequestItem[] => {
  return terms.reduce<EventTermsAgreeRequestItem[]>((acc, term, idx) => {
    if (!(typeof term.id === "string" && term.id.trim().length > 0)) {
      return acc;
    }

      const key = getKey(term, idx);
      acc.push({
        id: String(term.id),
        agreed: checkedTermIds[key] === true,
      });
      return acc;
    }, []);
};

export const saveEventTermsAgreement = (
  eventId: string,
  payload: EventTermsAgreeRequestItem[]
) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    getEventTermsAgreementStorageKey(eventId),
    JSON.stringify(payload)
  );
};

export const loadEventTermsAgreement = (
  eventId: string
): EventTermsAgreeRequestItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(getEventTermsAgreementStorageKey(eventId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          item.id.trim().length > 0 &&
          typeof item.agreed === "boolean"
      )
      .map((item) => ({ id: item.id, agreed: item.agreed }));
  } catch {
    return [];
  }
};
