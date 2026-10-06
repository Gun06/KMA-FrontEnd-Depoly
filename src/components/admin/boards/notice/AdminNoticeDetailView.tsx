'use client';

import React from 'react';
import BoardFileBox from '@/components/admin/boards/BoardFileBox';
import CategoryBadge from '@/components/common/Badge/CategoryBadge';
import type { Category } from '@/components/common/Table/types';
import type { NoticeDetail, NoticeCategory } from '@/services/admin/notices';
import { RichTextContent } from '@/components/common/RichTextContent';
import { prepareHtmlForDisplay } from '@/components/common/TextEditor/utils/prepareHtmlForDisplay';
import { BoardDetailListEditToolbar } from '@/components/admin/boards/BoardAdminToolbar';
import {
  BoardCardTitleBar,
  BoardDetailCard,
  BoardDetailHeader,
  BoardDetailPage,
  BoardDetailSection,
} from '@/components/admin/boards/BoardDetailFrame';

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function mapAttachmentFiles(detail: NoticeDetail) {
  return (detail.attachmentUrls || detail.files || [])
    ?.filter((url: string) => !url.startsWith('blob:'))
    ?.map((url: string, index: number) => {
      const fullUrl = url.startsWith('http')
        ? url
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
      const fileName = url.split('/').pop() || `첨부파일_${index + 1}`;
      return {
        id: fullUrl,
        url: fullUrl,
        name: fileName,
        sizeMB: 1,
      };
    });
}

type Props = {
  detail: NoticeDetail | undefined;
  isLoading: boolean;
  error: Error | null;
  categories?: NoticeCategory[];
  authorFallback: string;
  pageTitle?: string;
  onList: () => void;
  onEdit: () => void;
};

export function AdminNoticeDetailView({
  detail,
  isLoading,
  error,
  categories,
  authorFallback,
  pageTitle = '공지사항',
  onList,
  onEdit,
}: Props) {
  const displayContent = React.useMemo(() => {
    if (!detail?.content) return '';
    return prepareHtmlForDisplay(detail.content);
  }, [detail?.content]);

  if (isLoading) {
    return (
      <BoardDetailPage>
        <BoardDetailCard>
          <BoardCardTitleBar title={pageTitle} action={<BoardDetailListEditToolbar onList={onList} onEdit={onEdit} />} />
          <div className="px-4 py-10 text-center text-sm text-gray-500 sm:px-5">공지사항을 불러오는 중...</div>
        </BoardDetailCard>
      </BoardDetailPage>
    );
  }

  if (error) {
    return (
      <BoardDetailPage>
        <BoardDetailCard>
          <BoardCardTitleBar title={pageTitle} action={<BoardDetailListEditToolbar onList={onList} onEdit={onEdit} />} />
          <div className="px-4 py-10 text-center text-sm text-red-600 sm:px-5">공지사항을 불러오는데 실패했습니다.</div>
        </BoardDetailCard>
      </BoardDetailPage>
    );
  }

  if (!detail) {
    return (
      <BoardDetailPage>
        <BoardDetailCard>
          <BoardCardTitleBar title={pageTitle} action={<BoardDetailListEditToolbar onList={onList} onEdit={onEdit} />} />
          <div className="px-4 py-10 text-center text-sm text-gray-500 sm:px-5">데이터가 없습니다.</div>
        </BoardDetailCard>
      </BoardDetailPage>
    );
  }

  const categoryId = detail.noticeCategoryId || detail.categoryId;
  const categoryName = categoryId
    ? categories?.find((cat) => cat.id === categoryId)?.name
    : undefined;

  return (
    <BoardDetailPage>
      <BoardDetailCard>
        <BoardCardTitleBar title={pageTitle} action={<BoardDetailListEditToolbar onList={onList} onEdit={onEdit} />} />
        <BoardDetailHeader
          badges={
            categoryName ? (
              <CategoryBadge category={categoryName as Category} size="smd" />
            ) : null
          }
          title={detail.title}
          meta={`작성자 ${detail.author || authorFallback} · ${formatDateTime(detail.createdAt)}`}
        />
        <BoardDetailSection>
          <RichTextContent html={displayContent} variant="responsiveCompact" />
        </BoardDetailSection>
        <BoardDetailSection className="border-t border-gray-200 pt-4">
          <BoardFileBox variant="view" dense title="첨부파일" files={mapAttachmentFiles(detail) ?? []} />
        </BoardDetailSection>
      </BoardDetailCard>
    </BoardDetailPage>
  );
}
