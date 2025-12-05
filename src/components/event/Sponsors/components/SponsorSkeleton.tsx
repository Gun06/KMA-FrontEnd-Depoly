export default function SponsorSkeleton() {
  return (
    <section aria-label="organizer" className="bg-white">
      <div className="mx-auto max-w-[1920px] px-0 md:px-4 py-6 md:py-8">
        {/* 데스크톱 버전 스켈레톤 */}
        <div className="hidden md:flex items-center">
          {/* 왼쪽 고정 스폰서 영역 스켈레톤 */}
          <div className="flex items-center gap-4 md:gap-6 px-4 md:px-8 shrink-0 z-10 bg-white">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={`fixed-skeleton-${idx}`} className="shrink-0">
                <div className="relative h-24 w-[240px] rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm animate-pulse" />
              </div>
            ))}
            {/* 구분선 */}
            <div className="w-px h-16 bg-gray-200 mx-2 shrink-0" />
          </div>

          {/* 오른쪽 순환 스폰서 영역 스켈레톤 */}
          <div className="flex-1 relative overflow-hidden">
            <div className="flex w-max items-center gap-4 md:gap-8 px-3 md:px-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`rotating-skeleton-${idx}`} className="shrink-0">
                  <div className="relative h-24 w-[240px] rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 모바일 버전 스켈레톤 */}
        <div className="flex md:hidden items-center">
          {/* 왼쪽 고정 스폰서 영역 스켈레톤 */}
          <div className="flex items-center gap-4 px-4 shrink-0 z-10 bg-white">
            {Array.from({ length: 1 }).map((_, idx) => (
              <div key={`mobile-fixed-skeleton-${idx}`} className="shrink-0">
                <div className="relative h-16 w-[160px] rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm animate-pulse" />
              </div>
            ))}
            {/* 구분선 */}
            <div className="w-px h-12 bg-gray-200 mx-2 shrink-0" />
          </div>

          {/* 오른쪽 순환 스폰서 영역 스켈레톤 */}
          <div className="flex-1 relative overflow-hidden">
            <div className="flex w-max items-center gap-4 px-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`mobile-rotating-skeleton-${idx}`} className="shrink-0">
                  <div className="relative h-16 w-[160px] rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

