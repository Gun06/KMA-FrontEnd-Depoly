"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'


export default function SignupSuccessPage() {
  const router = useRouter()


  const handleGoToLogin = () => {
    router.push('/login')
  }

  
  return (
    <SignupLayout currentStep={5}>
      <div className="text-center space-y-6 sm:space-y-8">
        {/* 성공 아이콘 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            회원가입이 완료되었습니다! 🎉
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            전국마라톤협회의 회원이 되신 것을 환영합니다.<br />
            이제 로그인하여 다양한 서비스를 이용하실 수 있습니다.
          </p>
        </div>

        {/* 로그인 버튼 */}
        <div className="pt-4">
          <button
            onClick={handleGoToLogin}
            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg sm:text-xl"
          >
            <span>로그인하러 가기</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 추가 안내 */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>문의사항이 있으시면 고객센터로 연락해주세요.</p>
          <p>고객센터: 02-1234-5678</p>
        </div>
      </div>
    </SignupLayout>
  )
}
