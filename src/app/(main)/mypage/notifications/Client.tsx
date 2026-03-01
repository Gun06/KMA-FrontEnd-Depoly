'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import Pagination from '@/components/common/Pagination/Pagination'
import PaginationBar from '@/components/common/Pagination/PaginationBar'
import { useGlobalNotifications, useEventNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from './hooks/useNotifications'
import type { NotificationItem } from './types/notification'
import { useMyProfile } from '../profile/shared'

// 알림 미읽음 여부 확인 함수 (read 또는 isRead 속성 확인)
function isUnreadNotification(notification: NotificationItem): boolean {
  // isRead가 있으면 isRead === false인 경우 미읽음
  if (notification.isRead !== undefined) {
    return notification.isRead === false;
  }
  // read가 있으면 read === false인 경우 미읽음
  if (notification.read !== undefined) {
    return notification.read === false;
  }
  // 둘 다 없으면 미읽음으로 간주
  return true;
}

function ClientContent() {
  const router = useRouter()
  const { user, data: profile, isLoading: isProfileLoading } = useMyProfile()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [notificationType, setNotificationType] = useState<'GLOBAL' | 'EVENT'>('GLOBAL')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)

  // 알림 목록 조회 (타입에 따라)
  const { data: globalData, isLoading: globalLoading } = useGlobalNotifications(page, pageSize)
  const { data: eventData, isLoading: eventLoading } = useEventNotifications(page, pageSize)
  // 프로필의 미읽음 카운트는 드롭다운과 동일한 기준(page=1, size=20)으로 계산
  const { data: globalCountData } = useGlobalNotifications(1, 20)
  const { data: eventCountData } = useEventNotifications(1, 20)
  
  const notificationsData = notificationType === 'GLOBAL' ? globalData : eventData
  const isLoading = notificationType === 'GLOBAL' ? globalLoading : eventLoading

  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()

  const totalPages = notificationsData?.totalPages || 1
  const totalElements = notificationsData?.totalElements || 0
  const paginated = notificationsData?.content || []

  // 미읽음 알림 개수 계산
  const globalUnreadCount =
    globalCountData?.content
      ? globalCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0
  const eventUnreadCount =
    eventCountData?.content
      ? eventCountData.content.filter((n) => isUnreadNotification(n)).length
      : 0

  useEffect(() => {
    setPage(1)
  }, [notificationType])

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours % 12 || 12
    
    return {
      datePart: `${year}. ${month}. ${day}.`,
      timePart: `${ampm} ${displayHours}:${minutes}`,
      full: `${year}. ${month}. ${day}. ${ampm} ${displayHours}:${minutes}`
    }
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (isUnreadNotification(notification)) {
      await markAsRead.mutateAsync({
        notificationId: notification.id,
        type: notification.type || (notificationType === 'EVENT' ? 'PERSONAL' : 'GLOBAL'),
      })
    }
    setSelectedNotification(notification)
    setShowDetailModal(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    setDeleteTargetId(notificationId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteNotification.mutateAsync(deleteTargetId)
      setShowDeleteModal(false)
      setDeleteTargetId(null)
    }
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '알림',
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
            unreadCountText={`${globalUnreadCount + eventUnreadCount}건`}
            onEditClick={() => router.push('/mypage/profile')}
          />

          {/* 오른쪽 알림 목록 영역 */}
          <div className="order-2 min-w-0">
            {/* 탭 네비게이션 */}
            <MypageTabs />

            {/* 알림 타입 탭 */}
            <div className="mt-4 mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNotificationType('GLOBAL')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      notificationType === 'GLOBAL'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    전체알림 {globalUnreadCount > 0 && `(${globalUnreadCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationType('EVENT')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      notificationType === 'EVENT'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    대회알림 {eventUnreadCount > 0 && `(${eventUnreadCount})`}
                  </button>
                </div>
                {(notificationType === 'GLOBAL' ? globalUnreadCount : eventUnreadCount) > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (markAllAsRead.isPending) return;
                      try {
                        await markAllAsRead.mutateAsync();
                      } catch (error) {
                        const errorMessage =
                          error && typeof error === 'object' && 'message' in error
                            ? String(error.message)
                            : '알림 읽음 처리에 실패했습니다.';
                        alert(errorMessage);
                      }
                    }}
                    disabled={markAllAsRead.isPending}
                    className="px-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {markAllAsRead.isPending ? '처리 중...' : '모두 읽기'}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] sm:grid-cols-[56px_minmax(0,1fr)_auto] gap-3 px-2 sm:px-3 py-2 border-y border-gray-200 mb-1 text-[11px] tracking-[0.12em] text-gray-400">
              <span className="text-center">NO</span>
              <span className="text-center">TITLE / MESSAGE</span>
              <span className="text-center">DATE</span>
            </div>

            {/* 알림 리스트 */}
            <div className="mt-2">
              {isLoading ? (
                <div className="bg-white animate-pulse">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`notification-skeleton-${index}`}
                      className="px-2 sm:px-3 py-4 sm:py-5 border-b border-gray-200"
                    >
                      <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] sm:grid-cols-[56px_minmax(0,1fr)_auto] gap-3 items-start">
                        <div className="pt-0.5 flex items-center justify-center">
                          <div className="h-4 w-6 rounded bg-gray-200" />
                        </div>
                        <div className="min-w-0">
                          <div className="h-4 w-56 rounded bg-gray-200" />
                          <div className="mt-2 h-3 w-72 max-w-full rounded bg-gray-200" />
                        </div>
                        <div className="pt-0.5 h-3 w-20 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white">
                  {paginated.map((n, index) => {
                    const formatted = formatDate(n.sentAt || n.createdAt)
                    const isUnread = isUnreadNotification(n)
                    const displayNo = totalElements - (page - 1) * pageSize - index

                    return (
                      <div
                        key={n.id}
                        className={`cursor-pointer px-2 sm:px-3 py-4 sm:py-5 border-b border-gray-200 transition-colors ${
                          isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50/70'
                        }`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] sm:grid-cols-[56px_minmax(0,1fr)_auto] gap-3 items-start">
                          <div className="pt-0.5 text-xs sm:text-sm text-gray-500 tabular-nums flex items-center justify-center gap-1">
                            <span>{displayNo}</span>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" aria-label="신규 알림" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-[14px] sm:text-[15px] font-semibold tracking-[-0.01em] truncate ${isUnread ? 'text-gray-950' : 'text-gray-900'}`}>
                              {n.title}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-2 min-w-0">
                              <span className="text-gray-300 text-[11px] leading-none flex-shrink-0" aria-hidden="true">|</span>
                              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                                {n.body}
                              </p>
                            </div>
                          </div>
                          <p className="pt-0.5 text-[11px] sm:text-xs text-gray-400 tabular-nums whitespace-nowrap text-right">
                            {formatted === '-' ? '-' : formatted.datePart}
                          </p>
                          {notificationType === 'EVENT' && (
                            <button
                              onClick={(e) => handleDeleteClick(e, n.id)}
                              className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 text-gray-400 hover:text-red-600 transition-colors ml-2"
                              aria-label="삭제"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 빈 상태 */}
            {!isLoading && paginated.length === 0 && (
              <div className="py-16 text-center text-lg text-gray-800">알림이 없습니다.</div>
            )}

            {/* 페이지네이션 바 */}
            {!isLoading && totalElements > 0 && (
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
                    총 <b>{total.toLocaleString()}</b>개의 알림
                  </>
                )}
              />
            )}

            {/* 페이지네이션 */}
            {!isLoading && totalElements > 0 && (
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
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeleteTargetId(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="알림 삭제"
          message="알림을 삭제하시겠습니까?"
          confirmText="삭제하기"
          cancelText="취소"
          isLoading={deleteNotification.isPending}
          variant="danger"
          centerAlign={true}
        />

        {/* 알림 상세 모달 */}
        {showDetailModal && selectedNotification && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            onClick={() => {
              setShowDetailModal(false)
              setSelectedNotification(null)
            }}
          >
            <div
              className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">알림 상세</h3>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedNotification(null)
                  }}
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="text-sm text-gray-500">
                  {(() => {
                    const formatted = formatDate(selectedNotification.sentAt || selectedNotification.createdAt)
                    return formatted === '-' ? '-' : formatted.full
                  })()}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">제목</p>
                  <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap break-words">
                    {selectedNotification.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">내용</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedNotification.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SubmenuLayout>
  )
}

// 준비중 오버레이 (화면 상단 블러 + 안내)
// function Overlay() {
//   return (
//     <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
//       <div className="rounded-xl border border-gray-200 bg-white shadow-md px-6 py-4 text-gray-800 font-semibold">
//         준비중인 페이지입니다.
//       </div>
//     </div>
//   )
// }

export default function Client() {
  return (
    <>
      <ClientContent />
      {/* <Overlay /> */}
    </>
  )
}
