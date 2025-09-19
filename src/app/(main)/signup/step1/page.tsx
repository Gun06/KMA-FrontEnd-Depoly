"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import TermsModal from './TermsModal'
import { useSignupStore, useSignupActions } from '@/stores'

export default function SignupStep1Page() {
  const router = useRouter()
  const { formData, validation } = useSignupStore()
  const { updateTerms, validateStep, setCurrentStep } = useSignupActions()
  
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    personalInfo: false,
    marketing: false,
    email: false,
    sms: false
  })

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [selectedTermsType, setSelectedTermsType] = useState<'terms' | 'privacy' | 'personalInfo' | 'marketing'>('terms')

  // store의 데이터로 초기화
  useEffect(() => {
    if (formData.terms) {
      setAgreements({
        all: formData.terms.allTerms,
        terms: formData.terms.serviceTerms,
        privacy: formData.terms.privacyTerms,
        personalInfo: formData.terms.ageVerification,
        marketing: formData.terms.marketingTerms,
        email: formData.terms.marketingEmail,
        sms: formData.terms.marketingSMS
      })
    }
  }, [formData.terms])

  const handleAgreementChange = (key: string, value: boolean) => {
    let newAgreements = { ...agreements }
    
    if (key === 'all') {
      // 전체 동의 체크박스
      newAgreements = {
        all: value,
        terms: value,
        privacy: value,
        personalInfo: value,
        marketing: value,
        email: value,
        sms: value
      }
    } else if (key === 'marketing') {
      // 마케팅 체크박스를 체크하면 E-Mail과 SMS 둘 다 체크
      newAgreements = {
        ...newAgreements,
        marketing: value,
        email: value,
        sms: value
      }
    } else if (key === 'email' || key === 'sms') {
      // E-Mail 또는 SMS 개별 체크박스
      newAgreements = { ...newAgreements, [key]: value }
      
      // E-Mail과 SMS 둘 다 체크되었으면 마케팅도 체크
      if (newAgreements.email && newAgreements.sms) {
        newAgreements.marketing = true
      }
      // 둘 중 하나라도 해제되면 마케팅도 해제
      else if (!newAgreements.email || !newAgreements.sms) {
        newAgreements.marketing = false
      }
    } else {
      // 필수 약관들 (이용약관, 개인정보처리방침, 개인정보수집이용동의)
      newAgreements = { ...newAgreements, [key]: value }
      
      // 필수 항목들이 모두 체크되었는지 확인
      const allChecked = newAgreements.terms && newAgreements.privacy && newAgreements.personalInfo
      newAgreements.all = allChecked
    }
    
    setAgreements(newAgreements)
    
    // store에 업데이트
    updateTerms({
      allTerms: newAgreements.all,
      serviceTerms: newAgreements.terms,
      privacyTerms: newAgreements.privacy,
      ageVerification: newAgreements.personalInfo,
      marketingTerms: newAgreements.marketing,
      marketingEmail: newAgreements.email,
      marketingSMS: newAgreements.sms
    })
  }

  const canProceed = agreements.terms && agreements.privacy && agreements.personalInfo

  const handleShowTerms = (type: 'terms' | 'privacy' | 'personalInfo' | 'marketing') => {
    setSelectedTermsType(type)
    setShowTermsModal(true)
  }

  const handleCloseTermsModal = () => {
    setShowTermsModal(false)
  }

  const handleNext = () => {
    if (validateStep(1)) {
      setCurrentStep(2)
      router.push('/signup/step2')
    }
  }

  return (
    <SignupLayout currentStep={1}>
      {/* 이용약관 섹션 */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">이용약관</h2>
        
        {/* 전체 동의 체크박스 */}
        <div className="border-t-2 border-gray-600 pb-0 mb-0">
          <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border-b border-gray-200">
            <button
              onClick={() => handleAgreementChange('all', !agreements.all)}
              className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transition-colors ${
                agreements.all 
                  ? 'text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="sm:w-5 sm:h-5">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </button>
            <label 
              htmlFor="all-agree" 
              className="text-sm sm:text-base md:text-lg font-medium text-gray-900 cursor-pointer"
              onClick={() => handleAgreementChange('all', !agreements.all)}
            >
              아래 내용에 모두 동의합니다.
            </label>
          </div>
        </div>
        
        {/* 개별 약관 목록 */}
        <div className="space-y-2">
          {/* 필수 약관들 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 sm:p-3">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => handleAgreementChange('terms', !agreements.terms)}
                  className={`w-4 h-4 flex items-center justify-center transition-colors flex-shrink-0 ${
                    agreements.terms 
                      ? 'text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                  </svg>
                </button>
                <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  [필수] 이용약관
                </span>
              </div>
              <button 
                onClick={() => handleShowTerms('terms')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0 ml-4"
              >
                약관보기
              </button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => handleAgreementChange('privacy', !agreements.privacy)}
                  className={`w-4 h-4 flex items-center justify-center transition-colors flex-shrink-0 ${
                    agreements.privacy 
                      ? 'text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                  </svg>
                </button>
                <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  [필수] 개인정보 처리 방침
                </span>
              </div>
              <button 
                onClick={() => handleShowTerms('privacy')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0 ml-4"
              >
                약관보기
              </button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => handleAgreementChange('personalInfo', !agreements.personalInfo)}
                  className={`w-4 h-4 flex items-center justify-center transition-colors flex-shrink-0 ${
                    agreements.personalInfo 
                      ? 'text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                  </svg>
                </button>
                <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  [필수] 개인정보 수집 및 이용동의
                </span>
              </div>
              <button 
                onClick={() => handleShowTerms('personalInfo')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0 ml-4"
              >
                약관보기
              </button>
            </div>
          </div>
          
          {/* 선택 약관 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 sm:p-3">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => handleAgreementChange('marketing', !agreements.marketing)}
                  className={`w-4 h-4 flex items-center justify-center transition-colors flex-shrink-0 ${
                    agreements.marketing 
                      ? 'text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                  </svg>
                </button>
                <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  [선택] 마케팅활용동의 및 광고수신동의
                </span>
              </div>
              <button 
                onClick={() => handleShowTerms('marketing')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0 ml-4"
              >
                약관보기
              </button>
            </div>

            {/* 마케팅 하위 옵션 */}
            <div className="ml-8 space-y-1">
              <div className="flex items-center p-2 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAgreementChange('email', !agreements.email)}
                    className={`w-4 h-4 flex items-center justify-center transition-colors ${
                      agreements.email 
                        ? 'text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                    </svg>
                  </button>
                  <span className="text-sm text-gray-700">E-Mail</span>
                  <span className="text-xs text-gray-500">(이메일을 통한 마케팅 정보 수신)</span>
                </div>
              </div>

              <div className="flex items-center p-2 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAgreementChange('sms', !agreements.sms)}
                    className={`w-4 h-4 flex items-center justify-center transition-colors ${
                      agreements.sms 
                        ? 'text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" stroke="currentColor" strokeWidth="0.5"/>
                    </svg>
                  </button>
                  <span className="text-sm text-gray-700">SMS</span>
                  <span className="text-xs text-gray-500">(문자메시지를 통한 마케팅 정보 수신)</span>
                </div>
              </div>
              
              {/* 안내 메시지 */}
              <div className="px-2 py-1">
                <p className="text-xs text-gray-500">
                  마케팅 활용 동의를 체크하시면 E-Mail과 SMS가 함께 선택됩니다.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 유효성 검사 에러 메시지 */}
        {validation.step1.errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            {validation.step1.errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* 구분선 */}
      <div className="border-t border-gray-200" />
      
      {/* 기존 회원 링크 */}
      <div className="text-center">
        <span className="text-gray-600">이미 회원이신가요? </span>
        <button 
          onClick={() => router.push('/login')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          로그인
        </button>
      </div>
      
      {/* 하단 버튼 */}
      <div className="flex space-x-4">
        <button 
          onClick={() => router.push('/login')}
          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
        >
          취소
        </button>
        <button 
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base ${
            canProceed 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>다음</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* 약관 모달 */}
      {showTermsModal && (
        <TermsModal
          type={selectedTermsType}
          onClose={handleCloseTermsModal}
        />
      )}
    </SignupLayout>
  )
}
