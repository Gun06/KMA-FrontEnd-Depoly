type Props = {
  showViews?: boolean;
  rowCount?: number;
};

export default function NoticeSkeleton({
  showViews = false,
  rowCount = 10,
}: Props) {
  return (
    <div className="w-full">
      {/* 테이블 - NoticeBoard와 동일한 가로 패딩 */}
      <div className="overflow-hidden sm:px-6">
        {/* Desktop / Tablet */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full border-t border-[#E5E7EB]">
            <thead>
              <tr className="bg-[#3B3F45] text-white text-center">
                <th className="h-12 px-2.5 lg:px-3.5 font-medium whitespace-nowrap" style={{ width: 80 }}>
                  <div className="mx-auto h-5 w-10 rounded bg-gray-400 animate-pulse" />
                </th>
                <th className="h-12 px-2.5 lg:px-3.5 font-medium text-left">
                  <div className="h-5 w-12 rounded bg-gray-400 animate-pulse" />
                </th>
                <th className="h-12 px-2.5 lg:px-3.5 font-medium whitespace-nowrap" style={{ width: 140 }}>
                  <div className="mx-auto h-5 w-12 rounded bg-gray-400 animate-pulse" />
                </th>
                <th className="h-12 px-2.5 lg:px-3.5 font-medium whitespace-nowrap" style={{ width: 150 }}>
                  <div className="mx-auto h-5 w-12 rounded bg-gray-400 animate-pulse" />
                </th>
                {showViews && (
                  <th className="h-12 px-2.5 lg:px-3.5 font-medium whitespace-nowrap" style={{ width: 100 }}>
                    <div className="mx-auto h-5 w-10 rounded bg-gray-400 animate-pulse" />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, index) => (
                <tr key={`skeleton-row-${index}`} className="border-b border-[#F1F3F5] bg-white">
                  <td className="px-2.5 lg:px-3.5 py-3 align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-12 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                  <td className="px-2.5 lg:px-3.5 py-3 text-left max-w-0 w-full">
                    <div className="h-5 w-[72%] max-w-full rounded bg-gray-200 animate-pulse" />
                  </td>
                  <td className="px-2.5 lg:px-3.5 py-3 text-center text-[#6B7280] whitespace-nowrap">
                    <div className="mx-auto h-5 w-16 rounded bg-gray-200 animate-pulse" />
                  </td>
                  <td className="px-2.5 lg:px-3.5 py-3 text-center text-[#6B7280] whitespace-nowrap">
                    <div className="mx-auto h-5 w-24 rounded bg-gray-200 animate-pulse" />
                  </td>
                  {showViews && (
                    <td className="px-2.5 lg:px-3.5 py-3 text-center text-[#6B7280]">
                      <div className="mx-auto h-5 w-8 rounded bg-gray-200 animate-pulse" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <ul className="md:hidden divide-y divide-[#F1F3F5]">
          {Array.from({ length: rowCount }).map((_, index) => (
            <li key={`skeleton-mobile-${index}`} className="px-2 py-3 sm:px-4 bg-white">
              <div className="grid grid-cols-[40px_1fr] gap-3 items-start">
                <div className="h-6 flex items-center justify-center">
                  <div className="h-5 w-10 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5">
                    <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    <span className="opacity-30">·</span>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <span className="opacity-30">·</span>
                    <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                    {showViews && (
                      <>
                        <span className="opacity-30">·</span>
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

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
