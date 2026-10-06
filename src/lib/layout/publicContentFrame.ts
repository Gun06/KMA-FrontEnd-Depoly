/** 대회·메인 게시판 목록(공지·문의) 공통 셸 */
export const PUBLIC_BOARD_LIST_OUTER_CLASS =
  'w-full py-8 md:py-10 lg:py-12 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20';

export const PUBLIC_BOARD_LIST_INNER_CLASS = 'mx-auto w-full max-w-6xl';

/** 메인 FAQ 목록 — 읽기 폭 */
export const PUBLIC_FAQ_LIST_INNER_CLASS = 'mx-auto w-full max-w-4xl';

/** 대회 서브메뉴 FAQ·제목 정렬용 가로 여백 */
export const EVENT_SUBMENU_GUTTER_CLASS = 'px-4 sm:px-8 md:px-12 lg:px-16';

/** 대회 FAQ — max-width 없이 가로 패딩만 (제목·카드 전폭) */
export const EVENT_FAQ_PAGE_SHELL_CLASS = `w-full py-8 md:py-10 lg:py-12 ${EVENT_SUBMENU_GUTTER_CLASS}`;

/** 아코디언·네비 터치 최소 높이 (WCAG 2.5.5 권장 44px) */
export const PUBLIC_TAP_TARGET_MIN_CLASS = 'min-h-[44px]';
