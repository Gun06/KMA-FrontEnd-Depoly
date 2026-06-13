import React from 'react'
import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import { PopupManager } from '@/components/main/Popup'
import FloatingPanels from '@/components/main/FloatingPanels'
import { FloatingVisitorCount } from '@/components/common/VisitorCount'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main
          className="flex-1"
          style={{ paddingTop: 'var(--kma-main-header-offset, 64px)' }}
        >
          {children}
        </main>
        <div data-kma-footer-zone className="relative shrink-0">
          <Footer />
        </div>
        <PopupManager />
      </div>
      {/* fixed 플로팅 — 레이아웃 flex 밖, 방문자 위젯과 동일 stacking */}
      <FloatingPanels />
      <FloatingVisitorCount variant="main" />
    </>
  )
} 