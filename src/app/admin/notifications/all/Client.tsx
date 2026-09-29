'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import Button from '@/components/common/Button/Button';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import { useGlobalNotifications, useDeleteGlobalNotification, convertNotificationApiToRow } from '../hooks/useNotifications';
import type { NotificationRow } from '../types/notification';
import NotificationDetailModal from '../components/NotificationDetailModal';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';

export default function Client() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | number | null>(null);

  // 전체 유저 알림 목록 조회
  const { data: notificationData, isLoading } = useGlobalNotifications(1, 100);
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteGlobalNotification();

  const notifications = React.useMemo<NotificationRow[]>(() => {
    if (!notificationData?.content) return [];
    return notificationData.content.map((item, index) =>
      convertNotificationApiToRow(item, index, notificationData.totalElements)
    );
  }, [notificationData]);

  const handleRegister = () => {
    router.push('/admin/notifications/all/register');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const handleRowClick = (row: NotificationRow) => {
    setSelectedNotification(row);
    setIsModalOpen(true);
  };

  const columns: Column<NotificationRow>[] = React.useMemo(() => [
    {
      key: 'no',
      header: '번호',
      width: 64,
      align: 'center',
      render: (r) => <span className="font-medium">{r.rowNum ?? '-'}</span>,
    },
    {
      key: 'title',
      header: '제목',
      width: 240,
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <span className="block max-w-[240px] truncate" title={r.title}>
          {r.title}
        </span>
      ),
    },
    {
      key: 'content',
      header: '내용',
      align: 'left',
      className: 'text-left cursor-pointer hover:text-blue-600',
      render: (r) => (
        <span 
          className="block max-w-[640px] truncate" 
          title={r.content}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(r);
          }}
        >
          {r.content}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: '전송일',
      width: 110,
      align: 'center',
      className: 'text-gray-600 whitespace-nowrap',
      render: (r) => formatDate(r.sentAt),
    },
    {
      key: 'delete',
      header: '삭제',
      width: 64,
      align: 'center',
      render: (r) => (
        <span
          className="text-[13px] font-medium text-red-500 cursor-pointer hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            setPendingDeleteId(r.id);
            setIsDeleteConfirmOpen(true);
          }}
        >
          삭제
        </span>
      ),
    },
  ], []);

  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-semibold text-gray-900">전체유저 알림 관리</h3>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              tone="primary"
              shape="rounded"
              className="!h-9 !px-3 !text-[13px] !border-[#256EF4] !bg-[#F8FAFF] !text-[#1E5EFF] hover:!bg-[#F0F5FF]"
              onClick={handleRegister}
            >
              등록하기
            </Button>
            <Link href="/admin/notifications">
              <Button size="sm" tone="competition" className="!h-9 !px-3 !text-[13px]">대회 알림 관리하기 &gt;</Button>
            </Link>
          </div>
        </div>
        <AdminTable<NotificationRow>
          dense
          contentMinHeight={null}
          columns={columns}
          rows={notifications}
          rowKey={(row, idx) => row.id || `notification-${idx}`}
          minWidth={1000}
          onRowClick={handleRowClick}
          loadingMessage={isLoading ? '알림 목록을 불러오는 중...' : undefined}
          emptyMessage="전송된 알림이 없습니다."
          pagination={{
            page: 1,
            pageSize: 100,
            total: notificationData?.totalElements || 0,
            onChange: () => {},
            bar: {
              totalTextFormatter: (cnt) => (
                <>
                  총 <b>{cnt.toLocaleString()}</b>건
                </>
              ),
            },
          }}
        />
      </section>

      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            deleteNotification(pendingDeleteId, {
              onSuccess: () => {
                setIsDeleteConfirmOpen(false);
                setPendingDeleteId(null);
              },
            });
          }
        }}
        title="알림 삭제"
        message="해당 알림을 삭제하시겠습니까?"
        smallMessage="푸시 알림은 삭제되지 않으며, 사용자의 알림함에서만 제거됩니다."
        confirmText="삭제"
        cancelText="취소"
        isLoading={isDeleting}
        variant="danger"
        centerAlign={true}
      />
    </main>
  );
}
