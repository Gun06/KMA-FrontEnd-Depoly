'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import { authService } from '@/services/auth'
import logoImage from '@/assets/images/main/logo.jpg'

export default function FindPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'find' | 'reset'>('find')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{ 
    accountId?: string; 
    name?: string; 
    email?: string; 
    newPassword?: string; 
    confirmPassword?: string 
  }>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 메시지 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 전역 에러 메시지 초기화
    if (error) {
      setError(null)
    }
  }

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.'
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }
    return undefined
  }

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    const newErrors: { accountId?: string; name?: string; email?: string } = {}
    
    if (!formData.accountId.trim()) {
      newErrors.accountId = '아이디를 입력해주세요.'
    }
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setError(null)

    // 테스트용: 바로 비밀번호 재설정 단계로 이동
    setTimeout(() => {
      setStep('reset')
      setIsLoading(false)
    }, 1000)

    // 실제 API 호출 코드 (주석 처리)
    /*
    try {
      const response = await authService.findPassword({
        accountId: formData.accountId,
        name: formData.name,
        email: formData.email
      })
      
      if (response.success) {
        setStep('reset')
      } else {
        setError(response.message || '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 찾기에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
    */
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    const newErrors: { newPassword?: string; confirmPassword?: string } = {}
    
    const passwordError = validatePassword(formData.newPassword)
    if (passwordError) {
      newErrors.newPassword = passwordError
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setError(null)

    // 테스트용: 바로 성공 화면 표시
    setTimeout(() => {
      setSuccess(true)
      setIsLoading(false)
    }, 1000)

    // 실제 API 호출 코드 (주석 처리)
    /*
    try {
      const response = await authService.resetPassword({
        accountId: formData.accountId,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
    */
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleReset = () => {
    setFormData({ accountId: '', name: '', email: '', newPassword: '', confirmPassword: '' })
    setErrors({})
    setError(null)
    setSuccess(false)
    setStep('find')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="p-8">
            <div className="space-y-6 w-full max-w-md mx-auto">
              {/* 헤더 섹션 */}
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center space-x-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                    <Image
                      src={logoImage}
                      alt="전국마라톤협회 로고"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h1 className="text-4xl font-giants text-kma-black mb-2 leading-none">전/마/협</h1>
                    <p className="text-2xl text-[#999999] font-pretendard">전국마라톤협회</p>
                  </div>
                </div>
              </div>

              {/* 성공 메시지 */}
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 재설정 완료</h2>
                  <p className="text-gray-600 mb-4">새로운 비밀번호로 재설정이 완료되었습니다.</p>
                </div>

                {/* 버튼들 */}
                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    tone="primary"
                    size="lg"
                    full
                    className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 shadow-lg"
                  >
                    로그인하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="p-8">
            <div className="space-y-6 w-full max-w-md mx-auto">
              {/* 헤더 섹션 */}
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center space-x-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                    <Image
                      src={logoImage}
                      alt="전국마라톤협회 로고"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h1 className="text-4xl font-giants text-kma-black mb-2 leading-none">전/마/협</h1>
                    <p className="text-2xl text-[#999999] font-pretendard">전국마라톤협회</p>
                  </div>
                </div>
                <p className="text-[#898989] font-pretendard text-[15px]">
                  새로운 비밀번호를 입력해 주세요
                </p>
              </div>

              {/* 비밀번호 재설정 폼 */}
              <div className="mt-6">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* 새 비밀번호 입력 필드 */}
                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full h-[60px] px-4 pr-12 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-kma-red mt-1">{errors.newPassword}</p>}
                  </div>

                  {/* 비밀번호 확인 입력 필드 */}
                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="비밀번호 확인"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full h-[60px] px-4 pr-12 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-kma-red mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* 전역 에러 메시지 */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-kma-red text-center font-medium">{error}</p>
                    </div>
                  )}

                  {/* 비밀번호 재설정 버튼 */}
                  <Button
                    type="submit"
                    tone="primary"
                    size="lg"
                    full
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? '재설정 중...' : '비밀번호 재설정'}
                  </Button>
                </form>
              </div>

              {/* 뒤로가기 버튼 */}
              <div className="flex justify-center">
                <button
                  onClick={() => setStep('find')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계로 돌아가기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="p-8">
          <div className="space-y-6 w-full max-w-md mx-auto">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center space-x-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                  <Image
                    src={logoImage}
                    alt="전국마라톤협회 로고"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-giants text-kma-black mb-2 leading-none">전/마/협</h1>
                  <p className="text-2xl text-[#999999] font-pretendard">전국마라톤협회</p>
                </div>
              </div>
              <p className="text-[#898989] font-pretendard text-[15px]">
                비밀번호를 재설정하기 위해 회원 정보를 입력해 주세요
              </p>
            </div>

            {/* 비밀번호 찾기 폼 */}
            <div className="mt-6">
              <form onSubmit={handleFindPassword} className="space-y-4">
                {/* 아이디 입력 필드 */}
                <div>
                  <input
                    type="text"
                    placeholder="아이디"
                    value={formData.accountId}
                    onChange={(e) => handleInputChange('accountId', e.target.value)}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  {errors.accountId && <p className="text-xs text-kma-red mt-1">{errors.accountId}</p>}
                </div>

                {/* 이름 입력 필드 */}
                <div>
                  <input
                    type="text"
                    placeholder="이름"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  {errors.name && <p className="text-xs text-kma-red mt-1">{errors.name}</p>}
                </div>

                {/* 이메일 입력 필드 */}
                <div>
                  <input
                    type="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  {errors.email && <p className="text-xs text-kma-red mt-1">{errors.email}</p>}
                </div>

                {/* 전역 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-kma-red text-center font-medium">{error}</p>
                  </div>
                )}

                {/* 비밀번호 찾기 버튼 */}
                <Button
                  type="submit"
                  tone="primary"
                  size="lg"
                  full
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? '확인 중...' : '비밀번호 찾기'}
                </Button>
              </form>
            </div>

            {/* 계정 관련 링크 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <a href="/find-id" className="text-gray-600 hover:text-kma-blue transition-colors font-medium">
                  아이디 찾기
                </a>
                <div className="w-px h-4 bg-gray-300"></div>
                <a href="/signup" className="text-gray-600 hover:text-kma-blue transition-colors font-medium">
                  회원가입
                </a>
              </div>

              {/* 뒤로가기 버튼 */}
              <div className="flex justify-center">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center space-x-2 text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>로그인으로 돌아가기</span>
                </button>
              </div>
            </div>

            {/* 푸터 섹션 */}
            <div className="text-center space-y-3 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#AEAEB2] font-medium">
                © 2025. RUN1080. All Right Reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <a href="/" className="text-[#AEAEB2] hover:text-kma-blue transition-colors font-medium">
                  전국 마라톤 협회 공식 사이트
                </a>
                <div className="w-px h-3 bg-gray-300"></div>
                <a href="/privacy" className="text-[#AEAEB2] hover:text-kma-blue transition-colors font-medium">
                  개인정보처리방침
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
