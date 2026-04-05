import Image from 'next/image';
import Link from 'next/link';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';
import { LOCAL_EVENT_PAGE_GUTTER } from '../layoutGutter';

export default function LocalEventBanner() {
  return (
    <div className="relative w-full">
      <div className="sm:hidden" style={{ paddingBottom: '20%' }} />
      <div className="hidden sm:block md:hidden" style={{ height: '150px' }} />
      <div className="hidden md:block lg:hidden" style={{ height: '150px' }} />
      <div className="hidden lg:block" style={{ height: '150px' }} />
      <Image
        src={menubanner}
        alt="메뉴 배너"
        fill
        className="object-cover object-right"
        priority
      />
      <div
        className={`absolute inset-0 flex flex-col items-start justify-center ${LOCAL_EVENT_PAGE_GUTTER}`}
      >
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black mb-1 sm:mb-2 font-giants-bold">
          지역대회
        </h1>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <Link href="/" className="flex items-center hover:text-blue-600 transition-colors">
            <Image src={homeIcon} alt="홈" width={14} height={14} className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/schedule" className="hover:text-blue-600 transition-colors">
            대회일정
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">지역대회</span>
        </div>
      </div>
    </div>
  );
}
