'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/hooks/api.presets'
import ErrorModal from '@/components/common/Modal/ErrorModal'
import ProfileManageFrame from '../components/ProfileManageFrame'
import { useMyProfile } from '../shared'

export default function Client() {
  const router = useRouter()
  const { data } = useMyProfile()
  const [currentAccountId, setCurrentAccountId] = useState('')
  const [newAccountId, setNewAccountId] = useState('')
  const [previousPassword, setPreviousPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
  })

  useEffect(() => {
    setCurrentAccountId(data?.account ?? '')
  }, [data?.account])

  const handleSave = async () => {
    if (!newAccountId.trim() || !previousPassword.trim()) {
      setModal({
        isOpen: true,
        title: '입력 확인',
        message: '새 아이디와 현재 비밀번호를 입력해 주세요.',
      })
      return
    }
    setIsSaving(true)
    try {
      await userApi.authPatch('/api/v1/user/modify-account/account-id', {
        accountId: newAccountId.trim(),
        previousPassword,
      })
      setModal({
        isOpen: true,
        title: '변경 완료',
        message: '아이디가 변경되었습니다.',
      })
      setCurrentAccountId(newAccountId.trim())
      setNewAccountId('')
      setPreviousPassword('')
    } catch (error) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: unknown }).code ?? '')
          : ''
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '아이디 변경에 실패했습니다.'
      setModal({
        isOpen: true,
        title: errorCode === 'DUPLICATE_ACCOUNT_ID' ? '중복 아이디' : '변경 실패',
        message:
          errorCode === 'DUPLICATE_ACCOUNT_ID'
            ? '이미 존재하는 아이디입니다. 다른 아이디를 입력해 주세요.'
            : message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">아이디 변경</h3>
        <p className="mt-1 text-xs text-gray-500">현재 비밀번호 확인 후 아이디를 변경합니다.</p>

        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">기존 아이디</label>
              <input
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                value={currentAccountId}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">새 아이디</label>
              <input
                className="w-full h-11 px-3 rounded-xl border border-gray-200"
                value={newAccountId}
                onChange={e => setNewAccountId(e.target.value)}
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
        </div>
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
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {isSaving ? '변경 중...' : '아이디 변경'}
        </button>
      </div>
      <ErrorModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        message={modal.message}
      />
    </ProfileManageFrame>
  )
}
