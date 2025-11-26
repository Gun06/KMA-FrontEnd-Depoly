'use client';

import { useRouter } from 'next/navigation';
import { BoardEventList } from '@/components/admin/boards/BoardEventList';
import { InquiryToggleTabs } from '@/components/admin/boards/inquiry/InquiryToggleTabs';

export default function InquiryClient() {
  const router = useRouter();

  return (
    <BoardEventList
      title={undefined}
      basePath="inquiry"
      titleAddon={
        <InquiryToggleTabs
          active="event"
          onSelect={(value) => {
            if (value === 'all') router.push('/admin/boards/inquiry/all');
          }}
        />
      }
    />
  );
}
