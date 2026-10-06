import { FaqPageFrame } from './FaqPageFrame';

export function FaqLoadingState() {
  return (
    <FaqPageFrame>
      <div className="divide-y divide-gray-200 rounded-md bg-white">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`faq-sk-${idx}`} className="py-4 sm:py-5 md:py-6">
            <div className="flex w-full items-center gap-3 sm:gap-4">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200 md:h-6 md:w-6" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-[14px] w-full animate-pulse rounded bg-gray-200 md:h-4" />
                <div className="h-[14px] w-3/4 animate-pulse rounded bg-gray-200 md:h-4" />
              </div>
              <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200 md:h-5 md:w-5" />
            </div>
          </div>
        ))}
      </div>
    </FaqPageFrame>
  );
}
