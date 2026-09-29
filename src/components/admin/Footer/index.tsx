'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/utils/cn'

const POLICY_LINKS: { href: string; label: string }[] = [
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보취급방침' },
  { href: '/email-policy', label: '이메일 무단수집거부' },
]

interface AdminFooterProps {
  /** 카드형 회색 바탕 라우트에서 배경을 이어 붙임 */
  muted?: boolean
}

export default function AdminFooter({ muted = false }: AdminFooterProps) {
  return (
    <footer className={cn('border-t border-gray-200', muted ? 'bg-[#F4F5F7]' : 'bg-white')}>
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-1.5 px-4 py-3 text-[12px] text-gray-400 sm:flex-row sm:items-center sm:gap-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-medium text-gray-500">전국마라톤협회 관리자</span>
          <span className="text-gray-300" aria-hidden>|</span>
          <span>© {new Date().getFullYear()} RUN1080 Inc.</span>
        </p>
        <nav className="flex items-center gap-3 sm:ml-auto" aria-label="정책 링크">
          {POLICY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              className="transition-colors hover:text-gray-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
