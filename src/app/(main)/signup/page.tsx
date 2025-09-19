"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSignupActions } from '@/stores'

export default function SignupPage() {
  const router = useRouter()
  const { resetStore, setCurrentStep } = useSignupActions()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      // 회원가입 시작 시 store 초기화
      resetStore()
      setCurrentStep(1)
      hasInitialized.current = true
    }
    
    // /signup에 접속하면 자동으로 step1으로 리다이렉트
    router.replace('/signup/step1')
  }, [router, resetStore, setCurrentStep])

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">회원가입 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
