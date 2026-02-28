'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import DatePicker from '@/app/(main)/signup/step3/DatePicker'
import PostalCodeSearch from '@/app/(main)/signup/step4/PostalCodeSearch'
import { userApi } from '@/hooks/api.presets'
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
  previousPassword: string
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
  const { data, isLoading } = useMyProfile()
  const [showPostalCodeSearch, setShowPostalCodeSearch] = useState(false)
  const [showEmailDomainDropdown, setShowEmailDomainDropdown] = useState(false)
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
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
    previousPassword: '',
  })

  useEffect(() => {
    if (!data) return
    const emailParts = (data.email ?? '').split('@')
    const phoneParts = (data.phNum ?? '').split('-')
    setFormData(prev => ({
      ...prev,
      name: data.name ?? '',
      birthDate: toBirthDisplay(data.birth),
      gender: toGenderValue(data.gender),
      emailLocal: emailParts[0] ?? '',
      emailDomain: emailParts[1] ?? '',
      phonePrefix: phoneParts[0] ?? '010',
      phoneMiddle: phoneParts[1] ?? '',
      phoneLast: phoneParts[2] ?? '',
      address: data.address ?? '',
      addressDetail: data.addressDetail ?? '',
      zipCode: data.zipCode ?? '',
      previousPassword: '',
    }))
    setIsCustomDomain(Boolean(emailParts[1] && !emailDomains.includes(emailParts[1])))
  }, [data])

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

  const handleSave = async () => {
    if (!formData.previousPassword.trim()) {
      alert('현재 비밀번호를 입력해 주세요.')
      return
    }
    setIsSaving(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-profile', {
        patchedProfile: {
          birth: formData.birthDate.replace(/\./g, '-'),
          name: formData.name,
          phNum: `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`,
          email: `${formData.emailLocal}@${formData.emailDomain}`,
          gender: formData.gender === 'female' ? 'F' : 'M',
        },
        address: {
          address: formData.address,
          zipCode: formData.zipCode,
          addressDetail: formData.addressDetail,
        },
        previousPassword: formData.previousPassword,
      })
      alert('회원정보가 수정되었습니다.')
      setFormData(prev => ({ ...prev, previousPassword: '' }))
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '회원정보 수정에 실패했습니다.'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">회원정보 수정</h3>
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">불러오는 중...</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">이름</label>
                <input className="w-full h-11 px-3 rounded-xl border border-gray-200" value={formData.name} onChange={handleChange('name')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">성별</label>
                <div className="h-11 p-1 rounded-xl border border-gray-200 bg-white inline-flex items-center gap-1">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))} className={`h-9 px-4 rounded-lg text-sm ${formData.gender === 'male' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>남성</button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))} className={`h-9 px-4 rounded-lg text-sm ${formData.gender === 'female' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>여성</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">생년월일</label>
              <DatePicker value={formData.birthDate} onChange={value => setFormData(prev => ({ ...prev, birthDate: value }))} placeholder="YYYY.MM.DD" />
            </div>

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
              <div className="flex items-center gap-2 max-w-md">
                <input className="w-20 h-11 px-3 rounded-xl border border-gray-200 text-center" value={formData.phonePrefix} onChange={handlePhoneChange('phonePrefix')} />
                <span>-</span>
                <input className="w-24 h-11 px-3 rounded-xl border border-gray-200 text-center" value={formData.phoneMiddle} onChange={handlePhoneChange('phoneMiddle')} />
                <span>-</span>
                <input className="w-24 h-11 px-3 rounded-xl border border-gray-200 text-center" value={formData.phoneLast} onChange={handlePhoneChange('phoneLast')} />
              </div>
            </div>

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
              <input className="w-full max-w-3xl h-11 px-3 rounded-xl border border-gray-200" value={formData.address} onChange={handleChange('address')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">상세주소</label>
              <input className="w-full max-w-3xl h-11 px-3 rounded-xl border border-gray-200" value={formData.addressDetail} onChange={handleChange('addressDetail')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">현재 비밀번호</label>
                <input type="password" className="w-full h-11 px-3 rounded-xl border border-gray-200" value={formData.previousPassword} onChange={handleChange('previousPassword')} />
              </div>
              <button type="button" onClick={handleSave} disabled={isSaving} className="h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        )}
      </section>

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
    </ProfileManageFrame>
  )
}
