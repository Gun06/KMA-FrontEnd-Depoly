import React from 'react'
import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import { PopupManager } from '@/components/main/Popup'
// FaqSection은 개별 페이지에서 필요 시 렌더링합니다.

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <Footer />
      {/* 팝업 컴포넌트 */}
      <PopupManager />
    </div>
  )
} 