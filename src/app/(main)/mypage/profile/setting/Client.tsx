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
  const [pushAlarmAble, setPushAlarmAble] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
  })

  useEffect(() => {
    setPushAlarmAble(data?.pushAlarmAble ?? true)
  }, [data?.pushAlarmAble])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await userApi.authPatch('/api/v1/user/setting', { pushAlarmAble })
      setModal({
        isOpen: true,
        title: '저장 완료',
        message: '설정이 저장되었습니다.',
      })
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '설정 저장에 실패했습니다.'
      setModal({
        isOpen: true,
        title: '저장 실패',
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">알림 설정</h3>
        <p className="mt-1 text-xs text-gray-500">푸시 알림 수신 여부를 설정합니다.</p>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-sm font-medium text-gray-900">푸시 알림 수신</p>
            <p className="text-xs text-gray-500 mt-1">대회/공지 알림을 받습니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setPushAlarmAble(prev => !prev)}
            className={`h-9 px-4 rounded-lg text-sm font-semibold ${
              pushAlarmAble ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {pushAlarmAble ? 'ON' : 'OFF'}
          </button>
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
          {isSaving ? '저장 중...' : '설정 저장'}
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
