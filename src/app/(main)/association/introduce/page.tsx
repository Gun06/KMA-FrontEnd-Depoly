'use client';

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { AssociationIntroduceView } from '@/components/main/association/introduce/AssociationIntroduceView';

export default function IntroducePage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '전마협',
        subMenu: '협회 소개',
      }}
    >
      <AssociationIntroduceView />
    </SubmenuLayout>
  );
}
