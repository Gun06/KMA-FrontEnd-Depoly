'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import { authService } from '@/services/auth'
import logoImage from '@/assets/images/main/logo.jpg'
import { handlePhoneInput } from '@/utils/phoneFormat'

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined
  if ('code' in error && typeof error.code === 'string') return error.code
  if ('data' in error && error.data && typeof error.data === 'object' && 'code' in error.data) {
    const code = (error.data as { code?: unknown }).code
    if (typeof code === 'string') return code
  }
  return undefined
}

const getReadableFindIdError = (error: unknown, fallback: string): string => {
  const code = getErrorCode(error)
  if (code === 'NOT_FOUND') {
    return '유효하지 않거나 만료된 인증번호입니다. OTP 재전송 후 다시 시도해 주세요.'
  }
  if (code === 'INVALID_OTP' || code === 'OTP_MISMATCH') {
    return '인증번호가 일치하지 않습니다. 다시 확인해 주세요.'
  }
  if (code === 'EXPIRED_OTP') {
    return '인증번호 유효시간이 만료되었습니다. OTP를 재전송해 주세요.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export default function FindIdForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [isOtpReissuing, setIsOtpReissuing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successType, setSuccessType] = useState<'id' | null>(null)
  const [foundId, setFoundId] = useState<string>('')
  const [otpToken, setOtpToken] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpNumber, setOtpNumber] = useState('')
  const [otpExpiresInSecond, setOtpExpiresInSecond] = useState(0)
  const [otpTimeLeft, setOtpTimeLeft] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    phone: ''
  })
  const [errors, setErrors] = useState<{ name?: string; birth?: string; phone?: string }>({})

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

  const handleBirthChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
    }
    handleInputChange('birth', formatted)
  }

  useEffect(() => {
    if (otpTimeLeft <= 0) return
    const timer = window.setInterval(() => {
      setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [otpTimeLeft])

  const formatOtpTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    const newErrors: { name?: string; birth?: string; phone?: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }

    if (!formData.birth.trim()) {
      newErrors.birth = '생년월일을 입력해주세요.'
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birth)) {
      newErrors.birth = '생년월일 형식이 올바르지 않습니다. (예: 1990-01-01)'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.'
    } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-1234-5678)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.findId({
        name: formData.name.trim(),
        birth: formData.birth,
        phNum: formData.phone
      })

      if (response.id) {
        setFoundId(response.id)
        setSuccessType('id')
      } else if (response.token) {
        const expireSeconds =
          typeof response.otpExpiresInSecond === 'number' ? response.otpExpiresInSecond : 180
        setOtpToken(response.token)
        setOtpPhone(formData.phone)
        setOtpNumber('')
        setOtpExpiresInSecond(expireSeconds)
        setOtpTimeLeft(expireSeconds)
      } else {
        setError('입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.')
      }
    } catch (err) {
      const errorMessage = getReadableFindIdError(err, '아이디 찾기에 실패했습니다.')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleReset = () => {
    setFormData({ name: '', birth: '', phone: '' })
    setErrors({})
    setError(null)
    setSuccessType(null)
    setFoundId('')
    setOtpToken('')
    setOtpPhone('')
    setOtpNumber('')
    setOtpExpiresInSecond(0)
    setOtpTimeLeft(0)
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpToken) return
    if (!otpNumber.trim()) {
      setError('OTP 인증번호를 입력해 주세요.')
      return
    }
    if (otpTimeLeft <= 0) {
      setError('OTP 유효 시간이 만료되었습니다. OTP 재전송을 진행해 주세요.')
      return
    }

    setIsOtpVerifying(true)
    setError(null)
    try {
      const response = await authService.verifyFindIdOtp({
        token: otpToken,
        otp: otpNumber.trim(),
        phNum: otpPhone,
      })
      setFoundId(response.id)
      setSuccessType('id')
      setOtpToken('')
      setOtpPhone('')
      setOtpNumber('')
      setOtpExpiresInSecond(0)
      setOtpTimeLeft(0)
    } catch (err) {
      const errorMessage = getReadableFindIdError(err, 'OTP 인증에 실패했습니다.')
      setError(errorMessage)
    } finally {
      setIsOtpVerifying(false)
    }
  }

  const handleOtpReissue = async () => {
    if (!otpToken || !otpPhone) return
    setIsOtpReissuing(true)
    setError(null)
    try {
      const response = await authService.reissueFindIdOtp({
        token: otpToken,
        phNum: otpPhone,
      })
      setOtpToken(response.token)
      setOtpExpiresInSecond(response.otpExpiresInSecond)
      setOtpTimeLeft(response.otpExpiresInSecond)
      setOtpNumber('')
    } catch (err) {
      const errorMessage = getReadableFindIdError(err, 'OTP 재전송에 실패했습니다.')
      setError(errorMessage)
    } finally {
      setIsOtpReissuing(false)
    }
  }

  if (successType) {
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
                  <p className="text-gray-600 mb-4">
                    {successType === 'id'
                      ? '입력하신 정보로 등록된 아이디를 찾았습니다.'
                      : '요청이 접수되었습니다. 등록된 휴대폰 번호로 인증이 진행됩니다.'}
                  </p>
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

  if (otpToken) {
    return (
      <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="p-8">
            <div className="space-y-6 w-full max-w-md mx-auto">
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
                  등록된 휴대폰 번호로 OTP가 발송되었습니다
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 text-center">
                  <p>인증 번호 대상: {otpPhone}</p>
                  <p className="mt-1 font-semibold text-kma-blue">
                    남은 시간: {formatOtpTime(otpTimeLeft)}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="OTP 6자리를 입력해 주세요"
                    value={otpNumber}
                    onChange={(e) => setOtpNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-kma-red text-center font-medium">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    tone="neutral"
                    size="lg"
                    full
                    disabled={isOtpReissuing || isOtpVerifying}
                    onClick={() => void handleOtpReissue()}
                  >
                    {isOtpReissuing ? '재전송 중...' : 'OTP 재전송'}
                  </Button>
                  <Button
                    type="submit"
                    tone="primary"
                    size="lg"
                    full
                    disabled={isOtpVerifying}
                    className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isOtpVerifying ? '확인 중...' : 'OTP 확인'}
                  </Button>
                </div>
              </form>

              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>다시 입력하기</span>
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
                아이디를 찾기 위해 회원 정보를 입력해 주세요
              </p>
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

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="생년월일 (예: 1990-01-01)"
                    value={formData.birth}
                    onChange={(e) => handleBirthChange(e.target.value)}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors text-gray-700"
                  />
                  {errors.birth && <p className="text-xs text-kma-red mt-1">{errors.birth}</p>}
                </div>

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
                  비밀번호 변경
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
