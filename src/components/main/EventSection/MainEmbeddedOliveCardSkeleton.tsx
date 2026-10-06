import clsx from 'clsx';
import { EMBEDDED_OLIVE_WIDE_CARD_WIDTH } from './EventCard';

/** 메인 embedded EventCard(olive)와 동일 비율·뱃지·메타 줄 */
export function MainEmbeddedOliveCardSkeleton({ className }: { className?: string }) {
  return (
    <li className={clsx('shrink-0 list-none', EMBEDDED_OLIVE_WIDE_CARD_WIDTH, className)}>
      <div className={clsx('flex flex-col select-none', EMBEDDED_OLIVE_WIDE_CARD_WIDTH)}>
        <div className="relative aspect-[332/166] w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-200/90 animate-pulse">
          <div className="absolute left-0 top-0 h-6 w-[3.25rem] rounded-br-lg rounded-tl-xl bg-gray-300/95 md:h-7 md:w-[4.25rem]" />
        </div>
        <div className="mt-2 space-y-1.5 md:mt-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-3 w-9 shrink-0 animate-pulse rounded bg-gray-200" />
            <div className="h-3 min-w-0 flex-1 animate-pulse rounded bg-gray-200/90" />
          </div>
          <div className="h-3.5 w-[92%] animate-pulse rounded bg-gray-200 md:h-4" />
          <div className="h-3 w-14 animate-pulse rounded bg-gray-200/80" />
        </div>
      </div>
    </li>
  );
}
