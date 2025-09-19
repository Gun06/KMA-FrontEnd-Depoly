'use client'

import React, { useState } from 'react'

// 단일 진실원본: 헤더(메인)와 모달(서브)을 모두 이 구조로 렌더링
const menuColumns = [
  {
    label: '전마협',
    items: [
          { name: '협회소개', href: '/association' },
    { name: '조직도', href: '/association/organizational-chart' },
    { name: '인사말', href: '/association/greeting' },
    { name: '설립취지', href: '/association/foundation' },
    ],
  },
  {
    label: '대회일정',
    items: [
      { name: '대회리스트', href: '/schedule' },
    ],
  },
  {
    label: '접수안내',
    items: [
      { name: '참가신청 가이드', href: '/registration/guide' },
    ],
  },
  {
    label: '게시판',
    items: [
          { name: '공지사항', href: '/notice' },
    { name: '문의사항', href: '/notice/inquiry' },
    ],
  },
  {
    label: '쇼핑몰',
    items: [
      { name: '기념품/굿즈 판매', href: '/shop/merchandise' },
    ],
  },
  {
    label: '마이페이지',
    items: [
          { name: '신청내역', href: '/mypage/applications' },
    { name: '기록증 발급', href: '/mypage/certificates' },
    { name: '포인트 현황', href: '/mypage/points' },
    ],
  },
]

export default function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return (
    <>
      <nav className="hidden md:grid items-center border-x border-white/20 text-white" style={{ gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))' }}>
        {menuColumns.map((col) => (
          <div key={col.label} className="flex items-center justify-center h-16 border-x border-white/20">
            <button
              onClick={() => setActiveMenu(activeMenu === col.label ? null : col.label)}
              className="w-full h-full flex items-center justify-center text-center font-pretendard text-white/80 hover:text-white transition-colors whitespace-nowrap break-keep truncate"
            >
              {col.label}
            </button>
          </div>
        ))}
      </nav>

      {/* 모바일 햄버거 메뉴 */}
      <div className="md:hidden text-white">
        <button
          onClick={() => setActiveMenu(activeMenu === 'mobile' ? null : 'mobile')}
          className="p-2 text-white hover:text-gray-200 transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${activeMenu === 'mobile' ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${activeMenu === 'mobile' ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${activeMenu === 'mobile' ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* 데스크톱 서브메뉴 모달 */}
      {activeMenu && activeMenu !== 'mobile' && (
        <div className="fixed inset-0 z-50">
          {/* 블러 배경 - 헤더 제외 */}
          <div 
            className="absolute top-16 left-0 right-0 bottom-0 bg-black bg-opacity-40"
            onClick={() => setActiveMenu(null)}
            onMouseEnter={() => setActiveMenu(null)}
          />
          
          {/* 모달 컨텐츠 */}
          <div className="absolute top-16 left-0 right-0 bg-black text-white shadow-lg border-t border-white/20">
            <div className="w-full max-w-[1920px] mx-auto px-4">
              {/* 서브메뉴 컨테이너 */}
              <div className="flex justify-center py-12">
                {/* 중앙 6열 서브메뉴 */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))' }}>
                  {menuColumns.map((col) => (
                    <div key={col.label} className="flex flex-col items-center overflow-hidden border-x border-white/20">
                      <ul className="space-y-2 py-2 w-full">
                        {col.items.map((subItem) => (
                          <li key={subItem.name}>
                            <a
                              href={subItem.href}
                              className="text-sm font-pretendard text-white/80 hover:text-white transition-colors block py-1 text-center whitespace-nowrap break-keep truncate max-w-full"
                              onClick={() => setActiveMenu(null)}
                            >
                              {subItem.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 메뉴 패널 */}
      {activeMenu === 'mobile' && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 블러 배경 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => setActiveMenu(null)}
          />
          
          {/* 모바일 메뉴 패널 */}
          <div className="absolute top-16 left-0 right-0 bg-black text-white shadow-lg border-t border-white/20">
            <div className="py-4">
              {menuColumns.map((col) => (
                <div key={col.label} className="border-b border-white/10 last:border-b-0">
                  <button
                    onClick={() => setActiveMenu(activeMenu === col.label ? null : col.label)}
                    className="w-full px-4 py-3 text-left font-pretendard text-white hover:bg-white/10 transition-colors"
                  >
                    {col.label}
                  </button>
                  {activeMenu === col.label && (
                    <div className="bg-white/5 px-4 py-2">
                      {col.items.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          className="block py-2 text-sm font-pretendard text-white/80 hover:text-white transition-colors"
                          onClick={() => setActiveMenu(null)}
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 