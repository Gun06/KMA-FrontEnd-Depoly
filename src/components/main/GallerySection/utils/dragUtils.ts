/**
 * 드래그 관련 유틸리티 함수
 */

interface DragBoundsParams {
  cardCount: number;
  windowWidth: number;
  isMobile: boolean;
}

interface DragBounds {
  maxLeft: number;
  maxRight: number;
  cardWidth: number;
  cardGap: number;
}

/**
 * 드래그 범위 계산
 */
export function calculateDragBounds({
  cardCount,
  windowWidth,
  isMobile,
}: DragBoundsParams): DragBounds {
  const cardWidth = isMobile ? 250 : 350;
  const cardGap = isMobile ? 12 : 24;
  const moreButtonMargin = isMobile ? 24 : 48;
  const extraSpace = isMobile ? 80 : 150;

  const maxLeft = 0;
  const maxRight = -(
    cardCount * cardWidth +
    (cardCount - 1) * cardGap +
    moreButtonMargin +
    extraSpace -
    windowWidth
  );

  return {
    maxLeft,
    maxRight,
    cardWidth,
    cardGap,
  };
}

/**
 * 드래그 변환 값 계산
 */
export function calculateDragTransform(
  deltaX: number,
  dragStartTransform: number,
  bounds: DragBounds
): number {
  const newTransform = dragStartTransform + deltaX * 1.2; // 드래그 감도
  return Math.max(bounds.maxRight, Math.min(bounds.maxLeft, newTransform));
}
