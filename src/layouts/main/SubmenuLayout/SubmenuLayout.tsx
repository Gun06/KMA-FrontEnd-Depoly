import React from 'react'
import MainHeader from '@/components/main/Header'
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
      {/* 헤더 */}
      <MainHeader />
      
      {/* 헤더 아래 여유 공간 */}
      <div className="pt-0 sm:pt-0 md:pt-0"></div>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 */}
        <div className="relative w-full">
          <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
          <div className="hidden lg:block" style={{ height: '150px' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />
          
          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-8 md:px-16 lg:px-32 xl:px-48">
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
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
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
  headerBgClass, 
  accentColor 
}: SubmenuLayoutThemedProps) {
  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <MainHeader />
      
      {/* 헤더 아래 여유 공간 */}
      <div className="pt-4 sm:pt-6 md:pt-8"></div>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 */}
        <div className="relative w-full">
          <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
          <div className="hidden lg:block" style={{ height: '150px' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />
          
          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-8 md:px-16 lg:px-32 xl:px-48">
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
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
