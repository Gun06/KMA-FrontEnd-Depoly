'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SegmentedControl from '@/components/main/mypage/SegmentedControl'
import DateRangeInputs from '@/components/main/mypage/DateRangeInputs'
import { useGlobalNotifications, useEventNotifications } from '../notifications/hooks/useNotifications'
import type { NotificationItem } from '../notifications/types/notification'
import { useMyProfile } from '../profile/shared'
import { useAuthStore } from '@/stores/authStore'

interface CertificateData {
  id: string
  eventName: string
  date: string
  time: string
  status: 'available' | 'pending' | 'expired'
}

const statusLabel: Record<CertificateData['status'], string> = {
  available: '발급완료',
  pending: '처리중',
  expired: '만료',
}

const statusClass: Record<CertificateData['status'], string> = {
  available: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  expired: 'bg-gray-50 text-gray-700 border border-gray-200',
}

function isUnreadNotification(notification: NotificationItem): boolean {
  if (notification.isRead !== undefined) return notification.isRead === false
  if (notification.read !== undefined) return notification.read === false
  return true
}

function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getMonthsAgoDate(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getStartDateByPeriod(period: string): string {
  switch (period) {
    case '1주일': {
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
    default:
      return getMonthsAgoDate(3)
  }
}

function MyCertificatesPage() {
  const router = useRouter()
  const { user, data: profile, isLoading: isProfileLoading } = useMyProfile()
  const { isLoggedIn, accessToken } = useAuthStore()
  const { data: globalCountData } = useGlobalNotifications(1, 20)
  const { data: eventCountData } = useEventNotifications(1, 20)
  const [selectedPeriod, setSelectedPeriod] = useState('3개월')
  const [startDate, setStartDate] = useState(getStartDateByPeriod('3개월'))
  const [endDate, setEndDate] = useState(getTodayDate())
  const [page, setPage] = useState(1)
  const pageSize = 7

  const periods = ['1주일', '1개월', '3개월', '6개월']

  // 필터 변경 시 1페이지로 이동
  useEffect(() => {
    setPage(1)
  }, [selectedPeriod, startDate, endDate])

  const filtered: CertificateData[] = []
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const unreadCount =
    (globalCountData?.content
      ? globalCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0) +
    (eventCountData?.content
      ? eventCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0)

  const isAuthenticated = isLoggedIn && Boolean(accessToken)
  const showLoginGuide = !isAuthenticated

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '기록증'
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
            isLoading={isAuthenticated && isProfileLoading}
            statusText="활성"
            unreadCountText={`${unreadCount}건`}
            onEditClick={() => router.push('/mypage/profile')}
          />

          {/* 오른쪽 컨텐츠 영역 */}
          <div className="order-2 min-w-0">
            {/* 탭 네비게이션 */}
            <MypageTabs />
            {showLoginGuide ? (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  로그인 후 이용할 수 있습니다.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  기록증 메뉴는 로그인 후 확인 가능합니다.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="mt-5 h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  로그인하러 가기
                </button>
              </div>
            ) : (
              <>

        {/* 필터 섹션 */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-2xl mt-4 mb-4">
          <div className="text-[11px] tracking-[0.12em] text-gray-400 font-medium mb-3">FILTER</div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <SegmentedControl
              options={periods.map((p) => ({ key: p, label: p }))}
              value={selectedPeriod}
              onChange={(v) => setSelectedPeriod(v)}
              fullWidth
            />
            <DateRangeInputs
              start={startDate}
              end={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              className="w-full"
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <p className="text-xs sm:text-sm text-gray-500 mb-5 pl-3 border-l-2 border-gray-200">
          *기록증은 대회 주최 측 처리 후 발급 가능합니다.
        </p>

        {/* 모바일 카드 리스트 */}
        <div className="mt-2 sm:hidden space-y-3">
          {isProfileLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`cert-mobile-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-5 w-44 bg-gray-200 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                </div>
                <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm">
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-4 w-14 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          ) : paginated.length === 0 ? (
            <div className="py-20 px-4 bg-white rounded-xl border border-gray-200 text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">기록증 내역이 없습니다</p>
              <p className="text-sm text-gray-500">기록증이 발급되면 이곳에서 확인할 수 있습니다.</p>
            </div>
          ) : (
            paginated.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">{row.date}</div>
                    <div className="mt-1 text-base font-semibold text-gray-900">{row.eventName}</div>
                  </div>
                  <span className={`inline-flex items-center justify-center min-w-[72px] px-3 py-1 text-[10px] font-medium rounded-md whitespace-nowrap ${statusClass[row.status]}`}>
                    {statusLabel[row.status]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm">
                  <div className="text-gray-500">기록</div>
                  <div className="text-gray-900 truncate">{row.time}</div>
                  <div className="text-gray-500">다운로드</div>
                  <div className="text-gray-900">
                    <button className="text-gray-900 underline">[PDF 다운로드]</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 테이블 (태블릿 이상) */}
        <div className="mt-2 hidden sm:block">
          {isProfileLoading ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 animate-pulse">
              <table className="w-full min-w-[640px] sm:min-w-0 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">일자</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">대회명</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">기록</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">발급상태</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">다운로드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`cert-desktop-skeleton-${index}`}>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="h-6 w-16 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 px-8 bg-white rounded-xl border border-gray-200 text-center">
              <p className="text-xl font-medium text-gray-700 mb-2">기록증 내역이 없습니다</p>
              <p className="text-sm text-gray-500">기록증이 발급되면 이곳에서 확인할 수 있습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[640px] sm:min-w-0 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">일자</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">대회명</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">기록</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">발급상태</th>
                    <th className="px-3 sm:px-6 py-3 text-center text-[11px] tracking-[0.12em] font-medium text-gray-500">다운로드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-700 text-center">{row.date}</td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-900 text-center max-w-[260px] truncate">{row.eventName}</td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-gray-800 text-center">{row.time}</td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center min-w-[72px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${statusClass[row.status]}`}>
                          {statusLabel[row.status]}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                        <button className="text-gray-700 hover:text-gray-900 underline underline-offset-2">[PDF 다운로드]</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!isProfileLoading && filtered.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </button>
              {Array.from({ length: pageCount }).map((_, idx) => {
                const num = idx + 1
                const isActive = num === page
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-2 text-sm rounded ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
              <button
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
              >
                다음
              </button>
            </div>
          </div>
        )}
              </>
            )}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}

export default function PageWithOverlay() {
  return <MyCertificatesPage />
}
