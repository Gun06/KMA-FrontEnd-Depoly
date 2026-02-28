'use client'

import { useState } from 'react'
import { userApi } from '@/hooks/api.presets'
import ProfileManageFrame from '../components/ProfileManageFrame'

export default function Client() {
  const [accountPassword, setAccountPassword] = useState('')
  const [previousPassword, setPreviousPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!accountPassword.trim() || !previousPassword.trim()) {
      alert('새 비밀번호와 현재 비밀번호를 입력해 주세요.')
      return
    }
    setIsSaving(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-account/account-password', {
        accountPassword,
        previousPassword,
      })
      alert('비밀번호가 변경되었습니다.')
      setAccountPassword('')
      setPreviousPassword('')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '비밀번호 변경에 실패했습니다.'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">비밀번호 변경</h3>
        <p className="mt-1 text-xs text-gray-500">현재 비밀번호 확인 후 새 비밀번호로 변경합니다.</p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">새 비밀번호</label>
            <input
              type="password"
              className="w-full h-11 px-3 rounded-xl border border-gray-200"
              value={accountPassword}
              onChange={e => setAccountPassword(e.target.value)}
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
            {isSaving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </section>
    </ProfileManageFrame>
  )
}
