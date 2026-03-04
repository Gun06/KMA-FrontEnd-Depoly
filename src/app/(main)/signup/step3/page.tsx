"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import DatePicker from './DatePicker'
import { useSignupStore, useSignupActions } from '@/stores'
import PhoneOtpModal from '@/components/signup/PhoneOtpModal'
import { authService } from '@/services/auth'

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
  
  // 전화번호 인증 관련 상태
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isReissuingOtp, setIsReissuingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const [pendingPhNumValidateToken, setPendingPhNumValidateToken] = useState<string | null>(null)

  // store의 데이터로 초기화
  useEffect(() => {
    if (formData.personal) {
      setFormDataLocal({
        name: formData.personal.name || '',
        birthDate: formData.personal.birthDate || '',
        gender: formData.personal.gender || '',
        emailLocal: formData.personal.emailLocal || '',
        emailDomain: formData.personal.emailDomain || '',
        phonePrefix: formData.personal.phonePrefix !== undefined ? formData.personal.phonePrefix : '010',
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
    if (field === 'phonePrefix' || field === 'phoneMiddle' || field === 'phoneLast') {
      newValue = value.replace(/[^0-9]/g, '')
    }
    
    const newFormData = { ...formDataLocal, [field]: newValue }
    setFormDataLocal(newFormData)
    
    // store에 업데이트 (빈 값도 허용)
    updatePersonal({
      name: newFormData.name,
      birthDate: newFormData.birthDate,
      gender: newFormData.gender,
      emailLocal: newFormData.emailLocal,
      emailDomain: newFormData.emailDomain,
      phonePrefix: newFormData.phonePrefix, // 빈 값도 허용
      phoneMiddle: newFormData.phoneMiddle,
      phoneLast: newFormData.phoneLast,
      isCustomDomain: isCustomDomain
    })
  }


  // 도메인 선택 시 직접 입력 모드 해제
  const handleDomainSelection = (domain: string) => {
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

  // 전화번호 인증 완료 여부 확인
  const isPhoneVerified = formData.personal?.phNumValidateToken ? true : false
  const genderError = validation.step3.errors.includes('성별을 선택해주세요.')

  // 전화번호 인증 완료 필수 (이메일은 선택)
  const canProceed = formDataLocal.name && formDataLocal.birthDate && formDataLocal.gender && 
                    formDataLocal.phoneMiddle && formDataLocal.phoneLast &&
                    isPhoneVerified

  const handleNext = () => {
    // 필수 필드 검증 (이메일 제외)
    if (!formDataLocal.name || !formDataLocal.birthDate || !formDataLocal.gender || 
        !formDataLocal.phoneMiddle || !formDataLocal.phoneLast) {
      return
    }
    
    // 전화번호 인증 완료 확인
    if (!isPhoneVerified) {
      alert('전화번호 인증을 완료해주세요.')
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

  // 전화번호 인증 버튼 클릭
  const handlePhoneVerificationClick = () => {
    // 전화번호 입력 확인
    const phNum = getPhoneNumber()
    if (!phNum) {
      alert('전화번호를 모두 입력해주세요.')
      return
    }
    setShowPhoneOtpModal(true)
  }

  // 전화번호 조합 함수
  const getPhoneNumber = (): string | null => {
    if (!formDataLocal.phonePrefix || !formDataLocal.phoneMiddle || !formDataLocal.phoneLast) {
      return null
    }
    return `${formDataLocal.phonePrefix}-${formDataLocal.phoneMiddle}-${formDataLocal.phoneLast}`
  }

  // OTP 발급 요청
  const handleRequestOtp = async () => {
    const phNum = getPhoneNumber()

    if (!phNum) {
      throw new Error('전화번호를 모두 입력해주세요.')
    }

    setIsRequestingOtp(true)
    try {
      const result = await authService.requestSignupPhoneOtp(phNum)
      setOtpToken(result.token)
    } finally {
      setIsRequestingOtp(false)
    }
  }

  // OTP 재발급
  const handleReissueOtp = async () => {
    if (!otpToken) {
      throw new Error('전화번호 인증 토큰이 없습니다.')
    }

    const phNum = getPhoneNumber()
    if (!phNum) {
      throw new Error('전화번호를 모두 입력해주세요.')
    }

    setIsReissuingOtp(true)
    try {
      const result = await authService.reissueSignupPhoneOtp(otpToken, phNum)
      setOtpToken(result.token)
    } finally {
      setIsReissuingOtp(false)
    }
  }

  // OTP 인증 및 토큰 발급
  const handleVerifyOtp = async (otp: string) => {
    if (!otpToken) {
      throw new Error('전화번호 인증 토큰이 없습니다.')
    }

    const phNum = getPhoneNumber()
    if (!phNum) {
      throw new Error('전화번호를 모두 입력해주세요.')
    }

    setIsVerifyingOtp(true)
    try {
      const phNumValidateToken = await authService.verifySignupPhoneOtp(otpToken, phNum, otp)
      
      // 확인 버튼을 눌러야 store에 저장되도록 임시 저장
      setPendingPhNumValidateToken(phNumValidateToken)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // 인증 완료 확인 버튼 클릭 핸들러
  const handleConfirmVerification = () => {
    if (pendingPhNumValidateToken) {
      // Store에 토큰 저장 및 인증 완료 상태 업데이트
      updatePersonal({
        phNumValidateToken: pendingPhNumValidateToken,
        isPhoneVerified: true
      })
      setPendingPhNumValidateToken(null)
    }
    setShowPhoneOtpModal(false)
    setOtpToken(null)
    sessionStorage.removeItem('signupOtpTimer')
    sessionStorage.removeItem('signupOtpTimerStart')
    sessionStorage.removeItem('signupOtpReissueCount')
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
            생년월일 <span className="text-red-500">*</span>
          </label>
          <div className="max-w-md">
            <DatePicker
              value={formDataLocal.birthDate}
              onChange={(value) => handleInputChange('birthDate', value)}
              placeholder="YYYY.MM.DD"
            />
          </div>
        </div>

        {/* 성별 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            성별 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('gender', 'male')}
              className={`h-12 sm:h-14 rounded-xl border text-sm sm:text-base font-medium transition-colors ${
                formDataLocal.gender === 'male'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              남성
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('gender', 'female')}
              className={`h-12 sm:h-14 rounded-xl border text-sm sm:text-base font-medium transition-colors ${
                formDataLocal.gender === 'female'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              여성
            </button>
          </div>
          {genderError && (
            <p className="text-xs text-red-500 mt-1">성별을 선택해주세요.</p>
          )}
        </div>

        {/* 이메일 입력 (선택) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이메일 <span className="text-gray-400 text-xs">(선택)</span>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formDataLocal.emailLocal}
                onChange={(e) => handleInputChange('emailLocal', e.target.value)}
                placeholder="이메일 입력"
                className="flex-1 min-w-0 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <span className="text-gray-500 text-lg font-medium">@</span>
              <div className="relative email-domain-dropdown flex-[1.2] min-w-0">
                <div className="flex gap-2">
                  <input
                    ref={domainInputRef}
                    type="text"
                    name="emailDomain"
                    value={formDataLocal.emailDomain}
                    onChange={(e) => handleInputChange('emailDomain', e.target.value)}
                    placeholder={isCustomDomain ? '직접 입력' : '도메인을 선택하세요'}
                    disabled={!isCustomDomain}
                    className={`flex-1 min-w-0 px-3 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 ${
                      isCustomDomain
                        ? 'border-blue-300 bg-blue-50 cursor-text shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailDomainDropdown(!showEmailDomainDropdown)}
                    className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <span className="text-xs sm:text-sm">선택</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  </button>
                </div>

                {showEmailDomainDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'hotmail.com', 'outlook.com', 'yahoo.com'].map(
                      (domain) => (
                        <button
                          key={domain}
                          onClick={() => handleDomainSelection(domain)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                            formDataLocal.emailDomain === domain
                              ? 'bg-blue-100 text-blue-600 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {domain}
                        </button>
                      ),
                    )}
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
            <p className="text-xs text-gray-500">
              선택 항목입니다. 연락받을 이메일이 있다면 입력해 주세요.
            </p>
          </div>
        </div>

        {/* 전화번호 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formDataLocal.phonePrefix}
                onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                placeholder="010"
                maxLength={3}
                inputMode="numeric"
                readOnly={isPhoneVerified}
                className={`w-20 sm:w-24 px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base ${
                  isPhoneVerified ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={formDataLocal.phoneMiddle}
                onChange={(e) => handleInputChange('phoneMiddle', e.target.value)}
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
                readOnly={isPhoneVerified}
                className={`w-20 sm:w-24 px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base ${
                  isPhoneVerified ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={formDataLocal.phoneLast}
                onChange={(e) => handleInputChange('phoneLast', e.target.value)}
                placeholder="5678"
                maxLength={4}
                inputMode="numeric"
                readOnly={isPhoneVerified}
                className={`w-20 sm:w-24 px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base ${
                  isPhoneVerified ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            
            {/* 전화번호 인증 버튼 */}
            <button
              type="button"
              onClick={handlePhoneVerificationClick}
              disabled={!getPhoneNumber() || isPhoneVerified}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center whitespace-nowrap text-sm sm:text-base ${
                isPhoneVerified 
                  ? 'bg-gray-300 text-gray-700 cursor-default' 
                  : (!formDataLocal.phoneMiddle || !formDataLocal.phoneLast)
                  ? 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPhoneVerified ? '인증 완료' : '전화번호 인증 >'}
            </button>
          </div>
          
          {/* 전화번호 인증 완료 표시 */}
          {isPhoneVerified && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ 전화번호 인증이 완료되었습니다.
              </p>
            </div>
          )}
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

      {/* 전화번호 인증 OTP 모달 */}
      <PhoneOtpModal
        isOpen={showPhoneOtpModal}
        onClose={() => {
          setShowPhoneOtpModal(false)
          setOtpToken(null)
          setPendingPhNumValidateToken(null)
          sessionStorage.removeItem('signupOtpTimer')
          sessionStorage.removeItem('signupOtpTimerStart')
          sessionStorage.removeItem('signupOtpReissueCount')
        }}
        onRequestOtp={handleRequestOtp}
        onReissue={handleReissueOtp}
        onSubmit={handleVerifyOtp}
        onConfirm={handleConfirmVerification}
        isLoading={isVerifyingOtp}
        isReissuing={isReissuingOtp}
        isRequesting={isRequestingOtp}
        phoneNumber={getPhoneNumber() || ''}
      />
    </SignupLayout>
  )
}
