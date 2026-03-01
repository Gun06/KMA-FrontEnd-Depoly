'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Clock3, Eye, EyeOff, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import DatePicker from '@/app/(main)/signup/step3/DatePicker'
import PostalCodeSearch from '@/app/(main)/signup/step4/PostalCodeSearch'
import { userApi } from '@/hooks/api.presets'
import ErrorModal from '@/components/common/Modal/ErrorModal'
import ProfileManageFrame from '../components/ProfileManageFrame'
import { useMyProfile } from '../shared'

interface FormData {
  name: string
  birthDate: string
  gender: '' | 'male' | 'female'
  emailLocal: string
  emailDomain: string
  phonePrefix: string
  phoneMiddle: string
  phoneLast: string
  address: string
  addressDetail: string
  zipCode: string
}

interface ModifyProfileResponse {
  isNeededOtpCertification?: boolean
  neededOtpCertification?: boolean
  checkNeededOtpCertification?: boolean
  successCode?: string
  token?: string
  otpExpiresInSecond?: number
  expiresInSecond?: number
  issueOtpTokenResponse?: {
    token?: string
    expiresInSecond?: number
    otpExpiresInSecond?: number
  }
}

const emailDomains = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
]

const toBirthDisplay = (birth?: string) => (birth ? birth.replace(/-/g, '.') : '')
const toGenderValue = (gender?: string): '' | 'male' | 'female' =>
  gender === 'F' ? 'female' : gender === 'M' ? 'male' : ''
export default function Client() {
  const router = useRouter()
  const { data, isLoading } = useMyProfile()
  const queryClient = useQueryClient()
  const [showPostalCodeSearch, setShowPostalCodeSearch] = useState(false)
  const [showEmailDomainDropdown, setShowEmailDomainDropdown] = useState(false)
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isOtpReissuing, setIsOtpReissuing] = useState(false)
  const [isOtpCommitting, setIsOtpCommitting] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneOtpNumber, setPhoneOtpNumber] = useState('')
  const [phoneOtpInlineError, setPhoneOtpInlineError] = useState('')
  const [phoneOtpInlineSuccess, setPhoneOtpInlineSuccess] = useState('')
  const [otpTimeLeft, setOtpTimeLeft] = useState(0)
  const [originalPhone, setOriginalPhone] = useState('')
  const [pendingOtpInfo, setPendingOtpInfo] = useState<{
    phone: string
    token: string
    expiresInSecond?: number
  } | null>(null)
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
  })
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    gender: '',
    emailLocal: '',
    emailDomain: '',
    phonePrefix: '',
    phoneMiddle: '',
    phoneLast: '',
    address: '',
    addressDetail: '',
    zipCode: '',
  })

  useEffect(() => {
    if (!data) return
    const emailParts = (data.email ?? '').split('@')
    const phoneParts = (data.phNum ?? '').split('-')
    setOriginalPhone(data.phNum ?? '')
    setFormData(prev => ({
      ...prev,
      name: data.name ?? '',
      birthDate: toBirthDisplay(data.birth),
      gender: toGenderValue(data.gender),
      emailLocal: emailParts[0] ?? '',
      emailDomain: emailParts[1] ?? '',
      phonePrefix: phoneParts[0] ?? '',
      phoneMiddle: phoneParts[1] ?? '',
      phoneLast: phoneParts[2] ?? '',
      address: data.address ?? '',
      addressDetail: data.addressDetail ?? '',
      zipCode: data.zipCode ?? '',
    }))
    setIsCustomDomain(Boolean(emailParts[1] && !emailDomains.includes(emailParts[1])))
  }, [data])

  useEffect(() => {
    if (!pendingOtpInfo) {
      setOtpTimeLeft(0)
      return
    }
    const initial = pendingOtpInfo.expiresInSecond ?? 180
    setOtpTimeLeft(initial)
  }, [pendingOtpInfo])

  useEffect(() => {
    if (otpTimeLeft <= 0) return
    const timer = window.setInterval(() => {
      setOtpTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [otpTimeLeft])

  const handleChange =
    (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [key]: e.target.value }))
    }

  const handlePhoneChange =
    (key: 'phonePrefix' | 'phoneMiddle' | 'phoneLast') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '')
      setFormData(prev => ({ ...prev, [key]: value }))
    }

  const restorePhoneToOriginal = () => {
    const phoneParts = (originalPhone ?? '').split('-')
    setFormData(prev => ({
      ...prev,
      phonePrefix: phoneParts[0] ?? '',
      phoneMiddle: phoneParts[1] ?? '',
      phoneLast: phoneParts[2] ?? '',
    }))
  }

  const closePhoneOtpModal = () => {
    if (isOtpCommitting || isOtpReissuing) return
    setPendingOtpInfo(null)
    setPhoneOtpNumber('')
    setPhoneOtpInlineError('')
    setPhoneOtpInlineSuccess('')
    restorePhoneToOriginal()
    setIsPasswordModalOpen(false)
  }

  const executeProfileUpdate = async () => {
    if (!confirmPassword.trim()) {
      setModal({
        isOpen: true,
        title: '입력 확인',
        message: '현재 비밀번호를 입력해 주세요.',
      })
      return
    }
    setIsSaving(true)
    try {
      const nextPhone = `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`
      const isPhoneChanged = nextPhone !== (originalPhone || '')

      const response = await userApi.authPatch<ModifyProfileResponse>('/api/v1/user/modify-profile', {
        patchedProfile: {
          birth: formData.birthDate.replace(/\./g, '-'),
          name: formData.name,
          phNum: nextPhone,
          email: `${formData.emailLocal}@${formData.emailDomain}`,
          gender: formData.gender === 'female' ? 'F' : 'M',
        },
        address: {
          address: formData.address,
          zipCode: formData.zipCode,
          addressDetail: formData.addressDetail,
        },
        previousPassword: confirmPassword,
      })

      const isOtpNeeded =
        response?.isNeededOtpCertification === true ||
        response?.neededOtpCertification === true ||
        response?.checkNeededOtpCertification === true

      if (isOtpNeeded) {
        const issuedToken = response?.issueOtpTokenResponse?.token
        if (!issuedToken) {
          throw new Error('OTP 토큰이 발급되지 않았습니다. 다시 시도해 주세요.')
        }
        const expiresInSecond = response?.issueOtpTokenResponse?.expiresInSecond
        setPendingOtpInfo({
          phone: nextPhone,
          token: issuedToken,
          expiresInSecond,
        })
        setPhoneOtpNumber('')
        setPhoneOtpInlineError('')
        setConfirmPassword('')
      } else {
        setPendingOtpInfo(null)
        if (isPhoneChanged) {
          setOriginalPhone(nextPhone)
        }
        setModal({
          isOpen: true,
          title: '수정 완료',
          message: '회원정보가 수정되었습니다.',
        })
        await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile-info'] })
        setIsPasswordModalOpen(false)
        setConfirmPassword('')
      }
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '회원정보 수정에 실패했습니다.'
      setModal({
        isOpen: true,
        title: '수정 실패',
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    await executeProfileUpdate()
  }

  const handlePhoneOtpReissue = async () => {
    if (!pendingOtpInfo) {
      setModal({
        isOpen: true,
        title: '안내',
        message: '먼저 OTP 인증 요청을 진행해 주세요.',
      })
      return
    }

    setIsOtpReissuing(true)
    setPhoneOtpInlineError('')
    setPhoneOtpInlineSuccess('')
    try {
      const response = await userApi.authPost<ModifyProfileResponse>(
        '/api/v1/user/modify-profile/otp/reissue',
        {
          token: pendingOtpInfo.token,
          phNum: pendingOtpInfo.phone,
        }
      )
      const token =
        response?.token ||
        response?.issueOtpTokenResponse?.token
      if (!token) {
        throw new Error('OTP 재발급 토큰을 받지 못했습니다.')
      }
      const expiresInSecond =
        response?.otpExpiresInSecond ??
        response?.expiresInSecond ??
        response?.issueOtpTokenResponse?.otpExpiresInSecond ??
        response?.issueOtpTokenResponse?.expiresInSecond
      setPendingOtpInfo({
        phone: pendingOtpInfo.phone,
        token,
        expiresInSecond,
      })
      setPhoneOtpNumber('')
      setPhoneOtpInlineError('')
      setPhoneOtpInlineSuccess('OTP가 재발급되었습니다. 수신한 인증번호를 입력해 주세요.')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'OTP 재발급에 실패했습니다.'
      setPhoneOtpInlineError(message)
    } finally {
      setIsOtpReissuing(false)
    }
  }

  const formatOtpTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const commitPhoneOtp = async (payload: {
    token: string
    otpNumber: string
    phNum: string
  }) => {
    await userApi.authPost('/api/v1/user/modify-profile/commit', payload)
  }

  const handlePhoneOtpConfirm = () => {
    if (!pendingOtpInfo) {
      setModal({
        isOpen: true,
        title: '안내',
        message: '먼저 OTP 인증 요청을 진행해 주세요.',
      })
      return
    }
    if (otpTimeLeft <= 0) {
      setModal({
        isOpen: true,
        title: '시간 만료',
        message: 'OTP 유효 시간이 만료되었습니다. OTP 인증 요청을 다시 진행해 주세요.',
      })
      return
    }
    if (!phoneOtpNumber.trim()) {
      setModal({
        isOpen: true,
        title: '입력 확인',
        message: 'OTP 인증번호를 입력해 주세요.',
      })
      return
    }
    void (async () => {
      setIsOtpCommitting(true)
      try {
        await commitPhoneOtp({
          token: pendingOtpInfo.token,
          otpNumber: phoneOtpNumber.trim(),
          phNum: pendingOtpInfo.phone,
        })
        setOriginalPhone(pendingOtpInfo.phone)
        setPendingOtpInfo(null)
        setPhoneOtpNumber('')
        setPhoneOtpInlineError('')
        setPhoneOtpInlineSuccess('')
        setIsPasswordModalOpen(false)
        setModal({
          isOpen: true,
          title: '인증 완료',
          message: 'OTP 인증이 완료되어 전화번호 변경 내역이 적용되었습니다.',
        })
        await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile-info'] })
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'OTP 인증 확인에 실패했습니다.'
        setModal({
          isOpen: true,
          title: '인증 실패',
          message,
        })
      } finally {
        setIsOtpCommitting(false)
      }
    })()
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">회원정보 수정</h3>
        {isLoading ? (
          <div className="mt-5 space-y-6 animate-pulse">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="h-3 w-16 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-[200px] rounded-xl bg-gray-200" />
                </div>
                <div>
                  <div className="h-3 w-16 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-40 rounded-xl bg-gray-200" />
                </div>
              </div>
              <div className="mt-5">
                <div className="h-3 w-20 rounded bg-gray-200 mb-2" />
                <div className="h-11 w-full max-w-sm rounded-xl bg-gray-200" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-4 space-y-5">
                <div>
                  <div className="h-3 w-12 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-full max-w-xl rounded-xl bg-gray-200" />
                </div>
                <div>
                  <div className="h-3 w-14 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-[280px] rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-4 space-y-5">
                <div>
                  <div className="h-3 w-14 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-full max-w-md rounded-xl bg-gray-200" />
                </div>
                <div>
                  <div className="h-3 w-10 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-full max-w-3xl rounded-xl bg-gray-200" />
                </div>
                <div>
                  <div className="h-3 w-16 rounded bg-gray-200 mb-2" />
                  <div className="h-11 w-full max-w-3xl rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="h-4 w-16 rounded bg-gray-200 mb-3" />
              <div className="h-3 w-64 rounded bg-gray-200" />
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-4">기본 정보</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">이름</label>
                  <input className="w-[200px] h-11 px-3 rounded-xl border border-gray-200" value={formData.name} onChange={handleChange('name')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">성별</label>
                  <div className="h-11 p-1 rounded-xl border border-gray-200 bg-white inline-flex items-center gap-1">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))} className={`h-9 px-4 rounded-lg text-sm ${formData.gender === 'male' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>남성</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))} className={`h-9 px-4 rounded-lg text-sm ${formData.gender === 'female' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>여성</button>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-800 mb-2">생년월일</label>
                <DatePicker value={formData.birthDate} onChange={value => setFormData(prev => ({ ...prev, birthDate: value }))} placeholder="YYYY.MM.DD" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-4">연락처 정보</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">이메일</label>
                  <div className="flex items-center gap-2 w-full max-w-xl">
                    <input className="w-[200px] h-11 px-3 rounded-xl border border-gray-200" value={formData.emailLocal} onChange={handleChange('emailLocal')} />
                    <span className="text-gray-500">@</span>
                    <div className="relative w-[230px]">
                      <div className="flex gap-2">
                        <input
                          className={`flex-1 h-11 px-3 rounded-xl border ${isCustomDomain ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                          value={formData.emailDomain}
                          onChange={handleChange('emailDomain')}
                          disabled={!isCustomDomain}
                        />
                        <button type="button" onClick={() => setShowEmailDomainDropdown(prev => !prev)} className="h-11 min-w-[88px] px-3 border border-gray-200 rounded-xl bg-white text-sm flex items-center justify-center gap-1">
                          <span className="text-xs">선택</span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      {showEmailDomainDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          {emailDomains.map(domain => (
                            <button key={domain} type="button" onClick={() => {
                              setFormData(prev => ({ ...prev, emailDomain: domain }))
                              setIsCustomDomain(false)
                              setShowEmailDomainDropdown(false)
                            }} className="w-full px-4 py-3 text-sm text-left hover:bg-blue-50">
                              {domain}
                            </button>
                          ))}
                          <div className="border-t border-gray-200">
                            <button type="button" onClick={() => {
                              setIsCustomDomain(true)
                              setFormData(prev => ({ ...prev, emailDomain: '' }))
                              setShowEmailDomainDropdown(false)
                            }} className="w-full px-4 py-3 text-sm text-left text-blue-600 hover:bg-blue-50 font-medium">
                              직접 입력
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">전화번호</label>
                  <div className="flex items-center gap-2 max-w-2xl">
                    <input
                      className="w-20 h-11 px-3 rounded-xl border border-gray-200 text-center bg-white"
                      value={formData.phonePrefix}
                      onChange={handlePhoneChange('phonePrefix')}
                    />
                    <span>-</span>
                    <input
                      className="w-24 h-11 px-3 rounded-xl border border-gray-200 text-center bg-white"
                      value={formData.phoneMiddle}
                      onChange={handlePhoneChange('phoneMiddle')}
                    />
                    <span>-</span>
                    <input
                      className="w-24 h-11 px-3 rounded-xl border border-gray-200 text-center bg-white"
                      value={formData.phoneLast}
                      onChange={handlePhoneChange('phoneLast')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-4">주소 정보</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">우편번호</label>
                  <div className="flex gap-2 max-w-md">
                    <input className="flex-1 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500" readOnly value={formData.zipCode} />
                    <button type="button" onClick={() => setShowPostalCodeSearch(true)} className="h-11 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium">
                      우편번호 찾기
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">주소</label>
                  <input
                    className="w-full max-w-3xl h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                    value={formData.address}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">상세주소</label>
                  <input className="w-full max-w-3xl h-11 px-3 rounded-xl border border-gray-200" value={formData.addressDetail} onChange={handleChange('addressDetail')} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-4">본인 확인</p>
              <p className="text-xs text-gray-600">
                하단의 수정하기 버튼을 누르면 현재 비밀번호 확인 모달이 열립니다.
              </p>
            </div>
          </div>
        )}
      </section>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/mypage/profile')}
          className="ml-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {'< 뒤로가기'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPasswordModalOpen(true)
          }}
          disabled={isSaving}
          className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          수정하기
        </button>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (isSaving || isOtpCommitting || isOtpReissuing) return
              if (pendingOtpInfo) {
                closePhoneOtpModal()
                return
              }
              setIsPasswordModalOpen(false)
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
            <button
              type="button"
              onClick={() => {
                if (pendingOtpInfo) {
                  closePhoneOtpModal()
                  return
                }
                setIsPasswordModalOpen(false)
              }}
              disabled={isSaving || isOtpCommitting || isOtpReissuing}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-60"
              aria-label="수정 모달 닫기"
            >
              <X className="h-4 w-4" />
            </button>
            {pendingOtpInfo ? (
              <>
                <h3 className="text-lg font-bold text-gray-900">OTP 인증 및 전화번호 변경</h3>
                <p className="mt-2 text-sm text-gray-600">
                  비밀번호 검증이 완료되었습니다.
                  <br />
                  변경된 번호로 수신한 OTP 6자리를 입력해 주세요.
                </p>

                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
                  <p className="text-xs text-blue-700">인증 대상 전화번호: {pendingOtpInfo.phone}</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                      otpTimeLeft > 0 ? 'text-blue-700' : 'text-red-600'
                    }`}
                  >
                    <Clock3 className="h-4 w-4" />
                    남은 시간: {formatOtpTime(otpTimeLeft)}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">OTP</label>
                  <input
                    className="w-full h-11 px-3 rounded-xl border border-gray-200"
                    placeholder="OTP를 입력해 주세요"
                    value={phoneOtpNumber}
                    onChange={e => {
                      setPhoneOtpNumber(e.target.value)
                      if (phoneOtpInlineError) setPhoneOtpInlineError('')
                      if (phoneOtpInlineSuccess) setPhoneOtpInlineSuccess('')
                    }}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    OTP는 숫자 6자리입니다. 문자메시지를 확인해 주세요.
                  </p>
                  {phoneOtpInlineSuccess && (
                    <p className="mt-2 text-xs font-medium text-blue-600">
                      {phoneOtpInlineSuccess}
                    </p>
                  )}
                  {phoneOtpInlineError && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {phoneOtpInlineError}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closePhoneOtpModal}
                    disabled={isOtpCommitting || isOtpReissuing}
                    className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-60"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePhoneOtpReissue()}
                    disabled={isOtpReissuing || isOtpCommitting}
                    className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-60"
                  >
                    {isOtpReissuing ? 'OTP 재전송 중...' : 'OTP 재전송'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePhoneOtpConfirm}
                    disabled={isOtpCommitting}
                    className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {isOtpCommitting ? '인증 중...' : '전화번호 변경'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900">비밀번호 확인</h3>
                <p className="mt-1 text-sm text-gray-600">
                  현재 비밀번호를 입력 후 수정하기를 눌러주세요.
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">현재 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full h-11 px-3 pr-11 rounded-xl border border-gray-200"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    disabled={isSaving}
                    className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-60"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {isSaving ? '저장 중...' : '수정하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPostalCodeSearch && (
        <PostalCodeSearch
          onComplete={({ postalCode, address, detailedAddress }) => {
            setFormData(prev => ({
              ...prev,
              zipCode: postalCode,
              address,
              addressDetail: prev.addressDetail || detailedAddress || '',
            }))
            setShowPostalCodeSearch(false)
          }}
          onClose={() => setShowPostalCodeSearch(false)}
        />
      )}
      <ErrorModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        message={modal.message}
      />
    </ProfileManageFrame>
  )
}
