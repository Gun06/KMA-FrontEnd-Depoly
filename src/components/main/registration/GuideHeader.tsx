'use client'

import Image from 'next/image'
import certificateImage from '@/assets/images/main/certificate.png'
import groupImage from '@/assets/images/main/group.png'

type GuideHeaderProps = {
  activeTab: 'individual' | 'group'
  onTabChange: (tab: 'individual' | 'group') => void
}

export default function GuideHeader({ activeTab, onTabChange }: GuideHeaderProps) {
  const getTabContent = () => {
    if (activeTab === 'individual') {
      return {
        image: certificateImage,
        badge: 'INDIVIDUAL',
        title: '참가신청 가이드(개인)',
        description:
          '개인 참가자를 위한 신청 절차를 단계별로 안내합니다. 대회 선택부터 신청 확인까지 필요한 내용을 한 번에 확인하실 수 있습니다.'
      }
    } else {
      return {
        image: groupImage,
        badge: 'GROUP',
        title: '참가신청 가이드(단체)',
        description:
          '단체 참가를 위한 신청 방식과 준비사항을 안내합니다. 팀 정보 입력, 참가자 등록, 결제 확인까지 순서대로 확인해 주세요.'
      }
    }
  }

  const tabContent = getTabContent()

  return (
    <div className="bg-gray-100 relative overflow-hidden w-screen -ml-[calc(50vw-50%)] pt-2 lg:pt-4 mb-6">
      {/* 왼쪽 화살표 네비게이션 */}
      <button
        onClick={() => onTabChange(activeTab === 'individual' ? 'group' : 'individual')}
        className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center z-20 text-black/80 hover:text-black transition-colors duration-200"
        aria-label="이전 가이드 보기"
      >
        <svg className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.28)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 오른쪽 화살표 네비게이션 */}
      <button
        onClick={() => onTabChange(activeTab === 'individual' ? 'group' : 'individual')}
        className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center z-20 text-black/80 hover:text-black transition-colors duration-200"
        aria-label="다음 가이드 보기"
      >
        <svg className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.28)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto px-4 py-3 lg:py-5">
        <div>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-6 relative z-10">
          {/* 왼쪽 이미지 섹션 */}
          <div className="flex-shrink-0 relative w-full max-w-[220px] lg:w-64 lg:max-w-none">
            <div className="w-full h-36 lg:h-44 relative">
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
          <div className="flex-1 text-center lg:text-left lg:pt-1">
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3">
              {tabContent.title}
            </h1>
            <p className="text-xs lg:text-base text-gray-600 mb-2 lg:mb-3 leading-relaxed">
              {tabContent.description}
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm lg:text-base transition-colors">
              상세 절차 보기 →
            </button>
          </div>
          </div>
        </div>

        {/* 하단 점 네비게이션 */}
        <div className="flex justify-center mt-2 lg:mt-3 gap-2">
          <div className={`w-2 h-2 rounded-full ${activeTab === 'individual' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${activeTab === 'group' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    </div>
  )
}
