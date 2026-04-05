'use client';

type Props = {
  goList: () => void;
  title?: string;
};

/** 유저 지역대회 상세 — 뒤로가기 + 제목 (로딩/에러/빈 상태·일반 상세와 동일 상단) */
export default function LocalEventUserDetailChrome({
  goList,
  title = '지역대회 상세',
}: Props) {
  return (
    <div className="mb-4">
      <div className="py-2 md:py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={goList}
            className="flex min-w-0 items-center text-left text-gray-600 transition-colors hover:text-gray-800 font-pretendard max-[380px]:text-sm"
          >
            <svg
              className="mr-1.5 shrink-0 h-4 w-4 max-[380px]:h-3.5 max-[380px]:w-3.5 sm:mr-2 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="max-[380px]:hidden">지역대회 목록으로 돌아가기</span>
            <span className="hidden max-[380px]:inline">돌아가기</span>
          </button>
        </div>
      </div>
      <div className="mb-3">
        <h1 className="mb-1 font-pretendard font-semibold text-gray-900 text-lg max-[380px]:text-base sm:text-xl md:text-2xl">
          {title}
        </h1>
      </div>
    </div>
  );
}
