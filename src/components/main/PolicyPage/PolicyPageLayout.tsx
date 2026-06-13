'use client'

import Link from 'next/link'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'

export type PolicyTab = 'terms' | 'privacy' | 'email'

export type PolicyTocItem = {
  id: string
  label: string
}

const POLICY_TABS: { id: PolicyTab; href: string; label: string; shortLabel: string }[] = [
  { id: 'terms', href: '/terms', label: '이용약관', shortLabel: '이용약관' },
  { id: 'privacy', href: '/privacy', label: '개인정보취급방침', shortLabel: '개인정보' },
  {
    id: 'email',
    href: '/email-policy',
    label: '이메일 주소 무단 수집 거부',
    shortLabel: '이메일거부',
  },
]

interface PolicyPageLayoutProps {
  activeTab: PolicyTab
  title: string
  tocItems?: PolicyTocItem[]
  children: React.ReactNode
}

export function PolicyPageLayout({
  activeTab,
  title,
  tocItems = [],
  children,
}: PolicyPageLayoutProps) {
  return (
    <SubmenuLayout
      wide
      breadcrumb={{
        mainMenu: '이용안내',
        subMenu: POLICY_TABS.find((tab) => tab.id === activeTab)?.label ?? title,
      }}
    >
      <div className="w-full">
        <nav
          className="flex overflow-x-auto border border-gray-200 rounded-t-xl bg-white"
          aria-label="정책 문서"
        >
          {POLICY_TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-0 flex-1 border-r border-gray-200 px-3 py-3.5 text-center text-sm transition-colors last:border-r-0 sm:px-4 sm:text-[15px] ${
                  isActive
                    ? 'bg-gray-900 font-semibold text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <header className="mb-10 border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
              {title}
            </h2>
          </header>

          {tocItems.length > 0 && (
            <nav
              className="mb-12 rounded-lg border border-gray-200 bg-gray-50/60 px-5 py-6 sm:px-7 sm:py-7"
              aria-label="목차"
            >
              <ul className="grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-gray-700 transition-colors hover:text-gray-900 hover:underline sm:text-[15px]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <article className="text-[15px] leading-[1.85] text-gray-600 sm:text-base">
            {children}
          </article>
        </div>
      </div>
    </SubmenuLayout>
  )
}

export function PolicyIntro({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-12 whitespace-pre-line text-gray-600 leading-relaxed">{children}</p>
  )
}

function renderContentBlock(block: string, key: number) {
  const lines = block.split('\n').filter((line) => line.trim())

  if (lines.length > 1 && lines.every((line) => /^[-•]\s/.test(line))) {
    return (
      <ul key={key} className="list-disc space-y-1.5 pl-5">
        {lines.map((line) => (
          <li key={line}>{line.replace(/^[-•]\s/, '')}</li>
        ))}
      </ul>
    )
  }

  if (lines.length > 1 && lines.every((line) => /^\d+\.\s/.test(line))) {
    return (
      <ol key={key} className="list-decimal space-y-1.5 pl-5">
        {lines.map((line) => (
          <li key={line}>{line.replace(/^\d+\.\s/, '')}</li>
        ))}
      </ol>
    )
  }

  return (
    <p key={key} className="whitespace-pre-line">
      {block}
    </p>
  )
}

export function PolicyBody({ content }: { content: string }) {
  const blocks = content.split('\n\n').filter((block) => block.trim())

  return <div className="space-y-4">{blocks.map(renderContentBlock)}</div>
}

export function PolicySection({
  id,
  title,
  children,
  content,
}: {
  id: string
  title: string
  children?: React.ReactNode
  content?: string
}) {
  return (
    <section id={id} className="scroll-mt-32 mb-14 last:mb-0">
      <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">{title}</h3>
      {content ? <PolicyBody content={content} /> : children}
    </section>
  )
}

export function PolicyChapter({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 mb-16 last:mb-0">
      <h3 className="mb-8 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900 sm:text-xl">
        {title}
      </h3>
      <div className="space-y-9">{children}</div>
    </section>
  )
}

export function PolicyArticle({
  title,
  content,
  children,
}: {
  title: string
  content?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <h4 className="mb-2.5 font-semibold text-gray-900">{title}</h4>
      {content ? <PolicyBody content={content} /> : children}
    </div>
  )
}

export function PolicyCallout({
  children,
  variant = 'warning',
}: {
  children: React.ReactNode
  variant?: 'warning' | 'info'
}) {
  const styles =
    variant === 'warning'
      ? 'border-orange-200 bg-orange-50 text-orange-900'
      : 'border-gray-200 bg-gray-50 text-gray-700'

  return (
    <aside
      className={`rounded-lg border px-5 py-4 text-sm font-medium sm:text-[15px] ${styles}`}
    >
      {children}
    </aside>
  )
}

export function PolicyContactBox({
  id,
  title,
  content,
  children,
}: {
  id: string
  title: string
  content?: string
  children?: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 mt-4 rounded-lg border border-gray-200 bg-gray-50 px-6 py-7 sm:px-8"
    >
      <h3 className="mb-4 text-lg font-bold text-gray-900">{title}</h3>
      {content ? <PolicyBody content={content} /> : children}
    </section>
  )
}
