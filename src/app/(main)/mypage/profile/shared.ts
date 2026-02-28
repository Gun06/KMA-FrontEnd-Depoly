'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { userApi } from '@/hooks/api.presets'
import { useGlobalNotifications, useEventNotifications } from '../notifications/hooks/useNotifications'
import type { NotificationItem } from '../notifications/types/notification'

export interface ProfileResponse {
  id?: string
  account?: string
  name?: string
  phNum?: string
  birth?: string
  email?: string
  gender?: 'M' | 'F' | string
  address?: string
  addressDetail?: string
  zipCode?: string
  pushAlarmAble?: boolean
}

export function normalizeProfileResponse(data: unknown): ProfileResponse {
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const user = (record.user && typeof record.user === 'object'
    ? record.user
    : record) as Record<string, unknown>

  return {
    id:
      typeof user.id === 'string'
        ? user.id
        : typeof user.userId === 'string'
          ? user.userId
          : undefined,
    account:
      typeof user.account === 'string'
        ? user.account
        : typeof user.accountId === 'string'
          ? user.accountId
          : undefined,
    name: typeof user.name === 'string' ? user.name : undefined,
    phNum: typeof user.phNum === 'string' ? user.phNum : undefined,
    birth: typeof user.birth === 'string' ? user.birth : undefined,
    email: typeof user.email === 'string' ? user.email : undefined,
    gender: typeof user.gender === 'string' ? user.gender : undefined,
    address: typeof user.address === 'string' ? user.address : undefined,
    addressDetail:
      typeof user.addressDetail === 'string' ? user.addressDetail : undefined,
    zipCode: typeof user.zipCode === 'string' ? user.zipCode : undefined,
    pushAlarmAble:
      typeof user.pushAlarmAble === 'boolean'
        ? user.pushAlarmAble
        : typeof record.pushAlarmAble === 'boolean'
          ? (record.pushAlarmAble as boolean)
          : undefined,
  }
}

function isUnreadNotification(notification: NotificationItem): boolean {
  if (notification.isRead !== undefined) return notification.isRead === false
  if (notification.read !== undefined) return notification.read === false
  return true
}

export function useMyProfile() {
  const { user, accessToken, hasHydrated } = useAuthStore()

  const query = useQuery({
    queryKey: ['mypage', 'profile-info'],
    queryFn: async () => {
      const response = await userApi.authGet<unknown>('/api/v1/user/profile-info')
      return normalizeProfileResponse(response)
    },
    enabled: hasHydrated && (Boolean(accessToken) || (typeof window !== 'undefined' && Boolean(localStorage.getItem('kmaAccessToken')))),
    retry: false,
  })

  return { ...query, user }
}

export function useUnreadCount() {
  const { data: globalCountData } = useGlobalNotifications(1, 20)
  const { data: eventCountData } = useEventNotifications(1, 20)
  return (
    (globalCountData?.content
      ? globalCountData.content.filter(n => isUnreadNotification(n)).length
      : 0) +
    (eventCountData?.content
      ? eventCountData.content.filter(n => isUnreadNotification(n)).length
      : 0)
  )
}
