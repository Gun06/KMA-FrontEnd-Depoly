import React from 'react'
import Image from 'next/image'
import logoImage from '@/assets/images/main/logo.jpg'

export default function Logo() {
  return (
    <div className="flex items-center space-x-2 text-white">
      {/* 로고 이미지 */}
      <div className="w-8 h-8 relative">
        <Image
          src={logoImage}
          alt="전국마라톤협회 로고"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
      
      {/* 로고 텍스트 */}
      <span className="font-giants text-lg text-white">
        전국마라톤협회 관리자 페이지
      </span>
    </div>
  )
} 