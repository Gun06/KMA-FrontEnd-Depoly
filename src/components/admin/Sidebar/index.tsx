'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import logoImage from '@/assets/images/main/logo.jpg';
import { ADMIN_NAV_ITEMS, findActiveAdminChild } from '@/lib/admin/navItems';

export const ADMIN_SIDEBAR_WIDTH = 220;

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname() ?? '';
  const active = findActiveAdminChild(pathname);
  const activeGroup = active?.item.name;

  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(activeGroup ? [activeGroup] : [])
  );

  React.useEffect(() => {
    if (!activeGroup) return;
    setExpanded((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)));
  }, [activeGroup]);

  const toggle = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[35] bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1F242D] text-white transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: ADMIN_SIDEBAR_WIDTH }}
        aria-label="관리자 메뉴"
      >
        <Link
          href="/admin"
          className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 px-4 hover:opacity-90"
        >
          <Image src={logoImage} alt="전국마라톤협회 로고" width={26} height={26} className="rounded-full" />
          <span className="font-giants text-[15px] whitespace-nowrap">전마협 관리자</span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isOpen = expanded.has(item.name);
            const isActiveGroup = active?.item.name === item.name;
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggle(item.name)}
                  className={clsx(
                    'flex h-10 w-full items-center gap-2.5 px-4 text-[13px] transition-colors hover:bg-white/[0.06]',
                    isActiveGroup ? 'text-white' : 'text-white/75'
                  )}
                  aria-expanded={isOpen}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown
                    className={clsx('h-3.5 w-3.5 shrink-0 text-white/50 transition-transform', isOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <ul className="pb-1">
                    {item.children.map((child) => {
                      const isActive = active?.child.href === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => {
                              if (window.matchMedia('(max-width: 1023px)').matches) onClose();
                            }}
                            className={clsx(
                              'flex h-9 items-center border-l-2 pl-[42px] pr-4 text-[13px] transition-colors',
                              isActive
                                ? 'border-[#256EF4] bg-[#256EF4]/20 text-white'
                                : 'border-transparent text-white/60 hover:bg-white/[0.06] hover:text-white'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
