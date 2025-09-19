'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MypageTabsProps {
  className?: string
}

export default function MypageTabs({ className = '' }: MypageTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { key: 'applications', label: '마라톤 신청내역', href: '/mypage/applications' },
    { key: 'certificates', label: '기록증', href: '/mypage/certificates' },
    { key: 'points', label: '포인트 현황', href: '/mypage/points' }
  ]

  return (
    <div className={`bg-white border border-gray-300 rounded-xl px-2 sm:px-4 py-3 flex divide-x divide-gray-200 ${className}`}>
      {tabs.map((tab, idx) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex-1 text-center px-3 sm:px-6 text-sm sm:text-base ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
