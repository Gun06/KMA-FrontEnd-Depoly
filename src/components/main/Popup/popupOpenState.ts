/** 메인/대회 팝업 노출 여부 — 플로팅 UI(방문자 등)와 공유 */

const ATTR = 'data-kma-popup-open';
export const KMA_POPUP_OPEN_EVENT = 'kma-popup-open-change';

export function setKmaPopupOpen(open: boolean) {
  if (typeof document === 'undefined') return;
  if (open) {
    document.documentElement.setAttribute(ATTR, 'true');
  } else {
    document.documentElement.removeAttribute(ATTR);
  }
  window.dispatchEvent(new CustomEvent(KMA_POPUP_OPEN_EVENT, { detail: { open } }));
}

export function isKmaPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.hasAttribute(ATTR);
}
