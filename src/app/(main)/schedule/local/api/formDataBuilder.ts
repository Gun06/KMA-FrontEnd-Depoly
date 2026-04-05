import type { LocalEventUserCreateJson, LocalEventUserUpdateJson } from '../types/localEvent';

export function buildUserLocalEventCreateFormData(
  body: LocalEventUserCreateJson,
  promotionBanner?: File
): FormData {
  const fd = new FormData();
  fd.append('localEventCreateRequest', JSON.stringify(body));
  if (promotionBanner) {
    fd.append('promotionBanner', promotionBanner);
  }
  return fd;
}

export function buildUserLocalEventUpdateFormData(
  body: LocalEventUserUpdateJson,
  promotionBanner?: File
): FormData {
  const fd = new FormData();
  fd.append('localEventUpdateRequest', JSON.stringify(body));
  if (promotionBanner) {
    fd.append('promotionBanner', promotionBanner);
  }
  return fd;
}
