"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Eye, EyeOff, ChevronRight, Check, X } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import { useSignupStore, useSignupActions } from '@/stores'

export default function SignupStep2Page() {
  const router = useRouter()
  const { formData, validation, accountDuplicateCheck } = useSignupStore()
  const { updateAccount, validateStep, setCurrentStep, checkAccountDuplicate, resetAccountDuplicateCheck } = useSignupActions()
  
  const [formDataLocal, setFormDataLocal] = useState({
    id: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('')

  // 비밀번호 조건 상태
  const [passwordConditions, setPasswordConditions] = useState({
    hasLength: false,      // 10~64자
    hasLowerCase: false,   // 소문자 포함
    hasNumber: false,      // 숫자 포함
    hasSpecial: false,     // 특수문자 포함
    noSpace: true          // 공백 없음
  })

  // store의 데이터로 초기화
  useEffect(() => {
    if (formData.account) {
      setFormDataLocal({
        id: formData.account.account || '',
        password: formData.account.password || '',
        confirmPassword: formData.account.passwordConfirm || ''
      })
    }
  }, [formData.account])

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formDataLocal, [field]: value }
    setFormDataLocal(newFormData)
    
    // store에 업데이트
    updateAccount({
      account: newFormData.id,
      password: newFormData.password,
      passwordConfirm: newFormData.confirmPassword
    })
    
    if (field === 'id') {
      // ID 변경 시 중복검사 결과 초기화
      resetAccountDuplicateCheck()
      validateIdFormat(value)
    } else if (field === 'password') {
      validatePassword(value)
      setConfirmPasswordMessage('')
    } else if (field === 'confirmPassword') {
      validateConfirmPassword(value)
    }
  }

  const validateIdFormat = (id: string) => {
    if (!id) {
      return
    }
    
    // 영문과 숫자가 모두 포함되어야 함
    const hasLetter = /[a-zA-Z]/.test(id)
    const hasNumber = /\d/.test(id)
    const isValidLength = id.length >= 4 && id.length <= 15
    const isValidChars = /^[a-zA-Z0-9]+$/.test(id)
    
    if (!isValidLength) {
      // 길이 검증 실패 시 중복검사 버튼 비활성화
      return
    } else if (!isValidChars) {
      // 문자 검증 실패 시 중복검사 버튼 비활성화
      return
    } else if (!hasLetter || !hasNumber) {
      // 영문/숫자 포함 검증 실패 시 중복검사 버튼 비활성화
      return
    }
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordConditions({
        hasLength: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false,
        noSpace: true
      })
      return
    }

    // 백엔드 로직과 동일한 정규식 패턴 (대문자 제외)
    const conditions = {
      hasLength: password.length >= 10 && password.length <= 64,
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[~!@#$%^&*()+\-={}\[\]\\|:;"'<>,.?/]/.test(password),
      noSpace: !/\s/.test(password)
    }

    setPasswordConditions(conditions)
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordMessage('')
      return
    }

    if (confirmPassword === formDataLocal.password) {
      setConfirmPasswordMessage('✓ 비밀번호가 일치합니다.')
    } else {
      setConfirmPasswordMessage('✗ 비밀번호가 일치하지 않습니다.')
    }
  }

  const handleIdCheck = async () => {
    if (!formDataLocal.id) {
      return
    }

    try {
      await checkAccountDuplicate(formDataLocal.id)
    } catch (error) {
      console.error('아이디 중복 검사 실패:', error)
    }
  }

  // 아이디 형식이 유효한지 확인
  const isIdFormatValid = () => {
    const id = formDataLocal.id
    if (!id) return false
    
    const hasLetter = /[a-zA-Z]/.test(id)
    const hasNumber = /\d/.test(id)
    const isValidLength = id.length >= 4 && id.length <= 15
    const isValidChars = /^[a-zA-Z0-9]+$/.test(id)
    
    return isValidLength && isValidChars && hasLetter && hasNumber
  }

  // 비밀번호가 모든 조건을 만족하는지 확인
  const isPasswordValid = () => {
    return Object.values(passwordConditions).every(condition => condition === true)
  }

  // 다음 단계로 진행 가능한지 확인
  const canProceed = formDataLocal.id && formDataLocal.password && formDataLocal.confirmPassword && 
                    formDataLocal.password === formDataLocal.confirmPassword && 
                    isPasswordValid() &&
                    accountDuplicateCheck.isChecked && !accountDuplicateCheck.isDuplicate

  const handleNext = () => {
    if (validateStep(2)) {
      setCurrentStep(3)
      router.push('/signup/step3')
    }
  }

  const handlePrev = () => {
    setCurrentStep(1)
    router.push('/signup/step1')
  }

  return (
    <SignupLayout currentStep={2}>
      {/* 개인정보 입력 폼 */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">개인정보 입력</h2>
        
        {/* 아이디 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            아이디 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={formDataLocal.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              placeholder="영문/숫자 조합으로 4자~15자 이내"
              autoComplete="off"
              className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleIdCheck}
              disabled={!isIdFormatValid() || accountDuplicateCheck.isLoading}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm sm:text-base ${
                isIdFormatValid() && !accountDuplicateCheck.isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {accountDuplicateCheck.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>검사중...</span>
                </>
              ) : (
                <>
                  <span>중복검사</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </div>
                    
          {/* 중복검사 결과 메시지 */}
          {accountDuplicateCheck.message && (
            <p className={`text-sm ${
              accountDuplicateCheck.isDuplicate ? 'text-red-600' : 'text-green-600'
            }`}>
              {accountDuplicateCheck.message}
            </p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formDataLocal.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="new-password"
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* 비밀번호 조건 표시 */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className={`flex items-center space-x-2 text-sm ${
                passwordConditions.hasLength ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordConditions.hasLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>10~64자</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                passwordConditions.hasLowerCase ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordConditions.hasLowerCase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>소문자 포함</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                passwordConditions.hasNumber ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordConditions.hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>숫자 포함</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                passwordConditions.hasSpecial ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordConditions.hasSpecial ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>특수문자 포함</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                passwordConditions.noSpace ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordConditions.noSpace ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>공백 없음</span>
              </div>
            </div>
            
            {/* 전체 비밀번호 상태 메시지 */}
            {formDataLocal.password && (
              <p className={`text-sm font-medium ${
                isPasswordValid() ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPasswordValid() 
                  ? '✓ 모든 조건을 만족하는 안전한 비밀번호입니다.' 
                  : '✗ 위의 모든 조건을 만족해야 합니다.'
                }
              </p>
            )}
          </div>
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formDataLocal.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="비밀번호를 다시 입력해 주세요"
              autoComplete="new-password"
              disabled={!formDataLocal.password || !isPasswordValid()}
              className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-sm sm:text-base ${
                !formDataLocal.password || !isPasswordValid()
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={!formDataLocal.password || !isPasswordValid()}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                !formDataLocal.password || !isPasswordValid()
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPasswordMessage && (
            <p className={`text-sm ${
              confirmPasswordMessage.includes('✓') ? 'text-green-600' : 'text-red-600'
            }`}>
              {confirmPasswordMessage}
            </p>
          )}
        </div>

        {/* 유효성 검사 에러 메시지 */}
        {validation.step2.errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            {validation.step2.errors.map((error, index) => (
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
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </SignupLayout>
  )
}

