/** 헤더 pill·드롭다운·서브 페이지 브레드크럼 공통 (14px → sm 16px) */
export const MAIN_HEADER_MENU_TEXT_CLASS = 'text-sm font-semibold sm:text-base';

/** 메인 헤더 · 플로팅 패널 · 섹션 본문 공통 가로 리듬 */
export const MAIN_MAX_WIDTH_CLASS = 'max-w-[1920px]';
export const MAIN_GUTTER_CLASS = 'px-[6vw]';

/** 1920 컨테이너 + 6vw 좌우 여백 (헤더·플로팅·본문 동일 기준) */
export const MAIN_CONTENT_SHELL_CLASS = `mx-auto w-full ${MAIN_MAX_WIDTH_CLASS} ${MAIN_GUTTER_CLASS}`;

/** 메인 홈 embedded 섹션 — KMA-Mobile: 16px → md 24px → lg 6vw */
export const MAIN_EMBEDDED_SHELL_CLASS = `mx-auto w-full ${MAIN_MAX_WIDTH_CLASS} px-4 md:px-6 lg:px-[6vw]`;

export const MAIN_EMBEDDED_HSCROLL_INSET_CLASS =
  'pl-4 md:pl-6 lg:pl-[6vw] pr-4 md:pr-6 lg:pr-[6vw]';

export const MAIN_HOME_SECTION_TITLE_CLASS =
  'font-giants text-[22px] text-gray-900 md:text-[28px]';

export const MAIN_HOME_SECTION_MORE_LINK_CLASS =
  'shrink-0 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700';

export const MAIN_EMBEDDED_SECTION_Y_CLASS = 'py-6 sm:py-8 md:py-10';

export const MAIN_HOME_HSCROLL_TRACK_CLASS =
  'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** 데스크탑 헤더·우측 플로팅 노출 기준 (tailwind `custom`: 1300px) */
export const MAIN_DESKTOP_UI_CLASS = 'hidden custom:block';

/** 헤더·드롭다운(알림 등) — 우측 플로팅(z-151)보다 위 */
export const MAIN_HEADER_Z_CLASS = 'z-[160]';

/** 우측 플로팅(대회안내·스폰서·방문자) 공통 — fixed + 푸터 위 표시 */
export const MAIN_FLOATING_Z_CLASS = 'z-[151]';
export const MAIN_FLOATING_RIGHT_CLASS =
  'right-4 sm:right-5 md:right-6 custom:right-[6vw]';
export const MAIN_FLOATING_ROOT_CLASS = `fixed ${MAIN_FLOATING_Z_CLASS} ${MAIN_FLOATING_RIGHT_CLASS}`;
export const MAIN_FLOATING_DESKTOP_CLASS = 'hidden custom:flex';
