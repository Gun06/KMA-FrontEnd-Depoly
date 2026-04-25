'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, Search, Building2 } from 'lucide-react'
import { useEventSearch, useVerifyOrganization } from '../hooks/useApplications'
import type { EventSearchItem } from '../types/application'

export type GroupCashReceiptVerifiedPayload = {
  eventId: string
  organizationId: string
  eventName: string
  eventDate: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onVerified: (payload: GroupCashReceiptVerifiedPayload) => void
  /** 현금영수증에서 뒤로 올 때 2단계(단체 인증)로 복귀 */
  resumeToAuth?: EventSearchItem | null
  onResumeConsumed?: () => void
}

/** API 날짜 문자열에서 시각 부분 제거 후 YYYY.MM.DD 로 표시 (목록·선택한 대회 공통) */
function formatEventDate(value: string) {
  if (!value) return ''
  let dateOnly = value.trim()
  const tIdx = dateOnly.search(/[Tt]/)
  if (tIdx !== -1) {
    dateOnly = dateOnly.slice(0, tIdx)
  } else {
    const m = dateOnly.match(/^(\d{4}[-.]\d{2}[-.]\d{2})\s/)
    if (m) dateOnly = m[1]
  }
  return dateOnly.replace(/-/g, '.')
}

/** Tailwind `sm` (640px) 이상 — SSR/하이드레이션 안전 */
function useIsDesktopSm() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {}
      const mq = window.matchMedia('(min-width: 640px)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(min-width: 640px)').matches,
    () => false,
  )
}

export default function GroupCashReceiptEntryModal({
  isOpen,
  onClose,
  onVerified,
  resumeToAuth = null,
  onResumeConsumed,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [searchInput, setSearchInput] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [searchPage, setSearchPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<EventSearchItem | null>(null)
  const [orgAccount, setOrgAccount] = useState('')
  const [orgPassword, setOrgPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const { data: searchData, isFetching: isSearchFetching } = useEventSearch(appliedKeyword, searchPage, 8)
  const verifyMutation = useVerifyOrganization()

  const reset = useCallback(() => {
    setStep(1)
    setSearchInput('')
    setAppliedKeyword('')
    setSearchPage(1)
    setSelectedEvent(null)
    setOrgAccount('')
    setOrgPassword('')
    setAuthError(null)
  }, [])

  const hasHandledOpenRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      hasHandledOpenRef.current = false
      return
    }
    if (hasHandledOpenRef.current) return
    hasHandledOpenRef.current = true

    if (resumeToAuth) {
      setStep(2)
      setSelectedEvent(resumeToAuth)
      setOrgAccount('')
      setOrgPassword('')
      setAuthError(null)
      setSearchInput('')
      setAppliedKeyword('')
      setSearchPage(1)
      onResumeConsumed?.()
    } else {
      reset()
    }
  }, [isOpen, resumeToAuth, reset, onResumeConsumed])

  const handleSearch = () => {
    const q = searchInput.trim()
    setAppliedKeyword(q)
    setSearchPage(1)
  }

  const handleSelectEvent = (item: EventSearchItem) => {
    setSelectedEvent(item)
    setStep(2)
    setAuthError(null)
    setOrgAccount('')
    setOrgPassword('')
  }

  const handleBack = () => {
    setStep(1)
    setAuthError(null)
    setOrgPassword('')
  }

  const handleVerify = async () => {
    if (!selectedEvent) return
    const id = orgAccount.trim()
    if (!id || !orgPassword) {
      setAuthError('단체 아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setAuthError(null)
    try {
      const res = await verifyMutation.mutateAsync({
        eventId: selectedEvent.eventId,
        body: { id, orgPw: orgPassword },
      })
      const organizationId = res.organizationId ?? res.id
      if (!organizationId) {
        setAuthError('인증 응답에 단체 정보가 없습니다. 관리자에게 문의해 주세요.')
        return
      }
      onVerified({
        eventId: selectedEvent.eventId,
        organizationId,
        eventName: selectedEvent.eventName,
        eventDate: selectedEvent.eventDate,
      })
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '단체 인증에 실패했습니다.'
      setAuthError(msg)
    }
  }

  const isDesktopSm = useIsDesktopSm()

  const events = searchData?.content ?? []
  const totalPages = searchData?.totalPages ?? 0

  const sheetTransition = { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="flex h-[60dvh] max-h-[60dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:pb-0"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-cash-receipt-title"
            initial={
              isDesktopSm
                ? { opacity: 0, scale: 0.96, y: 0 }
                : { opacity: 1, y: '100%' }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              isDesktopSm
                ? { opacity: 0, scale: 0.96, y: 0 }
                : { opacity: 1, y: '100%' }
            }
            transition={sheetTransition}
          >
            <div
              className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden"
              aria-hidden
            />
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 sm:py-4">
          <div className="flex items-center gap-2 min-w-0">
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="이전 단계"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 id="group-cash-receipt-title" className="text-base font-semibold text-gray-900 truncate">
                {step === 1 ? '단체 현금영수증 — 대회 선택' : '단체 현금영수증 — 단체 인증'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-sm text-gray-600">
              현금영수증을 발급할 대회를 검색한 뒤 목록에서 선택해 주세요.
            </p>
            <div className="px-5 pb-3 flex gap-2">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder="대회명 입력"
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shrink-0"
              >
                <Search className="w-4 h-4" />
                검색
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-gray-100 sm:min-h-[200px] sm:max-h-[min(50vh,360px)]">
              {!appliedKeyword ? (
                <p className="p-6 text-center text-sm text-gray-500">대회명을 입력하고 검색해 주세요.</p>
              ) : isSearchFetching ? (
                <p className="p-6 text-center text-sm text-gray-500">검색 중…</p>
              ) : events.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">검색 결과가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {events.map((item) => (
                    <li key={item.eventId}>
                      <button
                        type="button"
                        onClick={() => handleSelectEvent(item)}
                        className="w-full text-left px-5 py-3.5 hover:bg-blue-50/80 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm break-words">{item.eventName}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {formatEventDate(item.eventDate)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {appliedKeyword && totalPages > 1 && (
              <div className="shrink-0 flex items-center justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/80">
                <button
                  type="button"
                  disabled={searchPage <= 1 || isSearchFetching}
                  onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                  className="text-sm font-medium text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="text-xs text-gray-600">
                  {searchPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={searchPage >= totalPages || isSearchFetching}
                  onClick={() => setSearchPage((p) => p + 1)}
                  className="text-sm font-medium text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedEvent && (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:max-h-[min(70vh,480px)]">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm">
              <div className="text-xs text-gray-500 mb-0.5">선택한 대회</div>
              <div className="font-medium text-gray-900 break-words">{selectedEvent.eventName}</div>
              <div className="text-xs text-gray-500 mt-1">{formatEventDate(selectedEvent.eventDate)}</div>
            </div>
            <div>
              <label htmlFor="org-cash-id" className="block text-xs font-medium text-gray-600 mb-1">
                단체 아이디
              </label>
              <input
                id="org-cash-id"
                type="text"
                autoComplete="username"
                value={orgAccount}
                onChange={(e) => setOrgAccount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="단체 신청 시 사용한 아이디"
              />
            </div>
            <div>
              <label htmlFor="org-cash-pw" className="block text-xs font-medium text-gray-600 mb-1">
                단체 비밀번호
              </label>
              <input
                id="org-cash-pw"
                type="password"
                autoComplete="current-password"
                value={orgPassword}
                onChange={(e) => setOrgPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="신청 시 설정한 비밀번호"
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? '인증 중…' : '인증 후 현금영수증으로 이동'}
            </button>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              단체 아이디·비밀번호는 대회 신청 확인 시 사용한 정보와 동일해야 합니다. 인증 후 해당 단체 건의 현금영수증 신청·조회 화면이 열립니다.
            </p>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
