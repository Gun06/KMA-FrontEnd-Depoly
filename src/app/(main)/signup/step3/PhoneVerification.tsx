"use client"

import React, { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PhoneVerificationProps {
  phoneNumber: string
  onVerificationComplete: (isVerified: boolean) => void
  onClose: () => void
}

export default function PhoneVerification({ phoneNumber, onVerificationComplete, onClose }: PhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.')
      return
    }

    try {
      setError('')
      // TODO: 실제 API 호출
      // const response = await fetch('/signup/step3/api/send-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber })
      // })
      
      // 임시로 성공 처리
      setIsCodeSent(true)
      setCountdown(180) // 3분 타이머
      setError('')
    } catch (err) {
      setError('인증번호 발송에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.')
      return
    }

    try {
      setError('')
      // TODO: 실제 API 호출
      // const response = await fetch('/signup/step3/api/verify-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, code: verificationCode })
      // })
      
      // 임시로 성공 처리 (실제로는 API 응답 확인)
      setIsVerified(true)
      onVerificationComplete(true)
      onClose()
      setError('')
    } catch (err) {
      setError('인증번호가 올바르지 않습니다. 다시 확인해주세요.')
    }
  }

  const handleResendCode = () => {
    setVerificationCode('')
    setError('')
    handleSendCode()
  }

  if (isVerified) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Check className="w-5 h-5" />
        <span className="font-medium">인증 완료</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!isCodeSent ? (
        <button
          onClick={handleSendCode}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          휴대폰 인증
        </button>
      ) : (
        <div className="space-y-3">
          {/* 인증번호 입력 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="인증번호 6자리"
              className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
            <button
              onClick={handleVerifyCode}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
            >
              확인
            </button>
          </div>
          
          {/* 타이머 및 재발송 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {countdown > 0 ? (
                <span className="text-red-600">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              ) : (
                <span className="text-gray-500">인증번호 만료</span>
              )}
            </div>
            <button
              onClick={handleResendCode}
              disabled={countdown > 0}
              className={`text-blue-600 hover:text-blue-800 transition-colors ${
                countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              재발송
            </button>
          </div>
        </div>
      )}
      
      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
