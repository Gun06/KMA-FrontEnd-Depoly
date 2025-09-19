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
    <div className="min-h-screen bg-[#F9F9FA] py-8">
      {/* 메인 컨테이너 */}
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* 콘텐츠 영역 */}
        <div className="p-8">
          <div className="space-y-8">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-6">
                {/* 로고 */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                  <Image
                    src={logoImage}
                    alt="전국마라톤협회 로고"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 제목 */}
                <div className="text-left">
                  <h1 className="text-4xl font-giants text-kma-black mb-2 leading-none">회원가입</h1>
                  <p className="text-lg text-[#898989] font-pretendard">
                    회원가입을 하시면 보다 나은 서비스를 받으실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 진행률 표시기 */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-0.5 mx-2 ${
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
