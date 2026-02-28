'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel'
import { userApi } from '@/hooks/api.presets'
import { api } from '@/hooks/useFetch'
import { decodeToken } from '@/utils/jwt'
import DatePicker from '@/app/(main)/signup/step3/DatePicker'
import PostalCodeSearch from '@/app/(main)/signup/step4/PostalCodeSearch'
import { useGlobalNotifications, useEventNotifications } from '../notifications/hooks/useNotifications'
import type { NotificationItem } from '../notifications/types/notification'

interface ProfileResponse {
  id?: string
  account?: string
  name?: string
  phNum?: string
  birth?: string
  email?: string
  gender?: 'M' | 'F' | string
  address?: string
  addressDetail?: string
  zipCode?: string
  pushAlarmAble?: boolean
}

interface ProfileFormData {
  account: string
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

function normalizeProfileResponse(data: unknown): ProfileResponse {
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const user = (record.user && typeof record.user === 'object'
    ? record.user
    : record) as Record<string, unknown>

  return {
    id: typeof user.id === 'string' ? user.id : undefined,
    account: typeof user.account === 'string' ? user.account : undefined,
    name: typeof user.name === 'string' ? user.name : undefined,
    phNum: typeof user.phNum === 'string' ? user.phNum : undefined,
    birth: typeof user.birth === 'string' ? user.birth : undefined,
    email: typeof user.email === 'string' ? user.email : undefined,
    gender: typeof user.gender === 'string' ? user.gender : undefined,
    address: typeof user.address === 'string' ? user.address : undefined,
    addressDetail:
      typeof user.addressDetail === 'string' ? user.addressDetail : undefined,
    zipCode: typeof user.zipCode === 'string' ? user.zipCode : undefined,
    pushAlarmAble:
      typeof user.pushAlarmAble === 'boolean'
        ? user.pushAlarmAble
        : typeof record.pushAlarmAble === 'boolean'
          ? (record.pushAlarmAble as boolean)
          : undefined,
  }
}

function isUnreadNotification(notification: NotificationItem): boolean {
  if (notification.isRead !== undefined) return notification.isRead === false
  if (notification.read !== undefined) return notification.read === false
  return true
}

export default function Client() {
  const { user } = useAuthStore()
  const [showPostalCodeSearch, setShowPostalCodeSearch] = useState(false)
  const [showEmailDomainDropdown, setShowEmailDomainDropdown] = useState(false)
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const [profilePrevPassword, setProfilePrevPassword] = useState('')
  const [pushAlarmAble, setPushAlarmAble] = useState(true)
  const [newAccountId, setNewAccountId] = useState('')
  const [accountIdPrevPassword, setAccountIdPrevPassword] = useState('')
  const [newAccountPassword, setNewAccountPassword] = useState('')
  const [accountPasswordPrevPassword, setAccountPasswordPrevPassword] = useState('')
  const [changePasswordRequestAccountId, setChangePasswordRequestAccountId] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingSetting, setIsSavingSetting] = useState(false)
  const [isSavingAccountId, setIsSavingAccountId] = useState(false)
  const [isSavingAccountPassword, setIsSavingAccountPassword] = useState(false)
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false)

  const userId = useMemo(() => {
    if (user?.id) return user.id
    if (typeof window === 'undefined') return ''
    const token = localStorage.getItem('kmaAccessToken')
    if (!token) return ''
    const decoded = decodeToken(token) as { sub?: string } | null
    return decoded?.sub ?? ''
  }, [user?.id])

  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'profile', userId],
    queryFn: async () => {
      const response = await userApi.authGet<unknown>(`/api/v1/user/${userId}`)
      return normalizeProfileResponse(response)
    },
    enabled: !!userId,
    retry: false,
  })

  const [formData, setFormData] = useState<ProfileFormData>({
    account: '',
    name: '',
    birthDate: '',
    gender: '',
    emailLocal: '',
    emailDomain: '',
    phonePrefix: '010',
    phoneMiddle: '',
    phoneLast: '',
    address: '',
    addressDetail: '',
    zipCode: '',
  })

  const splitEmail = (email?: string) => {
    if (!email || !email.includes('@')) return { emailLocal: '', emailDomain: '' }
    const [emailLocal, emailDomain] = email.split('@')
    return { emailLocal: emailLocal ?? '', emailDomain: emailDomain ?? '' }
  }

  const splitPhone = (phNum?: string) => {
    const parts = (phNum ?? '').split('-')
    if (parts.length !== 3) {
      return { phonePrefix: '010', phoneMiddle: '', phoneLast: '' }
    }
    return {
      phonePrefix: parts[0] || '010',
      phoneMiddle: parts[1] || '',
      phoneLast: parts[2] || '',
    }
  }

  const toBirthDisplay = (birth?: string) => {
    if (!birth) return ''
    return birth.replace(/-/g, '.')
  }

  const toGenderValue = (gender?: string): '' | 'male' | 'female' => {
    if (!gender) return ''
    if (gender === 'M') return 'male'
    if (gender === 'F') return 'female'
    return ''
  }

  useEffect(() => {
    if (!data) return
    const email = splitEmail(data.email)
    const phone = splitPhone(data.phNum)

    setFormData({
      account: data.account ?? user?.account ?? '',
      name: data.name ?? '',
      birthDate: toBirthDisplay(data.birth),
      gender: toGenderValue(data.gender),
      emailLocal: email.emailLocal,
      emailDomain: email.emailDomain,
      phonePrefix: phone.phonePrefix,
      phoneMiddle: phone.phoneMiddle,
      phoneLast: phone.phoneLast,
      address: data.address ?? '',
      addressDetail: data.addressDetail ?? '',
      zipCode: data.zipCode ?? '',
    })
    setPushAlarmAble(data.pushAlarmAble ?? true)
    setNewAccountId(data.account ?? user?.account ?? '')
    setChangePasswordRequestAccountId(data.account ?? user?.account ?? '')
    setIsCustomDomain(Boolean(email.emailDomain && !['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'hotmail.com', 'outlook.com', 'yahoo.com'].includes(email.emailDomain)))
  }, [data, user?.account])

  const handleChange =
    (key: keyof Omit<ProfileFormData, 'gender'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [key]: e.target.value }))
    }

  const handlePhoneChange =
    (key: 'phonePrefix' | 'phoneMiddle' | 'phoneLast') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '')
      setFormData(prev => ({ ...prev, [key]: value }))
    }

  const handleGenderChange = (value: '' | 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender: value }))
  }

  const handlePostalCodeComplete = (postal: {
    postalCode: string
    address: string
    detailedAddress: string
  }) => {
    setFormData(prev => ({
      ...prev,
      zipCode: postal.postalCode,
      address: postal.address,
      addressDetail: prev.addressDetail || postal.detailedAddress || '',
    }))
    setShowPostalCodeSearch(false)
  }

  const handleDomainSelection = (domain: string) => {
    setFormData(prev => ({ ...prev, emailDomain: domain }))
    setIsCustomDomain(false)
    setShowEmailDomainDropdown(false)
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

  const toBirthPayload = (birthDate: string) => birthDate.replace(/\./g, '-')
  const toGenderPayload = (gender: '' | 'male' | 'female'): 'M' | 'F' =>
    gender === 'female' ? 'F' : 'M'
  const toPhonePayload = () =>
    `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`
  const toEmailPayload = () => `${formData.emailLocal}@${formData.emailDomain}`

  const handleSaveProfile = async () => {
    if (!profilePrevPassword.trim()) {
      alert('프로필 수정 전 현재 비밀번호를 입력해 주세요.')
      return
    }
    setIsSavingProfile(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-profile', {
        patchedProfile: {
          birth: toBirthPayload(formData.birthDate),
          name: formData.name,
          phNum: toPhonePayload(),
          email: toEmailPayload(),
          gender: toGenderPayload(formData.gender),
        },
        address: {
          address: formData.address,
          zipCode: formData.zipCode,
          addressDetail: formData.addressDetail,
        },
        previousPassword: profilePrevPassword,
      })
      alert('회원정보가 수정되었습니다.')
      setProfilePrevPassword('')
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '회원정보 수정에 실패했습니다.'
      alert(msg)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveSetting = async () => {
    setIsSavingSetting(true)
    try {
      await userApi.authPatch('/api/v1/user/setting', {
        pushAlarmAble,
      })
      alert('설정이 저장되었습니다.')
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '설정 저장에 실패했습니다.'
      alert(msg)
    } finally {
      setIsSavingSetting(false)
    }
  }

  const handleSaveAccountId = async () => {
    if (!newAccountId.trim() || !accountIdPrevPassword.trim()) {
      alert('새 아이디와 현재 비밀번호를 모두 입력해 주세요.')
      return
    }
    setIsSavingAccountId(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-account/account-id', {
        accountId: newAccountId.trim(),
        previousPassword: accountIdPrevPassword,
      })
      alert('아이디가 수정되었습니다.')
      setAccountIdPrevPassword('')
      setChangePasswordRequestAccountId(newAccountId.trim())
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '아이디 수정에 실패했습니다.'
      alert(msg)
    } finally {
      setIsSavingAccountId(false)
    }
  }

  const handleSaveAccountPassword = async () => {
    if (!newAccountPassword.trim() || !accountPasswordPrevPassword.trim()) {
      alert('새 비밀번호와 현재 비밀번호를 모두 입력해 주세요.')
      return
    }
    setIsSavingAccountPassword(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-account/account-password', {
        accountPassword: newAccountPassword,
        previousPassword: accountPasswordPrevPassword,
      })
      alert('비밀번호가 수정되었습니다.')
      setNewAccountPassword('')
      setAccountPasswordPrevPassword('')
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '비밀번호 수정에 실패했습니다.'
      alert(msg)
    } finally {
      setIsSavingAccountPassword(false)
    }
  }

  const handleRequestPasswordReset = async () => {
    if (!changePasswordRequestAccountId.trim()) {
      alert('아이디를 입력해 주세요.')
      return
    }
    setIsRequestingPasswordReset(true)
    try {
      await api.post('user', '/api/v1/public/user/change-password', {
        accountId: changePasswordRequestAccountId.trim(),
      })
      alert('비밀번호 변경 신청이 완료되었습니다.')
    } catch (error) {
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '비밀번호 변경 신청에 실패했습니다.'
      alert(msg)
    } finally {
      setIsRequestingPasswordReset(false)
    }
  }

  const handleCancelAll = () => {
    if (!data) return
    const email = splitEmail(data.email)
    const phone = splitPhone(data.phNum)
    setFormData({
      account: data.account ?? user?.account ?? '',
      name: data.name ?? '',
      birthDate: toBirthDisplay(data.birth),
      gender: toGenderValue(data.gender),
      emailLocal: email.emailLocal,
      emailDomain: email.emailDomain,
      phonePrefix: phone.phonePrefix,
      phoneMiddle: phone.phoneMiddle,
      phoneLast: phone.phoneLast,
      address: data.address ?? '',
      addressDetail: data.addressDetail ?? '',
      zipCode: data.zipCode ?? '',
    })
    setPushAlarmAble(data.pushAlarmAble ?? true)
    setNewAccountId(data.account ?? user?.account ?? '')
    setChangePasswordRequestAccountId(data.account ?? user?.account ?? '')
    setProfilePrevPassword('')
    setAccountIdPrevPassword('')
    setNewAccountPassword('')
    setAccountPasswordPrevPassword('')
  }

  const labelClass = 'block text-sm font-semibold text-gray-800 mb-2'
  const inputClass =
    'w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const readOnlyClass =
    'w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500'

  const { data: globalCountData } = useGlobalNotifications(1, 20)
  const { data: eventCountData } = useEventNotifications(1, 20)
  const unreadCount =
    (globalCountData?.content
      ? globalCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0) +
    (eventCountData?.content
      ? eventCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0)

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '프로필 관리',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <ProfileInfoPanel
            name={user?.account}
            account={user?.account}
            role={user?.role}
            statusText="활성"
            unreadCountText={`${unreadCount}건`}
            onEditClick={() => {}}
          />

          <div className="order-2 min-w-0">
            {isLoading ? (
              <div className="py-16 text-center text-gray-500">불러오는 중...</div>
            ) : (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                <h3 className="text-base font-bold text-gray-900">기본 정보</h3>
                <p className="mt-1 text-xs text-gray-500">회원 식별 및 인적 기본 정보입니다.</p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      아이디 <span className="text-red-500">*</span>
                    </label>
                    <input value={formData.account} readOnly className={readOnlyClass} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      성명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleChange('name')}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      생년월일 <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={formData.birthDate}
                      onChange={value =>
                        setFormData(prev => ({ ...prev, birthDate: value }))
                      }
                      placeholder="YYYY.MM.DD"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      성별 <span className="text-red-500">*</span>
                    </label>
                    <div className="h-11 p-1 rounded-xl border border-gray-200 bg-white inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleGenderChange('male')}
                        className={`h-9 px-4 rounded-lg text-sm font-medium transition ${
                          formData.gender === 'male'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenderChange('female')}
                        className={`h-9 px-4 rounded-lg text-sm font-medium transition ${
                          formData.gender === 'female'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        여성
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 items-end">
                  <div>
                    <label className={labelClass}>
                      현재 비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={profilePrevPassword}
                      onChange={e => setProfilePrevPassword(e.target.value)}
                      className={inputClass}
                      placeholder="프로필 수정 확인용 비밀번호"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSavingProfile ? '저장 중...' : '프로필 저장'}
                  </button>
                </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                <h3 className="text-base font-bold text-gray-900">연락처 정보</h3>
                <p className="mt-1 text-xs text-gray-500">알림 및 안내 수신에 사용됩니다.</p>

                <div className="mt-5 grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelClass}>
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 w-full max-w-xl">
                      <input
                        type="text"
                        value={formData.emailLocal}
                        onChange={handleChange('emailLocal')}
                        className={`${inputClass} !w-[200px]`}
                      />
                      <span className="text-gray-500 font-medium">@</span>
                      <div className="relative w-[230px] max-w-full">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.emailDomain}
                            onChange={handleChange('emailDomain')}
                            disabled={!isCustomDomain}
                            className={`${inputClass} ${
                              isCustomDomain
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmailDomainDropdown(prev => !prev)}
                            className="h-11 min-w-[88px] px-3 border border-gray-200 rounded-xl bg-white text-sm flex items-center justify-center gap-1 hover:bg-gray-50"
                          >
                            <span className="text-xs">선택</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {showEmailDomainDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            {emailDomains.map(domain => (
                              <button
                                type="button"
                                key={domain}
                                onClick={() => handleDomainSelection(domain)}
                                className={`w-full px-4 py-3 text-sm text-left hover:bg-blue-50 ${
                                  formData.emailDomain === domain
                                    ? 'bg-blue-100 text-blue-600 font-medium'
                                    : 'text-gray-700'
                                }`}
                              >
                                {domain}
                              </button>
                            ))}
                            <div className="border-t border-gray-200">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomDomain(true)
                                  setFormData(prev => ({ ...prev, emailDomain: '' }))
                                  setShowEmailDomainDropdown(false)
                                }}
                                className="w-full px-4 py-3 text-sm text-left text-blue-600 hover:bg-blue-50 font-medium"
                              >
                                직접 입력
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={formData.phonePrefix}
                        onChange={handlePhoneChange('phonePrefix')}
                        maxLength={3}
                        className={`${inputClass} w-20 text-center`}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="text"
                        value={formData.phoneMiddle}
                        onChange={handlePhoneChange('phoneMiddle')}
                        maxLength={4}
                        className={`${inputClass} w-24 text-center`}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="text"
                        value={formData.phoneLast}
                        onChange={handlePhoneChange('phoneLast')}
                        maxLength={4}
                        className={`${inputClass} w-24 text-center`}
                      />
                    </div>
                  </div>
                </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                <h3 className="text-base font-bold text-gray-900">주소 정보</h3>
                <p className="mt-1 text-xs text-gray-500">배송 및 우편 수령에 사용되는 주소입니다.</p>

                <div className="mt-5 grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelClass}>
                      우편번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        value={formData.zipCode}
                        readOnly
                        placeholder="우편번호"
                        className={`${readOnlyClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPostalCodeSearch(true)}
                        className="h-11 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium"
                      >
                        우편번호 찾기
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={handleChange('address')}
                      className={`${inputClass} max-w-3xl`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      상세주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.addressDetail}
                      onChange={handleChange('addressDetail')}
                      className={`${inputClass} max-w-3xl`}
                    />
                  </div>
                </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-gray-900">알림 설정</h3>
                  <p className="mt-1 text-xs text-gray-500">PATCH /api/v1/user/setting</p>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">푸시 알림 수신</p>
                      <p className="text-xs text-gray-500 mt-1">대회/공지 알림을 받습니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushAlarmAble(prev => !prev)}
                      className={`h-9 px-4 rounded-lg text-sm font-semibold ${
                        pushAlarmAble
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pushAlarmAble ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveSetting}
                      disabled={isSavingSetting}
                      className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSavingSetting ? '저장 중...' : '설정 저장'}
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-gray-900">아이디 변경</h3>
                  <p className="mt-1 text-xs text-gray-500">PATCH /api/v1/user/modify-account/account-id</p>
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>새 아이디</label>
                      <input
                        type="text"
                        value={newAccountId}
                        onChange={e => setNewAccountId(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>현재 비밀번호</label>
                      <input
                        type="password"
                        value={accountIdPrevPassword}
                        onChange={e => setAccountIdPrevPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAccountId}
                      disabled={isSavingAccountId}
                      className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSavingAccountId ? '변경 중...' : '아이디 변경'}
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-gray-900">비밀번호 변경</h3>
                  <p className="mt-1 text-xs text-gray-500">PATCH /api/v1/user/modify-account/account-password</p>
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>새 비밀번호</label>
                      <input
                        type="password"
                        value={newAccountPassword}
                        onChange={e => setNewAccountPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>현재 비밀번호</label>
                      <input
                        type="password"
                        value={accountPasswordPrevPassword}
                        onChange={e => setAccountPasswordPrevPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAccountPassword}
                      disabled={isSavingAccountPassword}
                      className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSavingAccountPassword ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-gray-900">비밀번호 변경 신청(분실)</h3>
                  <p className="mt-1 text-xs text-gray-500">POST /api/v1/public/user/change-password</p>
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 items-end">
                    <div>
                      <label className={labelClass}>아이디</label>
                      <input
                        type="text"
                        value={changePasswordRequestAccountId}
                        onChange={e => setChangePasswordRequestAccountId(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestPasswordReset}
                      disabled={isRequestingPasswordReset}
                      className="h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isRequestingPasswordReset ? '요청 중...' : '변경 신청'}
                    </button>
                  </div>
                </section>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelAll}
                    className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPostalCodeSearch && (
        <PostalCodeSearch
          onComplete={handlePostalCodeComplete}
          onClose={() => setShowPostalCodeSearch(false)}
        />
      )}
    </SubmenuLayout>
  )
}
