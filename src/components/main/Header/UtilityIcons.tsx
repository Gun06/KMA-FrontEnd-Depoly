'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import searchIcon from '@/assets/icons/main/search.svg'
import cartIcon from '@/assets/icons/main/cart.svg'
import userIcon from '@/assets/icons/main/user.svg'

export default function UtilityIcons() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('검색어:', searchQuery)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-8">
        {/* 검색 아이콘 */}
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Image
            src={searchIcon}
            alt="검색"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </button>
      
      {/* 쇼핑카트 아이콘 */}
      <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
        <Image
          src={cartIcon}
          alt="쇼핑카트"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      </button>
      
      {/* 로그인 버튼 */}
      <a 
        href="/login"
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Image
          src={userIcon}
          alt="사용자"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="font-pretendard text-sm">로그인</span>
      </a>
    </div>

    {/* 검색 모달 */}
    {isSearchOpen && (
      <div className="fixed inset-0 z-40">
        {/* 블러 배경 - 헤더 제외 */}
        <div 
          className="absolute top-16 left-0 right-0 bottom-0 bg-black bg-opacity-20"
          onClick={() => setIsSearchOpen(false)}
          onMouseEnter={() => setIsSearchOpen(false)}
        />
        
        {/* 검색 모달 컨텐츠 */}
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-orange-400">
          <div className="w-full max-w-[1920px] mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="검색어를 입력해 주세요."
                      className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-l-md focus:outline-none focus:border-gray-400"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Image
                        src={searchIcon}
                        alt="검색"
                        width={20}
                        height={20}
                        className="w-5 h-5 text-gray-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-6 py-3 bg-gray-700 text-white text-lg rounded-md hover:bg-gray-800 transition-colors font-medium"
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)
} 