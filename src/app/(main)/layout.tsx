import React from 'react'
import MainLayout from '@/layouts/main/MainLayout'

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
