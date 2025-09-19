'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import ShopPreview from '../ShopPreview'
import Head from 'next/head'

export default function MerchandisePage() {
  const handleVisitShop = () => {
    window.open('https://worldrun1080.com/shop/', '_blank', 'noopener,noreferrer')
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "쇼핑몰",
        subMenu: "월드런 쇼핑몰"
      }}
    >
      <Head>
        <link rel="dns-prefetch" href="//worldrun1080.com" />
        <link rel="preconnect" href="https://worldrun1080.com" crossOrigin="anonymous" />
      </Head>
      <div className="py-8">
        <ShopPreview onVisitShop={handleVisitShop} />
      </div>
    </SubmenuLayout>
  )
}
