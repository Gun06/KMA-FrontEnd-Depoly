'use client';

import { useParams, useRouter } from 'next/navigation';
import { useNoticeDetail, useNoticeCategories } from '@/hooks/useNotices';
import type { NoticeDetail, NoticeCategory } from '@/services/admin/notices';
import { useAdminAuthStore } from '@/stores';
import { AdminNoticeDetailView } from '@/components/admin/boards/notice/AdminNoticeDetailView';

export default function Page() {
  const { eventId, noticeId } = useParams<{ eventId: string; noticeId: string }>();
  const router = useRouter();

  const { data: detail, isLoading, error } = useNoticeDetail(noticeId) as {
    data: NoticeDetail | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const { data: categories } = useNoticeCategories() as {
    data: NoticeCategory[] | undefined;
  };

  const { user } = useAdminAuthStore();

  return (
    <AdminNoticeDetailView
      detail={detail}
      isLoading={isLoading}
      error={error}
      categories={categories}
      authorFallback={user?.account || '관리자'}
      pageTitle="대회 공지사항"
      onList={() => router.replace(`/admin/boards/notice/events/${eventId}?_r=${Date.now()}`)}
      onEdit={() => router.push(`/admin/boards/notice/events/${eventId}/${noticeId}/edit`)}
    />
  );
}
