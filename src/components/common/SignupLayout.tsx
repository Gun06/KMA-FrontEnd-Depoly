"use client"

import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import logoImage from '@/assets/images/main/logo.jpg'

interface SignupLayoutProps {
  children: React.ReactNode
  currentStep: number
}

export default function SignupLayout({ children, currentStep }: SignupLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9F9FA] py-4 sm:py-6 md:py-8">
      {/* 메인 컨테이너 */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
        {/* 콘텐츠 영역 */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6 sm:space-y-8">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
                {/* 로고 */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                  <Image
                    src={logoImage}
                    alt="전국마라톤협회 로고"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 제목 */}
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-giants text-kma-black mb-2 leading-none">회원가입</h1>
                  <p className="text-sm sm:text-base md:text-lg text-[#898989] font-pretendard">
                    회원가입을 하시면 보다 나은 서비스를 받으실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 진행률 표시기 */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step < currentStep ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-8 sm:w-10 md:w-12 h-0.5 mx-1 sm:mx-2 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200" />

            {/* 메인 콘텐츠 */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
