'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import ConfirmModal from '@/components/common/Modal/ConfirmModal'
import Pagination from '@/components/common/Pagination/Pagination'
import PaginationBar from '@/components/common/Pagination/PaginationBar'
import { useGlobalNotifications, useEventNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from './hooks/useNotifications'
import type { NotificationItem } from './types/notification'
import { useAuthStore } from '@/stores/authStore'

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
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [notificationType, setNotificationType] = useState<'GLOBAL' | 'EVENT'>('GLOBAL')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 알림 목록 조회 (타입에 따라)
  const { data: globalData, isLoading: globalLoading } = useGlobalNotifications(page, pageSize)
  const { data: eventData, isLoading: eventLoading } = useEventNotifications(page, pageSize)
  
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
    globalData?.content
      ? globalData.content.filter((n) => isUnreadNotification(n)).length
      : 0
  const eventUnreadCount =
    eventData?.content
      ? eventData.content.filter((n) => isUnreadNotification(n)).length
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
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-giants-bold mb-2 text-black">
            <span className="text-blue-600">Run </span>
            Together, <span className="text-blue-600">Grow </span>Together!
          </h1>
          <p className="text-xl font-bold text-black">{user?.account || '회원'}님!</p>
        </div>

        {/* 탭 네비게이션 */}
        <MypageTabs />

        {/* 섹션 타이틀 */}
        <div className="mt-8 mb-4">
          <h2 className="text-xl sm:text-2xl font-giants-bold text-gray-900 mb-3">알림</h2>
          {/* 알림 타입 탭 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNotificationType('GLOBAL')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  notificationType === 'GLOBAL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체알림 {globalUnreadCount > 0 && `(${globalUnreadCount})`}
              </button>
              <button
                type="button"
                onClick={() => setNotificationType('EVENT')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  notificationType === 'EVENT'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {markAllAsRead.isPending ? '처리 중...' : '모두 읽기'}
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 mb-2" />

        {/* 데스크탑 테이블 */}
        <div className="mt-2">
          {isLoading ? (
            <div className="py-16 text-center text-lg text-gray-500">로딩 중...</div>
          ) : (
            <>
              {/* 데스크탑 테이블 */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                        번호
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                        제목
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                        내용
                      </th>
                      {notificationType === 'EVENT' && (
                        <th className="px-6 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                          삭제
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginated.map((n, index) => {
                      // 번호 계산: 전체 개수에서 역순으로 (최신이 큰 번호)
                      const displayNo = totalElements - (page - 1) * pageSize - index
                      return (
                        <tr
                          key={n.id}
                          className={`cursor-pointer ${
                            isUnreadNotification(n) 
                              ? 'bg-blue-50 hover:bg-blue-100/70' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <td className="px-6 py-5 text-gray-900 text-center">
                            {displayNo}
                          </td>
                          <td className="px-6 py-5 text-gray-900 text-center whitespace-nowrap">
                            {(() => {
                              const formatted = formatDate(n.sentAt || n.createdAt)
                              return formatted === '-' ? '-' : formatted.full
                            })()}
                          </td>
                          <td className="px-6 py-5 text-gray-900 text-center font-medium">
                            {n.title}
                          </td>
                          <td className="px-6 py-5 text-gray-900 text-center">
                            {n.body}
                          </td>
                          {notificationType === 'EVENT' && (
                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={(e) => handleDeleteClick(e, n.id)}
                                className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-600 transition-colors"
                                aria-label="삭제"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 형식 */}
              <div className="sm:hidden space-y-3">
                {paginated.map((n, index) => {
                  const formatted = formatDate(n.sentAt || n.createdAt)
                  const isUnread = isUnreadNotification(n)
                  // 번호 계산: 전체 개수에서 역순으로 (최신이 큰 번호)
                  const displayNo = totalElements - (page - 1) * pageSize - index
                  return (
                    <div
                      key={n.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isUnread
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100/70'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">{displayNo}</span>
                            <span className="text-xs text-gray-400">
                              {formatted === '-' ? '-' : (
                                <>
                                  <span>{formatted.datePart}</span>
                                  <span className="ml-1">{formatted.timePart}</span>
                                </>
                              )}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1 break-words">
                            {n.title}
                          </h3>
                          <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">
                            {n.body}
                          </p>
                        </div>
                        {notificationType === 'EVENT' && (
                          <button
                            onClick={(e) => handleDeleteClick(e, n.id)}
                            className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-600 transition-colors"
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
            </>
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
            />
          </div>
        )}

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
      </div>
    </SubmenuLayout>
  )
}

// 준비중 오버레이 (화면 상단 블러 + 안내)
function Overlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
      <div className="rounded-xl border border-gray-200 bg-white shadow-md px-6 py-4 text-gray-800 font-semibold">
        준비중인 페이지입니다.
      </div>
    </div>
  )
}

export default function Client() {
  return (
    <>
      <ClientContent />
      {/* <Overlay /> */}
    </>
  )
}
