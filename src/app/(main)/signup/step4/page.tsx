"use client"

import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import SignupLayout from '@/components/common/SignupLayout'
import InfoModal from '@/app/admin/events/register/components/parts/InfoModal'
import PostalCodeSearch from './PostalCodeSearch'
import { useSignupStore, useSignupActions } from '@/stores'
import { useSignup } from '@/services/auth'
import { extractApiErrorMessage } from '@/utils/errorHandler'
import { isDuplicateUserError as checkDuplicateUserError, isInvalidPhoneVerificationTokenError } from '@/utils/signupErrors'
import { formatSignupValidationErrors } from '@/utils/signupValidation'

const SIGNUP_PROGRESS_MIN_MS = 2000

export default function SignupStep4Page() {
  const router = useRouter()
  const { formData, validation } = useSignupStore()
  const { updateAddress, validateStep, validateAllSteps, setCurrentStep, setLoading, resetStore, invalidatePhoneVerification } = useSignupActions()
  
  // useSignup 훅 사용
  const signupMutation = useSignup()
  
  const [formDataLocal, setFormDataLocal] = useState({
    postalCode: '',
    address: '',
    detailedAddress: ''
  })

  const [showPostalCodeSearch, setShowPostalCodeSearch] = useState(false)
  const [showSignupErrorModal, setShowSignupErrorModal] = useState(false)
  const [signupErrorMessage, setSignupErrorMessage] = useState('')
  const [needsPhoneReVerification, setNeedsPhoneReVerification] = useState(false)
  const [showDuplicateUserGuide, setShowDuplicateUserGuide] = useState(false)
  const [showSignupProgressOverlay, setShowSignupProgressOverlay] = useState(false)
  // isPending 상태 업데이트 전에 클릭이 겹치는 경우(더블클릭 등)를 막기 위한 동기 가드
  const isSubmittingRef = useRef(false)

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
      // 상세주소는 사용자가 직접 입력하도록 항상 비워둔다
      detailedAddress: ''
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

  // 상세주소는 선택 항목이므로, 우편번호와 기본주소만 있어도 진행 가능
  const canProceed = formDataLocal.postalCode && formDataLocal.address
  const isSubmittingSignup = showSignupProgressOverlay

  const handlePrev = () => {
    setCurrentStep(3)
    router.push('/signup/step3')
  }

  const handleSignup = async () => {
    // signupMutation.isPending은 리렌더 이후에야 갱신되므로, 그 사이에 들어오는
    // 두 번째 클릭(더블클릭 등)을 막기 위해 ref로 동기적으로 먼저 잠근다.
    if (isSubmittingRef.current || showSignupProgressOverlay || signupMutation.isPending) {
      return
    }
    if (!validateStep(4)) {
      return
    }

    // 모든 단계 유효성 검사 — 이전 단계 데이터 누락(새로고침 등) 시 step4에서 바로 안내
    if (!validateAllSteps()) {
      const { validation: latestValidation } = useSignupStore.getState()
      setNeedsPhoneReVerification(false)
      setShowDuplicateUserGuide(false)
      setSignupErrorMessage(formatSignupValidationErrors(latestValidation))
      setShowSignupErrorModal(true)
      return
    }

    isSubmittingRef.current = true
    setLoading(true)
    setShowSignupProgressOverlay(true)
    const progressStartedAt = Date.now()
    
    try {
      // 회원가입 데이터 준비
      const email =
        formData.personal.emailLocal && formData.personal.emailDomain
          ? `${formData.personal.emailLocal}@${formData.personal.emailDomain}`
          : ''

      const signupData = {
        account: {
          accountId: formData.account.account,
          accountPassword: formData.account.password
        },
        profile: {
          birth: formData.personal.birthDate.replace(/\./g, '-'), // YYYY.MM.DD -> YYYY-MM-DD
          name: formData.personal.name,
          phNum: `${formData.personal.phonePrefix}-${formData.personal.phoneMiddle}-${formData.personal.phoneLast}`,
          email, // 선택 이메일 조합 (없으면 빈 문자열)
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
          address: formData.address.address, // address 필드 추가
          zipCode: formData.address.postalCode,
          addressDetail: formData.address.addressDetail
        },
        irreversibleConfirmed: formData.terms.irreversibleConfirmed, // 최상위 레벨로 이동
        ...(formData.personal.phNumValidateToken && {
          phNumValidateToken: formData.personal.phNumValidateToken
        })
      }


      // useSignup 훅을 사용하여 회원가입 요청
      await signupMutation.mutateAsync(signupData)

      const remainingMs = SIGNUP_PROGRESS_MIN_MS - (Date.now() - progressStartedAt)
      if (remainingMs > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, remainingMs))
      }

      // 성공 시 store 초기화하고 success 페이지로 이동
      resetStore()
      router.push('/signup/success')
      
    } catch (err) {
      setShowSignupProgressOverlay(false)
      const isPhoneTokenInvalid = isInvalidPhoneVerificationTokenError(err)
      if (isPhoneTokenInvalid) {
        invalidatePhoneVerification()
      }
      setNeedsPhoneReVerification(isPhoneTokenInvalid)
      setShowDuplicateUserGuide(checkDuplicateUserError(err))
      setSignupErrorMessage(extractApiErrorMessage(err))
      setShowSignupErrorModal(true)
    } finally {
      isSubmittingRef.current = false
      setLoading(false)
    }
  }

  const handleSignupErrorModalClose = () => {
    setShowSignupErrorModal(false)
    if (needsPhoneReVerification) {
      setCurrentStep(3)
      router.push('/signup/step3')
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
          disabled={!canProceed || isSubmittingSignup}
          className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            !canProceed || isSubmittingSignup
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmittingSignup ? '회원가입 중...' : '회원가입'}
        </button>
      </div>
      {/* 회원가입 진행 중 오버레이 */}
      {isSubmittingSignup && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 sm:px-10 sm:py-8 flex flex-col items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center animate-pulse">
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-bounce" />
              </div>
            </div>
            <p className="text-sm sm:text-base font-semibold text-gray-900">
              회원가입을 진행하고 있습니다.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              달리는 전마협과 함께 정보를 저장 중이에요. 잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      )}

      <InfoModal
        isOpen={showSignupErrorModal}
        onClose={handleSignupErrorModalClose}
        type="error"
        title="회원가입을 진행할 수 없습니다"
        message={
          needsPhoneReVerification
            ? `${signupErrorMessage}\n전화번호 인증을 다시 진행해주세요.`
            : showDuplicateUserGuide
              ? `${signupErrorMessage}\n아이디·비밀번호를 잊으셨다면 아이디 찾기 또는 비밀번호 찾기를 이용해 주세요.`
              : signupErrorMessage
        }
        confirmSize="sm"
        confirmWidthType="compact"
      />
    </SignupLayout>
  )
}
