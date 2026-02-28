'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import ProfileManageFrame from './components/ProfileManageFrame'

const menuItems = [
  {
    href: '/mypage/profile/modify-profile',
    title: '회원정보 수정',
    description: '이름, 생년월일, 연락처, 주소 정보를 수정합니다.',
  },
  {
    href: '/mypage/profile/setting',
    title: '알림 설정',
    description: '푸시 알림 수신 여부를 설정합니다.',
  },
  {
    href: '/mypage/profile/account-id',
    title: '아이디 변경',
    description: '현재 비밀번호 확인 후 아이디를 변경합니다.',
  },
  {
    href: '/mypage/profile/account-password',
    title: '비밀번호 변경',
    description: '현재 비밀번호 확인 후 새 비밀번호로 변경합니다.',
  },
  {
    href: '/mypage/profile/password-reset',
    title: '비밀번호 초기화 신청',
    description: '비밀번호를 잊은 경우 초기화 요청을 진행합니다.',
  },
]

export default function MenuClient() {
  const router = useRouter()

  return (
    <ProfileManageFrame>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => router.push('/mypage/applications')}
          className="ml-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {'< 뒤로가기'}
        </button>
      </div>
    </ProfileManageFrame>
  )
}
