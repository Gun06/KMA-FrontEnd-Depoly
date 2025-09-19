"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import PostalCodeSearch from './PostalCodeSearch'
import { useSignupStore, useSignupActions } from '@/stores'
import { useSignup } from '@/services/auth'

export default function SignupStep4Page() {
  const router = useRouter()
  const { formData, validation } = useSignupStore()
  const { updateAddress, validateStep, validateAllSteps, setCurrentStep, setLoading, setError, resetStore } = useSignupActions()
  
  // useSignup 훅 사용
  const signupMutation = useSignup()
  
  const [formDataLocal, setFormDataLocal] = useState({
    postalCode: '',
    address: '',
    detailedAddress: ''
  })

  const [showPostalCodeSearch, setShowPostalCodeSearch] = useState(false)

  // store의 데이터로 초기화
  useEffect(() => {
    if (formData.address) {
      setFormDataLocal({
        postalCode: formData.address.postalCode || '',
        address: formData.address.address || '',
        detailedAddress: formData.address.addressDetail || ''
      })
    }
  }, [formData.address])

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formDataLocal, [field]: value }
    setFormDataLocal(newFormData)
    
    // store에 업데이트
    updateAddress({
      postalCode: newFormData.postalCode,
      address: newFormData.address,
      addressDetail: newFormData.detailedAddress
    })
  }

  const handlePostalCodeSearch = () => {
    setShowPostalCodeSearch(true)
  }

  const handlePostalCodeComplete = (data: { postalCode: string; address: string; detailedAddress: string }) => {
    const newFormData = {
      postalCode: data.postalCode,
      address: data.address,
      detailedAddress: data.detailedAddress
    }
    
    setFormDataLocal(newFormData)
    
    // store에 업데이트
    updateAddress({
      postalCode: newFormData.postalCode,
      address: newFormData.address,
      addressDetail: newFormData.detailedAddress
    })
  }

  const handlePostalCodeClose = () => {
    setShowPostalCodeSearch(false)
  }

  const canProceed = formDataLocal.postalCode && formDataLocal.address && formDataLocal.detailedAddress

  const handlePrev = () => {
    setCurrentStep(3)
    router.push('/signup/step3')
  }

  const handleSignup = async () => {
    if (!validateStep(4)) {
      return
    }

    // 모든 단계 유효성 검사
    if (!validateAllSteps()) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    
    try {
      // 회원가입 데이터 준비
      const signupData = {
        account: {
          accountId: formData.account.account,
          accountPassword: formData.account.password
        },
        profile: {
          birth: formData.personal.birthDate.replace(/\./g, '-'), // YYYY.MM.DD -> YYYY-MM-DD
          name: formData.personal.name,
          phNum: `${formData.personal.phonePrefix}-${formData.personal.phoneMiddle}-${formData.personal.phoneLast}`,
          email: `${formData.personal.emailLocal}@${formData.personal.emailDomain}`, // email 조합
          gender: (formData.personal.gender === 'male' ? 'M' : formData.personal.gender === 'female' ? 'F' : 'M') as 'M' | 'F' // M/F 형식으로 변경
        },
        consents: {
          termsOfService: formData.terms.serviceTerms,
          privacyPolicy: formData.terms.privacyTerms,
          marketingAndAdvertisingSMS: formData.terms.marketingSMS,
          marketingAndAdvertisingEmail: formData.terms.marketingEmail,
          personalInfoCollectionAndUse: formData.terms.ageVerification
        },
        address: {
          siDo: formData.address.address.split(' ')[0] || '', // 첫 번째 공백까지 (시도)
          siGunGu: formData.address.address.split(' ')[1] || '', // 두 번째 공백까지 (시군구)
          roadAddress: formData.address.address,
          zipCode: formData.address.postalCode,
          addressDetail: formData.address.addressDetail
        }
      }

      console.log('=== 회원가입 요청 데이터 ===')
      console.log(JSON.stringify(signupData, null, 2))

      // useSignup 훅을 사용하여 회원가입 요청
      await signupMutation.mutateAsync(signupData)
      
      console.log('=== 회원가입 성공 ===')

      // 성공 시 store 초기화하고 success 페이지로 이동
      resetStore()
      router.push('/signup/success')
      
    } catch (err) {
      console.error('회원가입 오류:', err)
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignupLayout currentStep={4}>
      {/* 주소 입력 폼 */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">주소 입력</h2>
        
        {/* 주소 섹션 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            주소 <span className="text-red-500">*</span>
          </label>
          
          {/* 우편번호 입력 */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={formDataLocal.postalCode}
              readOnly
              placeholder="우편번호"
              className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
            />
            <button
              onClick={handlePostalCodeSearch}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 whitespace-nowrap text-sm sm:text-base"
            >
              <span>우편번호 찾기</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* 기본주소 입력 */}
          <input
            type="text"
            value={formDataLocal.address}
            readOnly
            placeholder="우편번호 찾기로 주소를 설정하세요"
            className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
          />

          {/* 상세주소 입력 */}
          <input
            type="text"
            value={formDataLocal.detailedAddress}
            onChange={(e) => handleInputChange('detailedAddress', e.target.value)}
            placeholder="상세주소를 입력해주세요"
            className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* 유효성 검사 에러 메시지 */}
        {validation.step4.errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            {validation.step4.errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* 우편번호 검색 컴포넌트 */}
      {showPostalCodeSearch && (
        <PostalCodeSearch
          onComplete={handlePostalCodeComplete}
          onClose={handlePostalCodeClose}
        />
      )}
      
      {/* 하단 버튼 */}
      <div className="flex space-x-4">
        <button 
          onClick={handlePrev}
          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>이전</span>
        </button>
        <button 
          onClick={handleSignup}
          disabled={!canProceed}
          className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            canProceed 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          회원가입
        </button>
      </div>
    </SignupLayout>
  )
}
