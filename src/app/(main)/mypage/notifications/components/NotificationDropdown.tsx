'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useGlobalNotifications, useEventNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '../hooks/useNotifications';
import type { NotificationItem } from '../types/notification';

interface NotificationDropdownProps {
  isLoggedIn: boolean;
  userAccount?: string;
}

// 알림 날짜 포맷 함수
function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

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

export function NotificationDropdown({ isLoggedIn, userAccount: _userAccount }: NotificationDropdownProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<'GLOBAL' | 'EVENT'>('GLOBAL');

  // 알림 관련 훅
  const { data: globalData, isLoading: globalLoading } = useGlobalNotifications(1, 20);
  const { data: eventData, isLoading: eventLoading } = useEventNotifications(1, 20);
  
  const notificationsData = notificationType === 'GLOBAL' ? globalData : eventData;
  const notificationsLoading = notificationType === 'GLOBAL' ? globalLoading : eventLoading;
  
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAsRead = useMarkNotificationAsRead();

  // 미읽음 알림 개수 계산
  const globalUnreadCount =
    isLoggedIn && globalData?.content
      ? globalData.content.filter((n) => isUnreadNotification(n)).length
      : 0;
  const eventUnreadCount =
    isLoggedIn && eventData?.content
      ? eventData.content.filter((n) => isUnreadNotification(n)).length
      : 0;
  const unreadCount = globalUnreadCount + eventUnreadCount;

  // 알림 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationOpen) {
        const target = event.target as HTMLElement;
        const notificationDropdown = target.closest('[data-notification-dropdown]');
        const notificationButton = target.closest('[data-notification-button]');
        
        if (!notificationDropdown && !notificationButton) {
          setNotificationOpen(false);
        }
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setNotificationOpen(!notificationOpen)}
        data-notification-button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="알림"
        aria-expanded={notificationOpen}
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {/* 미읽음 알림 개수 표시 */}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-[#256EF4] ring-2 ring-white" />
        )}
      </button>

      {/* 알림 드롭다운 */}
      {notificationOpen && (
        <div
          data-notification-dropdown
          className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-[200]"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              읽지 않은 알림{' '}
              <span className="text-blue-600">({unreadCount})</span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
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
                className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markAllAsRead.isPending ? '처리 중...' : '모두 읽음'}
              </button>
            )}
          </div>
          
          {/* 알림 타입 탭 */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationType('GLOBAL');
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  notificationType === 'GLOBAL'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전체알림 {globalUnreadCount > 0 && `(${globalUnreadCount})`}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationType('EVENT');
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  notificationType === 'EVENT'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                대회알림 {eventUnreadCount > 0 && `(${eventUnreadCount})`}
              </button>
            </div>
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <li className="px-4 py-8 text-center text-sm text-gray-500">
                로딩 중...
              </li>
            ) : notificationsData?.content && notificationsData.content.length > 0 ? (
              (() => {
                // 최근 알림 10개 표시 (미읽음 여부와 관계없이)
                const displayNotifications = notificationsData.content.slice(0, 10);
                
                return displayNotifications.map((notification: NotificationItem, index: number, array: NotificationItem[]) => {
                  const isUnread = isUnreadNotification(notification)
                  const prevNotification = index > 0 ? array[index - 1] : null
                  const prevIsUnread = prevNotification ? isUnreadNotification(prevNotification) : false
                  const showDivider = index > 0
                  const isUnreadToUnread = isUnread && prevIsUnread
                  const isReadToRead = !isUnread && !prevIsUnread
                  
                  return (
                    <li
                      key={notification.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        // 미읽음 알림만 읽음 처리
                        if (isUnreadNotification(notification)) {
                          try {
                            await markAsRead.mutateAsync({
                              notificationId: notification.id,
                              type: notification.type || (notificationType === 'EVENT' ? 'PERSONAL' : 'GLOBAL'),
                            });
                          } catch {
                            // 에러는 무시 (이미 읽은 알림일 수 있음)
                          }
                        }
                      }}
                      className={`px-4 py-3 cursor-pointer relative ${
                        isUnreadNotification(notification)
                          ? 'bg-blue-50 hover:bg-blue-100/70'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {showDivider && (
                        <div
                          className={`absolute top-0 left-4 right-4 h-px ${
                            isUnreadToUnread
                              ? 'bg-gray-200' // 미읽음-미읽음: 얇은 회색 줄
                              : isReadToRead
                              ? 'bg-gray-200' // 읽음-읽음: 얇은 회색 줄
                              : 'bg-gray-100' // 읽음-미읽음 또는 미읽음-읽음: 더 연한 회색
                          }`}
                        />
                      )}
                      <p className="text-xs text-gray-400 mb-1">
                        {formatNotificationDate(notification.sentAt || notification.createdAt)}
                      </p>
                      <p className="text-sm text-gray-800 font-medium mb-1 truncate">
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-gray-800 line-clamp-1">
                          {notification.body}
                        </p>
                      )}
                    </li>
                  );
                });
              })()
            ) : (
              <li className="px-4 py-8 text-center text-sm text-gray-500">
                알림이 없습니다.
              </li>
            )}
          </ul>
          <Link
            href="/mypage/notifications"
            onClick={() => setNotificationOpen(false)}
            className="block w-full px-4 py-2.5 text-xs text-center text-gray-500 hover:bg-gray-50 rounded-b-xl"
          >
            알림 전체 보기
          </Link>
        </div>
      )}
    </div>
  );
}
