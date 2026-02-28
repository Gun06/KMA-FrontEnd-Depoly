'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/hooks/useFetch'
import ErrorModal from '@/components/common/Modal/ErrorModal'
import { authService } from '@/services/auth'
import ProfileManageFrame from '../components/ProfileManageFrame'
import { useMyProfile } from '../shared'

export default function Client() {
  const router = useRouter()
  const { data } = useMyProfile()
  const [accountId, setAccountId] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [shouldLogoutAfterClose, setShouldLogoutAfterClose] = useState(false)
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
  })

  useEffect(() => {
    setAccountId(data?.account ?? '')
  }, [data?.account])

  const handleRequest = async () => {
    if (!accountId.trim()) {
      setModal({
        isOpen: true,
        title: '입력 확인',
        message: '아이디를 입력해 주세요.',
      })
      return
    }
    setIsRequesting(true)
    try {
      await api.post('user', '/api/v1/public/user/change-password', {
        accountId: accountId.trim(),
      })
      setModal({
        isOpen: true,
        title: '신청 완료',
        message: '비밀번호 초기화 신청이 완료되었습니다.',
      })
      setShouldLogoutAfterClose(true)
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '비밀번호 초기화 신청에 실패했습니다.'
      setModal({
        isOpen: true,
        title: '신청 실패',
        message,
      })
    } finally {
      setIsRequesting(false)
    }
  }

  const handleCloseModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
    if (!shouldLogoutAfterClose) return

    setShouldLogoutAfterClose(false)
    void (async () => {
      await authService.logout()
      router.replace('/login')
    })()
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">비밀번호 초기화 신청(분실)</h3>
        <p className="mt-1 text-xs text-gray-500">비밀번호를 잊은 경우 변경 신청을 진행합니다.</p>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">아이디</label>
          <div className="flex items-center gap-2">
            <input
              className="w-[300px] h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              value={accountId}
              readOnly
            />
            <button
              type="button"
              onClick={handleRequest}
              disabled={isRequesting}
              className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {isRequesting ? '요청 중...' : '변경 신청'}
            </button>
          </div>
        </div>
      </section>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => router.push('/mypage/profile')}
          className="ml-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {'< 뒤로가기'}
        </button>
      </div>
      <ErrorModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={modal.title}
        message={modal.message}
      />
    </ProfileManageFrame>
  )
}
