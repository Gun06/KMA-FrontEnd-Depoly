'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel'
import { useMyProfile, useUnreadCount } from '../shared'

export default function ProfileManageFrame({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, data } = useMyProfile()
  const unreadCount = useUnreadCount()

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '프로필 관리',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <ProfileInfoPanel
            name={data?.name || user?.account}
            account={data?.account || user?.account}
            role={user?.role}
            statusText="활성"
            unreadCountText={`${unreadCount}건`}
            onEditClick={() => router.push('/mypage/profile/modify-profile')}
          />

          <div className="order-2 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
