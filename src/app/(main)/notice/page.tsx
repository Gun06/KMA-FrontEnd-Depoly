'use client';

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { NoticeBoard } from '@/components/common/Notice';
import { noticeData } from '@/data/notices';

export default function NoticePage() {
  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: number) => {
    // TODO: 상세 페이지로 이동 로직 구현
  };

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "공지사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <NoticeBoard
          data={noticeData}
          onRowClick={handleRowClick}
          pageSize={10}
          pinLimit={3}
          numberDesc={true}
          showPinnedBadgeInNo={true}
          pinnedClickable={true}
        />
      </div>
    </SubmenuLayout>
  );
}
