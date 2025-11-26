'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import { authService } from '@/services/auth'
import logoImage from '@/assets/images/main/logo.jpg'
import { handlePhoneInput } from '@/utils/phoneFormat'

export default function FindIdForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [foundId, setFoundId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [searchMethod, setSearchMethod] = useState<'email' | 'phone'>('email')

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

  const handlePhoneChange = (value: string) => {
    handlePhoneInput(value, (formattedValue) => {
      setFormData(prev => ({ ...prev, phone: formattedValue }))
      
      // 필드별 에러 메시지 초기화
      if (errors.phone) {
        setErrors(prev => ({ ...prev, phone: undefined }))
      }
      // 전역 에러 메시지 초기화
      if (error) {
        setError(null)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    const newErrors: { name?: string; email?: string; phone?: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }
    
    if (searchMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = '이메일을 입력해주세요.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '올바른 이메일 형식을 입력해주세요.'
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = '휴대폰 번호를 입력해주세요.'
      } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(formData.phone)) {
        newErrors.phone = '올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-1234-5678)'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setError(null)

    // 테스트용: 바로 결과 화면 표시
    setTimeout(() => {
      setFoundId('testuser123') // 테스트용 아이디
      setSuccess(true)
      setIsLoading(false)
    }, 1000)

    // 실제 API 호출 코드 (주석 처리)
    /*
    try {
      const response = await authService.findId({
        name: formData.name,
        email: searchMethod === 'email' ? formData.email : undefined,
        phone: searchMethod === 'phone' ? formData.phone : undefined
      })
      
      if (response.id) {
        setFoundId(response.id)
        setSuccess(true)
      } else {
        setError('입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '아이디 찾기에 실패했습니다.'
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
    setFormData({ name: '', email: '', phone: '' })
    setErrors({})
    setError(null)
    setSuccess(false)
    setFoundId('')
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">아이디 찾기 완료</h2>
                  <p className="text-gray-600 mb-4">입력하신 정보로 등록된 아이디를 찾았습니다.</p>
                </div>
                
                {/* 찾은 아이디 표시 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">찾은 아이디</p>
                  <p className="text-xl font-bold text-kma-blue">{foundId}</p>
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
                  <Button
                    onClick={handleReset}
                    tone="neutral"
                    size="lg"
                    full
                  >
                    다시 찾기
                  </Button>
                </div>
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
                아이디를 찾기 위해 회원 정보를 입력해 주세요
              </p>
            </div>

            {/* 검색 방법 선택 */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">검색 방법을 선택해주세요</p>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setSearchMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    searchMethod === 'email'
                      ? 'border-kma-blue bg-blue-50 text-kma-blue'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  이메일로 찾기
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    searchMethod === 'phone'
                      ? 'border-kma-blue bg-blue-50 text-kma-blue'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  휴대폰으로 찾기
                </button>
              </div>
            </div>

            {/* 아이디 찾기 폼 */}
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* 이메일 또는 휴대폰 입력 필드 */}
                {searchMethod === 'email' ? (
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
                ) : (
                  <div>
                    <input
                      type="tel"
                      placeholder="휴대폰 번호 (예: 010-1234-5678)"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                    />
                    {errors.phone && <p className="text-xs text-kma-red mt-1">{errors.phone}</p>}
                  </div>
                )}

                {/* 전역 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-kma-red text-center font-medium">{error}</p>
                  </div>
                )}

                {/* 아이디 찾기 버튼 */}
                <Button
                  type="submit"
                  tone="primary"
                  size="lg"
                  full
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? '찾는 중...' : '아이디 찾기'}
                </Button>
              </form>
            </div>

            {/* 계정 관련 링크 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <a href="/find-password" className="text-gray-600 hover:text-kma-blue transition-colors font-medium">
                  비밀번호 찾기
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
