'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import ErrorModal from '@/components/common/Modal/ErrorModal'
import { authService } from '@/services/auth'
import { withdrawCurrentUser } from '@/services/userAccount'
import ProfileManageFrame from '../components/ProfileManageFrame'

const WITHDRAW_DESCRIPTION =
  '탈퇴 시 이름, 연락처, 주소 등 개인정보는 삭제되며, 계정은 복구할 수 없습니다.\n탈퇴 후에도 신청한 대회의 사이트에서 신청·결제 관련 내역을 확인할 수 있으며, 해당 기록은 유지됩니다.'

const WITHDRAW_CONFIRM_TEXT = '탈퇴합니다'

export default function Client() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirmText, setConfirmText] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
  })

  const isConfirmTextValid = confirmText.trim() === WITHDRAW_CONFIRM_TEXT

  const handleOpenConfirm = () => {
    if (!isConfirmTextValid) {
      setModal({
        isOpen: true,
        title: '입력 확인',
        message: `「${WITHDRAW_CONFIRM_TEXT}」를 정확히 입력해 주세요.`,
      })
      return
    }
    setShowConfirmModal(true)
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    try {
      await withdrawCurrentUser()
      setShowConfirmModal(false)
      await authService.logout()
      queryClient.clear()
      router.replace('/')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '회원탈퇴에 실패했습니다.'
      setShowConfirmModal(false)
      setModal({
        isOpen: true,
        title: '탈퇴 실패',
        message,
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <ProfileManageFrame>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-bold text-gray-900">회원탈퇴</h3>
        <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{WITHDRAW_DESCRIPTION}</p>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            탈퇴를 진행하려면 아래에 「{WITHDRAW_CONFIRM_TEXT}」를 입력해 주세요.
          </label>
          <input
            type="text"
            className="w-full max-w-md h-11 px-3 rounded-xl border border-gray-200"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={WITHDRAW_CONFIRM_TEXT}
            disabled={isWithdrawing}
            autoComplete="off"
          />
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/mypage/profile')}
          className="shrink-0 ml-1 text-sm text-gray-600 hover:text-gray-900"
          disabled={isWithdrawing}
        >
          {'< 뒤로가기'}
        </button>
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={isWithdrawing || !isConfirmTextValid}
          className="shrink-0 h-9 px-3.5 rounded-lg border border-red-600 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 sm:h-11 sm:px-5 sm:rounded-xl sm:text-sm"
        >
          회원탈퇴
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => !isWithdrawing && setShowConfirmModal(false)}
        onConfirm={() => void handleWithdraw()}
        title="회원탈퇴"
        message="정말 탈퇴하시겠습니까?"
        smallMessage={WITHDRAW_DESCRIPTION.replace('\n', ' ')}
        confirmText="탈퇴하기"
        cancelText="취소"
        variant="danger"
        isLoading={isWithdrawing}
        multiline
      />

      <ErrorModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        message={modal.message}
      />
    </ProfileManageFrame>
  )
}
