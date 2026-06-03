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
};

function getHeaderOffsetPx(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--kma-main-header-offset')
    .trim();
  const px = parseFloat(raw.replace(/px$/, ''));
  return Number.isFinite(px) ? px : 64;
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
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let latchedTop: number | null = null;
    let latchedBottom: number | null = null;
    let prevPanelH = 0;
    let raf = 0;

    const apply = () => {
      if (window.innerWidth < minWidth) {
        el.style.removeProperty('top');
        el.style.removeProperty('bottom');
        el.style.removeProperty('max-height');
        latchedTop = null;
        latchedBottom = null;
        return;
      }

      const footer = document.querySelector(footerSelector) as HTMLElement | null;
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top;
      const panelH = el.offsetHeight;
      if (Math.abs(panelH - prevPanelH) > 4) {
        latchedTop = null;
        latchedBottom = null;
        prevPanelH = panelH;
      }

      if (edge === 'top') {
        const minTop = getHeaderOffsetPx() + topExtraPx;
        const maxBottom = footerTop - gap;

        if (minTop + panelH <= maxBottom) {
          latchedTop = null;
          el.style.top = `${minTop}px`;
          el.style.removeProperty('max-height');
          return;
        }

        const clampedTop = Math.max(minTop, maxBottom - panelH);
        if (latchedTop === null || clampedTop > latchedTop) {
          latchedTop = clampedTop;
        }

        const top = Math.max(minTop, latchedTop);
        el.style.top = `${top}px`;

        const available = maxBottom - minTop;
        if (available > 0 && panelH > available) {
          el.style.maxHeight = `${available}px`;
          el.style.overflowY = 'auto';
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
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    if (footer) ro.observe(footer);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      el.style.removeProperty('top');
      el.style.removeProperty('bottom');
      el.style.removeProperty('max-height');
      el.style.removeProperty('overflow-y');
    };
  }, [ref, edge, footerSelector, gap, topExtraPx, minWidth]);
}
