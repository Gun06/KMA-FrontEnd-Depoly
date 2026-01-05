export default function InquirySkeleton() {
  return (
    <div className="w-full">
      {/* Desktop / Tablet 스켈레톤 */}
      <div className="hidden md:block">
        {/* 테이블 헤더 */}
        <div className="bg-[#3B3F45] text-white text-center">
          <div className="grid grid-cols-[80px_1fr_110px_120px_100px] gap-4 px-4 py-3">
            <div className="h-5 bg-gray-400 rounded animate-pulse" />
            <div className="h-5 bg-gray-400 rounded animate-pulse" />
            <div className="h-5 bg-gray-400 rounded animate-pulse" />
            <div className="h-5 bg-gray-400 rounded animate-pulse" />
            <div className="h-5 bg-gray-400 rounded animate-pulse" />
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="divide-y divide-[#F1F3F5]">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`skeleton-row-${index}`}
              className="grid grid-cols-[80px_1fr_110px_120px_100px] gap-4 px-4 py-4 hover:bg-[#F8FAFF]"
            >
              {/* 번호 */}
              <div className="flex items-center justify-center">
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* 제목 */}
              <div className="flex items-center gap-2 min-w-0">
                {/* 카테고리 배지 스켈레톤 */}
                <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse shrink-0" />
                {/* 제목 텍스트 스켈레톤 */}
                <div className="flex-1 min-w-0">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* 작성자 */}
              <div className="flex items-center justify-center">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* 작성일 */}
              <div className="flex items-center justify-center">
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* 조회수 */}
              <div className="flex items-center justify-center">
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile 스켈레톤 */}
      <ul className="md:hidden divide-y divide-[#F1F3F5]">
        {Array.from({ length: 10 }).map((_, index) => (
          <li key={`skeleton-mobile-${index}`} className="px-2 py-3 sm:px-4 bg-white">
            <div className="grid grid-cols-[40px_1fr] gap-3 items-start">
              {/* 카테고리 배지 */}
              <div className="h-6 flex items-center justify-center">
                <div className="h-5 w-10 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* 내용 */}
              <div className="min-w-0 flex-1">
                {/* 제목 스켈레톤 */}
                <div className="mb-1.5">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                {/* 메타 정보 스켈레톤 */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  <span className="opacity-30">·</span>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <span className="opacity-30">·</span>
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                  <span className="opacity-30">·</span>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 바 스켈레톤 */}
      <div className="bg-white px-1 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* 페이지네이션 스켈레톤 */}
      <div className="flex justify-center py-2 bg-white px-1 sm:py-6 sm:px-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`skeleton-page-${index}`}
              className="h-8 w-8 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

