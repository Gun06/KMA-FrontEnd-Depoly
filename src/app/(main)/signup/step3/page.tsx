"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import DatePicker from './DatePicker'
import { useSignupStore, useSignupActions } from '@/stores'

export default function SignupStep3Page() {
  const router = useRouter()
  const { formData, validation } = useSignupStore()
  const { 
    updatePersonal, 
    validateStep, 
    setCurrentStep 
  } = useSignupActions()
  
  const [formDataLocal, setFormDataLocal] = useState({
    name: '',
    birthDate: '',
    gender: '' as '' | 'male' | 'female',
    emailLocal: '',
    emailDomain: '',
    phonePrefix: '010',
    phoneMiddle: '',
    phoneLast: ''
  })

  // 휴대폰 인증 관련 상태 제거 - 인증 없이 진행 가능
  
  const [showEmailDomainDropdown, setShowEmailDomainDropdown] = useState(false)
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const domainInputRef = React.useRef<HTMLInputElement>(null)

  // store의 데이터로 초기화
  useEffect(() => {
    if (formData.personal) {
      setFormDataLocal({
        name: formData.personal.name || '',
        birthDate: formData.personal.birthDate || '',
        gender: formData.personal.gender || '',
        emailLocal: formData.personal.emailLocal || '',
        emailDomain: formData.personal.emailDomain || '',
        phonePrefix: formData.personal.phonePrefix || '010',
        phoneMiddle: formData.personal.phoneMiddle || '',
        phoneLast: formData.personal.phoneLast || ''
      })
      setIsCustomDomain(formData.personal.isCustomDomain || false)
    }
  }, [formData.personal])

  // 휴대폰 인증 상태 동기화 제거 - 인증 없이 진행 가능

  const handleInputChange = (field: string, value: string) => {
    let newValue = value
    
    // 전화번호 필드는 숫자만 입력 가능
    if (field === 'phoneMiddle' || field === 'phoneLast') {
      newValue = value.replace(/[^0-9]/g, '')
    }
    
    const newFormData = { ...formDataLocal, [field]: newValue }
    setFormDataLocal(newFormData)
    
    // store에 업데이트
    updatePersonal({
      name: newFormData.name,
      birthDate: newFormData.birthDate,
      gender: newFormData.gender,
      emailLocal: newFormData.emailLocal,
      emailDomain: newFormData.emailDomain,
      phonePrefix: newFormData.phonePrefix,
      phoneMiddle: newFormData.phoneMiddle,
      phoneLast: newFormData.phoneLast,
      isCustomDomain: isCustomDomain
    })
  }

  // 도메인 선택 시 직접 입력 모드 해제
  const handleDomainSelection = (domain: string) => {
    console.log('도메인 선택:', { domain, 이전_isCustomDomain: isCustomDomain })
    setIsCustomDomain(false)
    handleInputChange('emailDomain', domain)
    setShowEmailDomainDropdown(false)
    
    // store에 isCustomDomain 상태 업데이트
    updatePersonal({
      ...formDataLocal,
      emailDomain: domain,
      isCustomDomain: false
    })
  }

  const handleCustomDomainToggle = () => {
    const newCustomDomain = !isCustomDomain
    console.log('직접 입력 모드 전환:', { 이전: isCustomDomain, 현재: newCustomDomain })
    setIsCustomDomain(newCustomDomain)
    
    // 직접 입력 모드로 전환 시 도메인 값 초기화
    if (newCustomDomain) {
      handleInputChange('emailDomain', '')
      // 직접 입력 모드로 전환 시 input창에 포커스
      setTimeout(() => {
        if (domainInputRef.current) {
          domainInputRef.current.focus()
        }
      }, 100)
    }
    
    // store에 isCustomDomain 상태 업데이트
    updatePersonal({
      ...formDataLocal,
      isCustomDomain: newCustomDomain
    })
  }

  // 휴대폰 인증 관련 함수들 제거 - 인증 없이 진행 가능

  // 외부 클릭 시 이메일 도메인 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return
      
      const target = event.target as Element
      if (!target.closest('.email-domain-dropdown')) {
        setShowEmailDomainDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 전화번호 인증 없이 진행 가능하도록 수정
  const canProceed = formDataLocal.name && formDataLocal.birthDate && formDataLocal.gender && 
                    formDataLocal.emailLocal && formDataLocal.emailDomain &&
                    formDataLocal.phoneMiddle && formDataLocal.phoneLast

  const handleNext = () => {
    // 필수 필드 검증
    if (!formDataLocal.name || !formDataLocal.birthDate || !formDataLocal.gender || 
        !formDataLocal.emailLocal || !formDataLocal.emailDomain ||
        !formDataLocal.phoneMiddle || !formDataLocal.phoneLast) {
      return
    }
    
    // store 유효성 검사 통과 시 다음 단계로 이동
    if (validateStep(3)) {
      setCurrentStep(4)
      router.push('/signup/step4')
    }
  }

  const handlePrev = () => {
    setCurrentStep(2)
    router.push('/signup/step2')
  }

  return (
    <SignupLayout currentStep={3}>
      {/* 개인정보 입력 폼 */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">추가 정보 입력</h2>
        
        {/* 성명 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            성명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formDataLocal.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="성명을 입력해 주세요."
            className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* 생년월일 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            생년월일
          </label>
          <DatePicker
            value={formDataLocal.birthDate}
            onChange={(value) => handleInputChange('birthDate', value)}
            placeholder="YYYY.MM.DD"
          />
        </div>

        {/* 성별 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            성별 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formDataLocal.gender === 'male'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">남성</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formDataLocal.gender === 'female'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">여성</span>
            </label>
          </div>
        </div>

        {/* 이메일 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <input
              type="text"
              value={formDataLocal.emailLocal}
              onChange={(e) => handleInputChange('emailLocal', e.target.value)}
              placeholder="이메일 입력"
              className="w-32 sm:w-40 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <span className="text-gray-500 text-lg font-medium">@</span>
            <div className="relative email-domain-dropdown flex-1">
              <div className="flex space-x-2">
                                 <input
                   ref={domainInputRef}
                   type="text"
                   name="emailDomain"
                   value={formDataLocal.emailDomain}
                   onChange={(e) => handleInputChange('emailDomain', e.target.value)}
                   placeholder={isCustomDomain ? "도메인을 입력하세요" : "도메인을 선택하세요"}
                   disabled={!isCustomDomain}
                   className={`flex-1 w-32 sm:w-40 px-2 sm:px-3 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 ${
                     isCustomDomain 
                       ? 'border-blue-300 bg-blue-50 cursor-text shadow-sm' 
                       : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                   }`}
                 />
                <button
                  type="button"
                  onClick={() => setShowEmailDomainDropdown(!showEmailDomainDropdown)}
                  className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1 min-w-[80px]"
                >
                  <span className="text-xs">선택</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                </button>
              </div>
              
              {showEmailDomainDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'hotmail.com', 'outlook.com', 'yahoo.com'].map(domain => (
                    <button
                      key={domain}
                                             onClick={() => handleDomainSelection(domain)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                        formDataLocal.emailDomain === domain ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                  <div className="border-t border-gray-200">
                                         <button
                       onClick={() => {
                         handleCustomDomainToggle()
                         setShowEmailDomainDropdown(false)
                       }}
                       className="w-full px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                     >
                       직접 입력
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 전화번호 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            전화번호
          </label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:items-center">
            <div className="flex items-center space-x-2">
              <select
                value={formDataLocal.phonePrefix}
                onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={formDataLocal.phoneMiddle}
                onChange={(e) => handleInputChange('phoneMiddle', e.target.value)}
                placeholder=""
                maxLength={4}
                inputMode="numeric"
                className="w-16 sm:w-20 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base"
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={formDataLocal.phoneLast}
                onChange={(e) => handleInputChange('phoneLast', e.target.value)}
                placeholder=""
                maxLength={4}
                inputMode="numeric"
                className="w-16 sm:w-20 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base"
              />
            </div>
            
            {/* 휴대폰 인증 버튼 제거 - 인증 없이 진행 가능 */}
          </div>
          
          {/* 휴대폰 인증 관련 UI 제거 - 인증 없이 진행 가능 */}
        </div>

        {/* 유효성 검사 에러 메시지 */}
        {validation.step3.errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            {validation.step3.errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}
      </div>
      
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
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base ${
            canProceed 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>다음</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </SignupLayout>
  )
}
