import React from 'react'
import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import { PopupManager } from '@/components/main/Popup'
import FloatingPanels from '@/components/main/FloatingPanels'
// FaqSection은 개별 페이지에서 필요 시 렌더링합니다.

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className="flex-1"
        style={{ paddingTop: 'var(--kma-main-header-offset, 64px)' }}
      >
        {children}
      </main>
      <Footer />
      {/* 팝업 컴포넌트 */}
      <PopupManager />
      {/* 우측 플로팅 패널 — 대회안내 + 스폰서 (모든 페이지 공통) */}
      <FloatingPanels />
    </div>
  )
} 