'use client';

import { useEffect, type RefObject } from 'react';

type ClampEdge = 'top' | 'bottom';

type Options = {
  edge?: ClampEdge;
  footerSelector?: string;
  gap?: number;
  /** FloatingPanels: 0.35rem ≈ 6px */
  topExtraPx?: number;
  /** lg breakpoint — matches Tailwind lg */
  minWidth?: number;
  /** clamp 대상이 아닌 실제 콘텐츠 높이 (maxHeight 피드백 루프 방지) */
  measureRef?: RefObject<HTMLElement | null>;
  /** 클램프 해제 시 여유(px) — 경계에서 깜빡임 방지 */
  releaseHysteresisPx?: number;
};

function getHeaderOffsetPx(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--kma-main-header-offset')
    .trim();
  const px = parseFloat(raw.replace(/px$/, ''));
  return Number.isFinite(px) ? px : 64;
}

function clearClampStyles(el: HTMLElement) {
  el.style.removeProperty('top');
  el.style.removeProperty('bottom');
  el.style.removeProperty('max-height');
  el.style.removeProperty('overflow-y');
}

/**
 * fixed 플로팅 요소가 푸터 위에서 멈추도록 top/bottom을 조정합니다.
 * 푸터에 닿은 뒤에는 더 위로 올라가지 않도록 latch 합니다.
 */
export function useFloatingFooterClamp(
  ref: RefObject<HTMLElement | null>,
  options: Options = {}
) {
  const {
    edge = 'top',
    footerSelector = '[data-kma-footer-zone]',
    gap = 16,
    topExtraPx = 6,
    minWidth = 1024,
    measureRef,
    releaseHysteresisPx = 24,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let latchedTop: number | null = null;
    let latchedBottom: number | null = null;
    let prevPanelH = 0;
    let raf = 0;
    let lastTop: number | null = null;

    const getPanelHeight = () => {
      const measureEl = measureRef?.current ?? el;
      return measureEl.offsetHeight;
    };

    const apply = () => {
      if (window.innerWidth < minWidth) {
        clearClampStyles(el);
        latchedTop = null;
        latchedBottom = null;
        lastTop = null;
        return;
      }

      const footer = document.querySelector(footerSelector) as HTMLElement | null;
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top;
      const panelH = getPanelHeight();

      if (Math.abs(panelH - prevPanelH) > 4) {
        latchedTop = null;
        latchedBottom = null;
        prevPanelH = panelH;
      }

      if (edge === 'top') {
        const minTop = getHeaderOffsetPx() + topExtraPx;
        const maxBottom = footerTop - gap;
        const overflow = minTop + panelH - maxBottom;
        const hasRoom =
          overflow <= 0 ||
          (latchedTop !== null && overflow < releaseHysteresisPx);

        if (hasRoom) {
          latchedTop = null;
          if (lastTop !== minTop) {
            el.style.top = `${minTop}px`;
            lastTop = minTop;
          }
          el.style.removeProperty('max-height');
          el.style.removeProperty('overflow-y');
          return;
        }

        const clampedTop = Math.max(minTop, maxBottom - panelH);
        if (latchedTop === null || clampedTop > latchedTop) {
          latchedTop = clampedTop;
        }

        const top = Math.max(minTop, latchedTop);
        if (lastTop !== top) {
          el.style.top = `${top}px`;
          lastTop = top;
        }

        const available = maxBottom - minTop;
        if (available > 0 && panelH > available) {
          const maxHeight = `${available}px`;
          if (el.style.maxHeight !== maxHeight) {
            el.style.maxHeight = maxHeight;
            el.style.overflowY = 'auto';
          }
        } else {
          el.style.removeProperty('max-height');
          el.style.removeProperty('overflow-y');
        }
        return;
      }

      const defaultBottom = parseFloat(getComputedStyle(el).bottom) || 32;
      const panelTop = window.innerHeight - defaultBottom - panelH;
      const limitTop = footerTop - gap;

      if (panelTop + panelH <= limitTop) {
        latchedBottom = null;
        el.style.removeProperty('bottom');
        el.style.removeProperty('max-height');
        el.style.removeProperty('overflow-y');
        return;
      }

      const clampedBottom = Math.max(gap, window.innerHeight - limitTop - panelH);
      if (latchedBottom === null || clampedBottom > latchedBottom) {
        latchedBottom = clampedBottom;
      }

      el.style.bottom = `${latchedBottom}px`;
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    schedule();

    const footer = document.querySelector(footerSelector);
    const measureEl = measureRef?.current ?? el;

    const ro = new ResizeObserver(schedule);
    ro.observe(measureEl);
    if (footer) ro.observe(footer);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      clearClampStyles(el);
    };
  }, [ref, measureRef, edge, footerSelector, gap, topExtraPx, minWidth, releaseHysteresisPx]);
}
