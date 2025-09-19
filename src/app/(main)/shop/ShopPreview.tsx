'use client'

import React from 'react'
import Image from 'next/image'
import shoppingImage from '@/assets/images/main/shopping.png'

interface ShopPreviewProps {
  onVisitShop: () => void
}

export default function ShopPreview({ onVisitShop }: ShopPreviewProps) {

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        

        {/* 이미지 미리보기 영역 (클릭 방지 오버레이 포함) */}
        <div className="relative w-full">
          <Image
            src={shoppingImage}
            alt="쇼핑몰 미리보기"
            className="w-full h-auto select-none pointer-events-none"
            priority
          />
          {/* 클릭 방지 오버레이 (전체 어둡게) */}
          <div className="absolute inset-0 z-10 bg-black bg-opacity-50" aria-hidden="true" />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="text-center bg-black bg-opacity-60 rounded-lg p-8 shadow-xl">
              <div className="text-white mb-4">
                <h3 className="text-2xl font-bold mb-2">월드런 쇼핑몰 미리보기</h3>
                <p className="text-gray-200">실제 쇼핑은 아래 버튼을 통해 이동하세요</p>
              </div>
              <button
                onClick={onVisitShop}
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
              >
                쇼핑몰 방문하기 →
              </button>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="bg-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="font-bold text-gray-900 mb-2">월드런 쇼핑몰 특징</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 마라톤 러닝화 전문 브랜드</li>
                <li>• 스피드업, 슈플, 베플 등 다양한 제품</li>
                <li>• 러닝 의류 및 액세서리 판매</li>
                <li>• 건강보조식품 및 크림</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
