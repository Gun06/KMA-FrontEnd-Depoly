'use client'

import { useEffect, useState } from 'react'
import { api } from '@/hooks/useFetch'
import ProfileManageFrame from '../components/ProfileManageFrame'
import { useMyProfile } from '../shared'

export default function Client() {
  const { data } = useMyProfile()
  const [accountId, setAccountId] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    setAccountId(data?.account ?? '')
  }, [data?.account])

  const handleRequest = async () => {
    if (!accountId.trim()) {
      alert('아이디를 입력해 주세요.')
      return
    }
    setIsRequesting(true)
    try {
      await api.post('user', '/api/v1/public/user/change-password', {
        accountId: accountId.trim(),
      })
      alert('비밀번호 변경 신청이 완료되었습니다.')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '비밀번호 변경 신청에 실패했습니다.'
      alert(message)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">비밀번호 변경 신청(분실)</h3>
        <p className="mt-1 text-xs text-gray-500">비밀번호를 잊은 경우 변경 신청을 진행합니다.</p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">아이디</label>
            <input
              className="w-full h-11 px-3 rounded-xl border border-gray-200"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleRequest}
            disabled={isRequesting}
            className="h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {isRequesting ? '요청 중...' : '변경 신청'}
          </button>
        </div>
      </section>
    </ProfileManageFrame>
  )
}
