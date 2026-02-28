'use client'

import { useEffect, useState } from 'react'
import { userApi } from '@/hooks/api.presets'
import ProfileManageFrame from '../components/ProfileManageFrame'
import { useMyProfile } from '../shared'

export default function Client() {
  const { data } = useMyProfile()
  const [accountId, setAccountId] = useState('')
  const [previousPassword, setPreviousPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setAccountId(data?.account ?? '')
  }, [data?.account])

  const handleSave = async () => {
    if (!accountId.trim() || !previousPassword.trim()) {
      alert('새 아이디와 현재 비밀번호를 입력해 주세요.')
      return
    }
    setIsSaving(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-account/account-id', {
        accountId: accountId.trim(),
        previousPassword,
      })
      alert('아이디가 변경되었습니다.')
      setPreviousPassword('')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '아이디 변경에 실패했습니다.'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">아이디 변경</h3>
        <p className="mt-1 text-xs text-gray-500">현재 비밀번호 확인 후 아이디를 변경합니다.</p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">새 아이디</label>
            <input
              className="w-full h-11 px-3 rounded-xl border border-gray-200"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">현재 비밀번호</label>
            <input
              type="password"
              className="w-full h-11 px-3 rounded-xl border border-gray-200"
              value={previousPassword}
              onChange={e => setPreviousPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? '변경 중...' : '아이디 변경'}
          </button>
        </div>
      </section>
    </ProfileManageFrame>
  )
}
