import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';

/** 협회 소개 등 SubmenuLayout과 동일 — 배너가 고정 헤더 뒤까지 올라가도록 */
export default function LocalEventBanner() {
  return (
    <div
      className="relative w-full"
      style={{ marginTop: 'calc(-1 * var(--kma-main-header-offset, 80px))' }}
    >
      <div className="flex w-full flex-col">
        <div
          aria-hidden
          className="w-full shrink-0"
          style={{ height: 'var(--kma-main-header-offset, 80px)' }}
        />
        <div className="aspect-[6/1] w-full shrink-0 sm:aspect-[7/1] lg:aspect-[12/1]" />
      </div>
      <Image
        src={menubanner}
        alt="메뉴 배너"
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <div
        className="absolute inset-0 flex flex-col items-start justify-center px-4 py-1 sm:px-6 sm:py-1.5 lg:px-[6vw]"
        style={{ paddingTop: 'var(--kma-main-header-offset, 80px)' }}
      >
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-black mb-0.5 sm:mb-1 font-giants-bold">
          지역대회
        </h1>
        <nav className="text-xs sm:text-sm md:text-sm text-black">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className="hover:text-gray-700 transition-colors duration-200 flex items-center gap-1 px-1 sm:px-0 text-black font-normal underline"
            >
              <Image src={homeIcon} alt="홈" className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">홈</span>
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
            <span className="text-black font-normal whitespace-nowrap underline">
              대회일정
            </span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
            <span className="text-black font-bold whitespace-nowrap underline">
              지역대회
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}
