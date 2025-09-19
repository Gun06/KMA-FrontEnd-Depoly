'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import Link from 'next/link'
import { Calendar, FileText, Award, CreditCard, User, Settings } from 'lucide-react'

export default function MyPage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "마이페이지",
        subMenu: "홈"
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-giants-bold mb-2 text-black">
            <span className="text-blue-600">Run </span>
            Together, <span className="text-blue-600">Grow </span>Together!
          </h1>
          <p className="text-xl font-bold text-black">홍길동님!</p>
        </div>

        {/* 마이페이지 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 마라톤 신청내역 */}
          <Link 
            href="/mypage/applications"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">마라톤 신청내역</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">나의 마라톤 대회 신청 내역을 확인하세요</p>
            <div className="text-blue-600 font-medium group-hover:text-blue-800">
              신청내역 보기 →
            </div>
          </Link>

          {/* 기록증 발급 */}
          <Link 
            href="/mypage/certificates"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-200 transition-colors">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">기록증 발급</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">완주 기록증을 발급받으세요</p>
            <div className="text-green-600 font-medium group-hover:text-green-800">
              기록증 발급 →
            </div>
          </Link>

          {/* 포인트 현황 */}
          <Link 
            href="/mypage/points"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-yellow-200 transition-colors">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">포인트 현황</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">적립된 포인트를 확인하세요</p>
            <div className="text-yellow-600 font-medium group-hover:text-yellow-800">
              포인트 확인 →
            </div>
          </Link>

          {/* 프로필 관리 */}
          <Link 
            href="/mypage/profile"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-purple-200 transition-colors">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">프로필 관리</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">개인정보를 수정하세요</p>
            <div className="text-purple-600 font-medium group-hover:text-purple-800">
              프로필 수정 →
            </div>
          </Link>

          {/* 설정 */}
          <Link 
            href="/mypage/settings"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">설정</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">알림 및 계정 설정을 관리하세요</p>
            <div className="text-gray-600 font-medium group-hover:text-gray-800">
              설정 관리 →
            </div>
          </Link>

          {/* 문의하기 */}
          <Link 
            href="/notice/inquiry"
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-red-200 transition-colors">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">문의하기</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">궁금한 사항을 문의하세요</p>
            <div className="text-red-600 font-medium group-hover:text-red-800">
              문의하기 →
            </div>
          </Link>
        </div>

        {/* 최근 활동 요약 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">최근 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600">나이트 장수트레일레이스 38K-P</span>
              <span className="text-sm sm:text-base text-blue-600 font-medium">참가완료</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600">런데이 7월 마라톤 [미션RUNDAY]</span>
              <span className="text-sm sm:text-base text-green-600 font-medium">접수완료</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm sm:text-base text-gray-600">2025 전마협 별들의 전쟁 & 꽃들의 전쟁</span>
              <span className="text-sm sm:text-base text-red-600 font-medium">접수취소</span>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
