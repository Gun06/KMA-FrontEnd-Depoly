'use client';

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import ShopPreview from '../ShopPreview';

export default function MerchandisePage() {
  const handleVisitShop = () => {
    window.open('https://worldrun1080.com/shop/', '_blank', 'noopener,noreferrer');
  };

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '쇼핑몰',
        subMenu: '월드런 쇼핑몰',
      }}
    >
      <ShopPreview onVisitShop={handleVisitShop} />
    </SubmenuLayout>
  );
}
