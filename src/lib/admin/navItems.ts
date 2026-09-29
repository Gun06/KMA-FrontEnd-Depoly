import { Users, FileText, Calendar, Database, Bell, UserCog, type LucideIcon } from 'lucide-react';

export type AdminNavChild = { name: string; href: string };
export type AdminNavItem = { name: string; base: string; icon: LucideIcon; children: AdminNavChild[] };

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: '참가신청', base: '/admin/applications', icon: Users, children: [
    { name: '신청자 관리', href: '/admin/applications/management' },
    { name: '현금영수증 관리', href: '/admin/applications/cash-receipt' },
    { name: '기록관리', href: '/admin/applications/records' },
  ]},
  { name: '대회관리', base: '/admin/events', icon: Calendar, children: [
    { name: '대회관리', href: '/admin/events/management' },
    { name: '지역대회관리', href: '/admin/local-events/management' },
    { name: '통계확인', href: '/admin/events/statistics' },
  ]},
  { name: '게시판관리', base: '/admin/boards', icon: FileText, children: [
    { name: '공지사항', href: '/admin/boards/notice' },
    { name: '문의사항', href: '/admin/boards/inquiry' },
    { name: 'FAQ', href: '/admin/boards/faq' },
  ]},
  { name: '회원관리', base: '/admin/users', icon: UserCog, children: [
    { name: '개인 회원관리', href: '/admin/users/individual' },
    { name: '단체 회원관리', href: '/admin/users/organization' },
  ]},
  { name: '콘텐츠관리', base: '/admin/banners', icon: Database, children: [
    { name: '메인 배너등록', href: '/admin/banners/main' },
    { name: '마감임박 대회 지정', href: '/admin/banners/closing-marathon' },
    { name: '스폰서 배너등록', href: '/admin/banners/sponsors' },
    { name: '팝업 등록', href: '/admin/banners/popups' },
    { name: '갤러리 등록', href: '/admin/galleries' },
  ]},
  { name: '알림관리', base: '/admin/notifications', icon: Bell, children: [
    { name: '알림관리', href: '/admin/notifications' },
    { name: '알림등록', href: '/admin/notifications/all/register' },
    { name: '전화번호인증정책', href: '/admin/settings/phone-auth-policy' },
  ]},
];

// 지역대회는 /admin/local-events 아래라 base만으로는 대회관리에 안 잡힌다
export function findActiveAdminChild(pathname: string): { item: AdminNavItem; child: AdminNavChild } | null {
  let best: { item: AdminNavItem; child: AdminNavChild } | null = null;
  for (const item of ADMIN_NAV_ITEMS) {
    for (const child of item.children) {
      const prefix = child.href === '/admin/local-events/management' ? '/admin/local-events' : child.href;
      const hit = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (hit && (!best || child.href.length > best.child.href.length)) best = { item, child };
    }
  }
  return best;
}
