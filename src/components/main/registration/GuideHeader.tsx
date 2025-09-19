'use client'

import { useState } from 'react'
import Image from 'next/image'
import certificateImage from '@/assets/images/main/certificate.png'
import groupImage from '@/assets/images/main/group.png'

export default function GuideHeader() {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual')

  const getTabContent = () => {
    if (activeTab === 'individual') {
      return {
        image: certificateImage,
        title: '참가신청가이드(개인)',
        description: '개인 참가자를 위한 상세한 신청 절차와 주의사항을 안내합니다. 대회 선택부터 참가 완료까지 단계별로 확인하실 수 있습니다.'
      }
    } else {
      return {
        image: groupImage,
        title: '참가신청가이드(단체)',
        description: '단체 참가를 위한 신청 방법과 필요한 서류, 결제 안내 등을 상세히 안내합니다. 팀 단위로 참가하시는 분들을 위한 가이드입니다.'
      }
    }
  }

  const tabContent = getTabContent()

  return (
    <div className="bg-gray-100 relative overflow-hidden w-screen -ml-[calc(50vw-50%)] pt-4 lg:pt-8 mb-8">
      {/* 왼쪽 화살표 네비게이션 */}
      <button 
        onClick={() => setActiveTab(activeTab === 'individual' ? 'group' : 'individual')}
        className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 오른쪽 화살표 네비게이션 */}
      <button 
        onClick={() => setActiveTab(activeTab === 'individual' ? 'group' : 'individual')}
        className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-8 relative z-10">
          {/* 왼쪽 이미지 섹션 */}
          <div className="flex-shrink-0 relative w-full max-w-xs lg:w-80 lg:max-w-none">
            <div className="w-full h-48 lg:h-60 relative">
              <Image
                src={tabContent.image}
                alt={activeTab === 'individual' ? '개인 참가' : '단체 참가'}
                width={320}
                height={240}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 오른쪽 텍스트 섹션 */}
          <div className="flex-1 text-center lg:text-left lg:pt-2">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
              {tabContent.title}
            </h1>
            <p className="text-sm lg:text-lg text-gray-600 mb-4 lg:mb-6 leading-relaxed">
              {tabContent.description}
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-base lg:text-lg transition-colors">
              자세히보기 →
            </button>
          </div>
        </div>

        {/* 하단 점 네비게이션 */}
        <div className="flex justify-center mt-4 lg:mt-6 gap-2">
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${activeTab === 'individual' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${activeTab === 'group' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    </div>
  )
}
