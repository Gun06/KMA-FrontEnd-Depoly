import React from 'react'
import Image from 'next/image'
import menubanner from '@/assets/images/main/menubanner.png'
import homeIcon from '@/assets/icons/main/home.svg'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SubmenuLayoutProps {
  children: React.ReactNode
  breadcrumb?: {
    mainMenu: string;
    subMenu: string;
  }
}

export default function SubmenuLayout({ 
  children, 
  breadcrumb
}: SubmenuLayoutProps) {
  return (
    <div className="min-h-[50vh] sm:min-h-screen flex flex-col">
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 — 헤더 높이만큼 위로 당겨 헤더 뒤까지 꽉 채움 */}
        <div
          className="relative w-full"
          style={{ marginTop: 'calc(-1 * var(--kma-main-header-offset, 80px))' }}
        >
          {/* 배너 전체 높이 = 헤더 높이 + 콘텐츠 영역 높이 */}
          <div className="sm:hidden" style={{ paddingBottom: '28%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden lg:block" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />
          
          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 — 헤더 아래 영역에 표시 */}
          <div
            className="absolute inset-0 flex flex-col items-start justify-center px-4 sm:px-6 lg:px-[6vw]"
            style={{ paddingTop: 'var(--kma-main-header-offset, 80px)' }}
          >
            {/* 페이지 제목 */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black mb-1 sm:mb-2 font-giants-bold">
              {breadcrumb?.subMenu || "인사말"}
            </h1>
            
            {/* 브레드크럼 네비게이션 */}
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
                  {breadcrumb?.mainMenu || "협회소개"}
                </span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
                <span className="text-black font-bold whitespace-nowrap underline">
                  {breadcrumb?.subMenu || "인사말"}
                </span>
              </div>
            </nav>
          </div>
        </div>
        
        {/* 페이지 콘텐츠 */}
        <div className="container mx-auto px-2 py-4 sm:py-6 lg:px-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

// 테마 적용 레이아웃
interface SubmenuLayoutThemedProps extends SubmenuLayoutProps {
  headerBgClass?: string
  accentColor?: string
}

export function SubmenuLayoutThemed({ 
  children, 
  breadcrumb,
  headerBgClass: _headerBgClass, 
  accentColor: _accentColor 
}: SubmenuLayoutThemedProps) {
  return (
    <div className="flex flex-col">
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 — 헤더 높이만큼 위로 당겨 헤더 뒤까지 꽉 채움 */}
        <div
          className="relative w-full"
          style={{ marginTop: 'calc(-1 * var(--kma-main-header-offset, 80px))' }}
        >
          <div className="sm:hidden" style={{ paddingBottom: '28%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <div className="hidden lg:block" style={{ height: 'calc(120px + var(--kma-main-header-offset, 80px))' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />
          
          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 — 헤더 아래 영역에 표시 */}
          <div
            className="absolute inset-0 flex flex-col items-start justify-center px-4 sm:px-6 lg:px-[6vw]"
            style={{ paddingTop: 'var(--kma-main-header-offset, 80px)' }}
          >
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black mb-1 sm:mb-2 font-giants-bold">
              {breadcrumb?.subMenu || "인사말"}
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
                  {breadcrumb?.mainMenu || "협회소개"}
                </span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
                <span className="text-black font-bold whitespace-nowrap underline">
                  {breadcrumb?.subMenu || "인사말"}
                </span>
              </div>
            </nav>
          </div>
        </div>
        
        {/* 페이지 콘텐츠 */}
        <div className="container mx-auto px-2 py-4 sm:py-6 lg:px-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
