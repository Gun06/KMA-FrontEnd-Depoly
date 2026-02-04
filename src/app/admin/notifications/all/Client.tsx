'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import Button from '@/components/common/Button/Button';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import { useGlobalNotifications, convertNotificationApiToRow } from '../hooks/useNotifications';
import type { NotificationRow } from '../types/notification';
import NotificationDetailModal from '../components/NotificationDetailModal';

export default function Client() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 전체 유저 알림 목록 조회
  const { data: notificationData, isLoading } = useGlobalNotifications(1, 100);

  const notifications = React.useMemo<NotificationRow[]>(() => {
    if (!notificationData?.content) return [];
    return notificationData.content.map((item, index) =>
      convertNotificationApiToRow(item, index, notificationData.totalElements)
    );
  }, [notificationData]);

  const handleRegister = () => {
    router.push('/admin/notifications/all/register');
  };

  const shorten = (s: string, max = 50) => (s.length > max ? s.slice(0, max) + '...' : s);

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
      width: 80,
      align: 'center',
      render: (r) => <span className="font-medium">{r.rowNum ?? '-'}</span>,
    },
    {
      key: 'title',
      header: '제목',
      width: 200,
      align: 'left',
      className: 'text-left',
      render: (r) => (
        <span className="truncate block" title={r.title}>
          {shorten(r.title, 25)}
        </span>
      ),
    },
    {
      key: 'content',
      header: '내용',
      width: 400,
      align: 'left',
      className: 'text-left cursor-pointer hover:text-blue-600',
      render: (r) => (
        <span 
          className="truncate block" 
          title={r.content}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(r);
          }}
        >
          {shorten(r.content, 50)}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: '전송일',
      width: 120,
      align: 'center',
      className: 'text-gray-600 whitespace-nowrap',
      render: (r) => formatDate(r.sentAt),
    },
  ], []);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">전체유저 알림 관리</h3>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              tone="primary" 
              shape="rounded"
              className="!border-[#256EF4] bg-[#F0F5FF] !text-[#1E5EFF] hover:bg-[#E8F2FF]"
              onClick={handleRegister}
            >
              등록하기
            </Button>
            <Link href="/admin/notifications">
              <Button size="sm" tone="competition">대회 알림 관리하기 &gt;</Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">알림 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">전체유저 알림 관리</h3>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            tone="primary" 
            shape="rounded"
            className="!border-[#256EF4] !bg-[#F8FAFF] !text-[#1E5EFF] hover:!bg-[#F0F5FF]"
            onClick={handleRegister}
          >
            등록하기
          </Button>
          <Link href="/admin/notifications">
            <Button size="sm" tone="competition">대회 알림 관리하기 &gt;</Button>
          </Link>
        </div>
      </div>

      {/* 알림 목록 테이블 */}
      {notifications.length === 0 ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500">전송된 알림이 없습니다.</div>
        </div>
      ) : (
        <AdminTable<NotificationRow>
          columns={columns}
          rows={notifications}
          rowKey={(row, idx) => row.id || `notification-${idx}`}
          minWidth={1200}
          onRowClick={handleRowClick}
          pagination={{
            page: 1,
            pageSize: 100,
            total: notificationData?.totalElements || 0,
            onChange: () => {},
            align: 'center',
          }}
        />
      )}

      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </div>
  );
}
