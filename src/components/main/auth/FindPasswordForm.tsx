'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import { authService } from '@/services/auth'
import logoImage from '@/assets/images/main/logo.jpg'

type Step = 'request' | 'verify' | 'success'

export default function FindPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('request')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [otpTimeLeft, setOtpTimeLeft] = useState(0)
  const [formData, setFormData] = useState({
    accountId: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  useEffect(() => {
    if (step !== 'verify' || otpTimeLeft <= 0) return
    const timer = window.setInterval(() => {
      setOtpTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [step, otpTimeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }
    return null
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountId.trim()) {
      setError('아이디를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.requestUserPasswordReset(formData.accountId.trim())
      setOtpToken(response.token)
      setOtpTimeLeft(response.expiresInSecond)
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : '초기화 신청에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp.trim()) {
      setError('OTP 인증번호를 입력해 주세요.')
      return
    }
    if (otpTimeLeft <= 0) {
      setError('OTP 유효 시간이 만료되었습니다. 초기화 신청을 다시 진행해 주세요.')
      return
    }
    const passwordError = validatePassword(formData.newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (!otpToken) {
      setError('초기화 토큰이 없습니다. 초기화 신청을 다시 진행해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await authService.completeUserPasswordReset({
        token: otpToken,
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      })
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const header = (
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
  )

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-8">
          <div className="space-y-6 w-full max-w-md mx-auto">
            {header}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 변경 완료</h2>
                <p className="text-gray-600">새 비밀번호가 설정되었습니다.</p>
              </div>
              <Button
                onClick={() => router.push('/login')}
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
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8">
        <div className="space-y-6 w-full max-w-md mx-auto">
          {header}

          <div className="text-center space-y-3">
            <p className="text-[#898989] font-pretendard text-[15px]">
              비밀번호 변경을 위해 아이디를 입력해 주세요
            </p>
            <p className="text-[#898989] font-pretendard text-[15px]">
              해당 아이디에 등록된 휴대전화 번호로 OTP 인증이 진행됩니다.
            </p>
          </div>

          <form
            onSubmit={step === 'request' ? handleRequestReset : handleCompleteReset}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="아이디"
              value={formData.accountId}
              onChange={e => handleInputChange('accountId', e.target.value)}
              readOnly={step === 'verify'}
              className={`w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors ${
                step === 'verify' ? 'bg-gray-50 text-gray-600' : ''
              }`}
            />

            {step === 'verify' && (
              <>
                <div className="text-xs text-blue-600 font-semibold text-right">
                  남은 시간 {formatTime(otpTimeLeft)}
                </div>
                <input
                  type="text"
                  placeholder="OTP 6자리"
                  value={formData.otp}
                  onChange={e => handleInputChange('otp', e.target.value)}
                  className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
                    value={formData.newPassword}
                    onChange={e => handleInputChange('newPassword', e.target.value)}
                    className="w-full h-[60px] px-4 pr-12 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full h-[60px] px-4 pr-12 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-kma-red text-center font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              tone="primary"
              size="lg"
              full
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {step === 'request'
                ? isLoading
                  ? '신청 중...'
                  : '비밀번호 변경'
                : isLoading
                  ? '변경 중...'
                  : '비밀번호 변경 완료'}
            </Button>

            {step === 'verify' && (
              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setOtpToken('')
                  setOtpTimeLeft(0)
                  setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }))
                  setError(null)
                }}
                className="w-full text-sm text-gray-600 hover:text-kma-blue transition-colors font-medium"
              >
                초기화 신청 다시하기
              </button>
            )}
          </form>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <a href="/find-id" className="text-gray-600 hover:text-kma-blue transition-colors font-medium">
              아이디 찾기
            </a>
            <div className="w-px h-4 bg-gray-300"></div>
            <a href="/signup" className="text-gray-600 hover:text-kma-blue transition-colors font-medium">
              회원가입
            </a>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center space-x-2 text-gray-600 hover:text-kma-blue transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>로그인으로 돌아가기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
