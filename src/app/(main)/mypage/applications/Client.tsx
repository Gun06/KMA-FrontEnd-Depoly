'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { ChevronDown, CalendarX, X } from 'lucide-react'

import SegmentedControl from '@/components/main/mypage/SegmentedControl'
import DateRangeInputs from '@/components/main/mypage/DateRangeInputs'
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel'
import { useApplications } from './hooks/useApplications'
import { useGlobalNotifications, useEventNotifications } from '../notifications/hooks/useNotifications'
import type { NotificationItem } from '../notifications/types/notification'
import Pagination from '@/components/common/Pagination/Pagination'
import PaginationBar from '@/components/common/Pagination/PaginationBar'
import type { ApplicationItem } from './types/application'
import { useMyProfile } from '../profile/shared'

// 상태 매핑 함수
// 백엔드 응답: '신청 취소', '참가 완료', '신청 완료' 3가지
function getStatusConfig(status: string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    '신청 완료': {
      label: '신청 완료',
      className: 'bg-blue-50 text-blue-700 border border-blue-200'
    },
    '참가 완료': {
      label: '참가 완료',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    '신청 취소': {
      label: '신청 취소',
      className: 'bg-rose-50 text-rose-700 border border-rose-200'
    }
  }
  
  return statusMap[status] || {
    label: status || '알 수 없음',
    className: 'bg-gray-50 text-gray-700 border border-gray-200'
  }
}

function isUnreadNotification(notification: NotificationItem): boolean {
  if (notification.isRead !== undefined) return notification.isRead === false
  if (notification.read !== undefined) return notification.read === false
  return true
}

// 날짜 형식 검증: YYYY.MM.DD 형식인지 확인
function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || dateStr.trim() === '') return false
  // YYYY.MM.DD 형식인지 확인 (예: 2026.02.22)
  const datePattern = /^\d{4}\.\d{2}\.\d{2}$/
  return datePattern.test(dateStr)
}

// 날짜 형식 변환: YYYY.MM.DD -> YYYY-MM-DD
function convertDateFormat(dateStr: string): string | undefined {
  if (!isValidDateFormat(dateStr)) {
    return undefined
  }
  return dateStr.replace(/\./g, '-')
}

// 날짜 형식 변환: YYYY-MM-DD -> YYYY.MM.DD
function formatDateForDisplay(dateStr: string): string {
  return dateStr.replace(/-/g, '.')
}

// 오늘 날짜를 YYYY.MM.DD 형식으로 반환
function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// N개월 전 날짜를 YYYY.MM.DD 형식으로 반환
function getMonthsAgoDate(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 기간에 따른 시작일 계산
function getStartDateByPeriod(period: string): string | null {
  switch (period) {
    case '1주일': {
      // 1주일 전 날짜 계산
      const date = new Date()
      date.setDate(date.getDate() - 7)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    }
    case '1개월':
      return getMonthsAgoDate(1)
    case '3개월':
      return getMonthsAgoDate(3)
    case '6개월':
      return getMonthsAgoDate(6)
    case '전체':
      return null // 전체 선택 시 날짜 필터 없음
    default:
      return getMonthsAgoDate(3)
  }
}

export default function Client() {
  const router = useRouter()
  const { user, data: profile, isLoading: isProfileLoading } = useMyProfile()
  const [selectedPeriod, setSelectedPeriod] = useState('3개월')
  const [startDate, setStartDate] = useState<string>(getStartDateByPeriod('3개월') || '')
  const [endDate, setEndDate] = useState(getTodayDate())
  const [sortBy] = useState<'date' | 'status'>('date')

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null)
  const { data: globalCountData } = useGlobalNotifications(1, 20)
  const { data: eventCountData } = useEventNotifications(1, 20)
  const unreadCount =
    (globalCountData?.content
      ? globalCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0) +
    (eventCountData?.content
      ? eventCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0)

  // 기간 선택 변경 시 날짜 자동 업데이트
  useEffect(() => {
    const newStartDate = getStartDateByPeriod(selectedPeriod)
    if (newStartDate !== null) {
      setStartDate(newStartDate)
      // 다른 기간 옵션 선택 시 끝 날짜를 오늘 날짜로 설정
      setEndDate(getTodayDate())
    } else {
      // '전체' 선택 시 날짜 필드 초기화
      setStartDate('')
      setEndDate('')
    }
    setPage(1)
  }, [selectedPeriod])

  // 필터 변경 시 1페이지로 이동
  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, sortBy])

  // API 파라미터 준비
  const apiParams = useMemo(() => {
    // '전체' 선택 시 날짜 필터 제거
    if (selectedPeriod === '전체') {
      return {
        minDate: undefined,
        maxDate: undefined,
        page,
        size: pageSize,
      }
    }
    
    // 날짜 형식이 유효한지 확인
    const minDate = startDate && isValidDateFormat(startDate) 
      ? convertDateFormat(startDate) 
      : undefined
    const maxDate = endDate && isValidDateFormat(endDate)
      ? convertDateFormat(endDate)
      : undefined
    
    // 두 날짜 모두 유효할 때만 API 호출
    // 하나라도 유효하지 않으면 undefined로 설정하여 API 호출 방지
    return {
      minDate,
      maxDate,
      page,
      size: pageSize,
    }
  }, [selectedPeriod, startDate, endDate, page, pageSize])

  // API 호출
  const { data, isLoading, error } = useApplications(apiParams)

  const paginatedData = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 1

  const periods = ['1주일', '1개월', '3개월', '6개월', '전체']

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleApplicationClick = useCallback((item: ApplicationItem) => {
    setSelectedApplication(item)
    setShowDetailModal(true)
  }, [])

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "마이페이지",
        subMenu: "마라톤 신청내역"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <ProfileInfoPanel
            name={profile?.name || user?.account}
            account={profile?.account || user?.account}
            birth={profile?.birth}
            gender={profile?.gender}
            role={user?.role}
            isLoading={isProfileLoading}
            statusText="활성"
            unreadCountText={`${unreadCount}건`}
            onEditClick={() => router.push('/mypage/profile')}
          />

          {/* 오른쪽 컨텐츠 영역 */}
          <div className="order-2 min-w-0">
            {/* 탭 네비게이션 */}
            <MypageTabs />

        {/* 필터 섹션 */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-2xl mt-4 mb-4">
          <div className="text-[11px] tracking-[0.12em] text-gray-400 font-medium mb-3">FILTER</div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 기간 세그먼트 - 모바일: 텍스트 형태, 데스크탑: SegmentedControl */}
            <div className="w-full lg:w-auto">
              {/* 모바일: 텍스트 형태 */}
              <div className="flex flex-wrap items-center gap-2 sm:hidden">
                {periods.map((period, index) => (
                  <div key={period} className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`text-sm transition-colors ${
                        selectedPeriod === period
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {period}
                    </button>
                    {index < periods.length - 1 && (
                      <span className="text-gray-400">|</span>
                    )}
                  </div>
                ))}
              </div>
              {/* 데스크탑: SegmentedControl */}
              <div className="hidden sm:block">
                <SegmentedControl
                  options={periods.map((p) => ({ key: p, label: p }))}
                  value={selectedPeriod}
                  onChange={(v) => setSelectedPeriod(v)}
                  fullWidth
                />
              </div>
            </div>

            {/* 날짜 범위 입력 */}
            <DateRangeInputs
              start={startDate}
              end={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              className="w-full"
            />
          </div>
        </div>


        {/* 에러 상태 */}
        {error && (
          <div className="py-16 text-center text-lg text-red-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 신청내역 - 모바일 카드 리스트 */}
        {(isLoading || data === undefined) && !error ? (
          // 스켈레톤 UI - 모바일
          <div className="mt-4 sm:hidden space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-mobile-${index}`} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && data !== undefined && (
          <div className="mt-4 sm:hidden space-y-3">
            {paginatedData.length === 0 ? (
              <div className="py-20 px-4 bg-white rounded-xl border border-gray-200 text-center">
                <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">신청 내역이 없습니다</p>
                <p className="text-sm text-gray-500">다른 기간을 선택하거나 날짜 범위를 변경해보세요</p>
              </div>
            ) : (
              paginatedData.map((item, index) => (
                <div
                  key={item.regiNum || `item-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleApplicationClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleApplicationClick(item)
                    }
                  }}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">
                          신청: {formatDateForDisplay(item.date)}
                        </span>
                        {item.regiNum && (
                          <span className="text-gray-500"> · 접수번호 {item.regiNum}</span>
                        )}
                      </div>
                      <div className="mt-1 text-base font-semibold text-gray-900">{item.eventName}</div>
                    </div>
                    {(() => {
                      const statusInfo = getStatusConfig(item.status)
                      return (
                        <span className={`inline-flex px-2 py-1 text-[10px] font-medium rounded-md ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm">
                    <div className="text-gray-500">기념품</div>
                    <div className="text-gray-900 truncate">{item.souvenir}</div>
                    <div className="text-gray-500">코스</div>
                    <div className="text-gray-900 truncate">{item.course}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 신청내역 테이블 (데스크탑/태블릿) */}
        {(isLoading || data === undefined) && !error ? (
          // 스켈레톤 UI - 데스크탑
          <div className="mt-4 hidden sm:block">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[680px] sm:min-w-0 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">신청날짜</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">접수번호</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">대회명</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">기념품</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">코스</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-desktop-${index}`} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !error && data !== undefined && (
          <div className="mt-4 hidden sm:block">
            {paginatedData.length === 0 ? (
              <div className="py-20 px-8 bg-white rounded-xl border border-gray-200 text-center">
                <CalendarX className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-700 mb-2">신청 내역이 없습니다</p>
                <p className="text-sm text-gray-500">다른 기간을 선택하거나 날짜 범위를 변경해보세요</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[680px] sm:min-w-0 text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">신청날짜</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">접수번호</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">대회명</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">기념품</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">코스</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">
                        <div className="flex items-center justify-center space-x-1">
                          <span>상태</span>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.regiNum || `item-${index}`}
                        className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                        onClick={() => handleApplicationClick(item)}
                      >
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-700 text-center">
                          {formatDateForDisplay(item.date)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-800 text-center">
                          {item.regiNum || '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-900 text-center max-w-[240px] truncate">{item.eventName}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-800 text-center max-w-[160px] truncate">{item.souvenir}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-800 text-center max-w-[200px] truncate">{item.course}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-center whitespace-nowrap">
                          {(() => {
                            const statusInfo = getStatusConfig(item.status)
                            return (
                              <span
                                className={`inline-flex items-center justify-center min-w-[72px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 바 */}
        {!isLoading && !error && totalElements > 0 && (
          <PaginationBar
            page={page}
            total={totalElements}
            pageSize={pageSize}
            onChange={handlePageChange}
            showTotalText={true}
            showPageIndicator={true}
            className="bg-white mt-4"
            totalPages={totalPages}
            totalTextFormatter={(total) => (
              <>
                총 <b>{total.toLocaleString()}</b>개의 신청 내역
              </>
            )}
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && !error && totalElements > 0 && (
          <div className="flex justify-center py-2 bg-white sm:py-6">
            <Pagination
              page={page}
              total={totalElements}
              pageSize={pageSize}
              onChange={handlePageChange}
              groupSize={10}
              responsive={true}
              showEdge={true}
              activeColor="blue"
            />
          </div>
        )}

        {showDetailModal && selectedApplication && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">신청내역 상세</h3>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="상세 모달 닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-[96px_1fr] gap-y-3 text-sm">
                  <span className="text-gray-500">신청날짜</span>
                  <span className="text-gray-900">{formatDateForDisplay(selectedApplication.date)}</span>

                  <span className="text-gray-500">접수번호</span>
                  <span className="text-gray-900">{selectedApplication.regiNum || '-'}</span>

                  <span className="text-gray-500">대회명</span>
                  <span className="text-gray-900 break-words">{selectedApplication.eventName}</span>

                  <span className="text-gray-500">기념품</span>
                  <span className="text-gray-900 break-words">{selectedApplication.souvenir}</span>

                  <span className="text-gray-500">코스</span>
                  <span className="text-gray-900 break-words">{selectedApplication.course}</span>

                  <span className="text-gray-500">상태</span>
                  <span>
                    {(() => {
                      const statusInfo = getStatusConfig(selectedApplication.status)
                      return (
                        <span className={`inline-flex items-center justify-center min-w-[72px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      )
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
