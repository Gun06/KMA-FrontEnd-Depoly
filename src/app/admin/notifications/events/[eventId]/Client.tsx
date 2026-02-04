'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button/Button';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import PaymentBadgeApplicants from '@/components/common/Badge/PaymentBadgeApplicants';
import Badge from '@/components/common/Badge/Badge';
import { useEventList } from '@/hooks/useNotices';
import { useEventNotifications, convertNotificationApiToRow } from '../../hooks/useNotifications';
import type { EventListItem, EventListResponse } from '@/types/eventList';
import type { NotificationRow } from '../../types/notification';
import NotificationDetailModal from '../../components/NotificationDetailModal';

export default function Client() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 대회 목록에서 해당 대회 정보 찾기
  const { data: eventListData } = useEventList(1, 100) as {
    data: EventListResponse | undefined;
  };
  const event = eventListData?.content?.find((e: EventListItem) => e.id === eventId);
  const eventName = event?.nameKr ?? `#${eventId}`;

  // 알림 목록 조회
  const { data: notificationData, isLoading } = useEventNotifications(eventId, 1, 100);

  const notifications = React.useMemo<NotificationRow[]>(() => {
    if (!notificationData?.content) return [];
    return notificationData.content.map((item, index) =>
      convertNotificationApiToRow(item, index, notificationData.totalElements)
    );
  }, [notificationData]);

  const handleRegister = () => {
    router.push(`/admin/notifications/events/${eventId}/register`);
  };

  const getPaymentStatusKorean = (status?: string | null): '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료' | '전체' => {
    if (status === null || status === undefined) return '전체';
    switch (status) {
      case 'UNPAID': return '미결제';
      case 'COMPLETED': return '결제완료';
      case 'MUST_CHECK': return '확인필요';
      case 'NEED_PARTITIAL_REFUND': return '차액환불요청';
      case 'NEED_REFUND': return '전액환불요청';
      case 'REFUNDED': return '전액환불완료';
      default: return '전체';
    }
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
      key: 'paymentStatus',
      header: '전송대상',
      width: 120,
      align: 'center',
      render: (r) => {
        const status = getPaymentStatusKorean(r.paymentStatus);
        if (status === '전체') {
          return (
            <Badge variant="soft" tone="primary" size="applicationPill" className="justify-center">
              전체
            </Badge>
          );
        }
        return <PaymentBadgeApplicants payStatus={status} />;
      },
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
          {shorten(r.content, 45)}
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
          <h3 className="text-[16px] font-semibold">
            선택대회:{' '}
            <Link className="text-[#1E5EFF] hover:underline" href={`/admin/notifications/events/${eventId}`}>
              {eventName}
            </Link>
          </h3>
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
            <Link href="/admin/notifications/all">
              <Button size="sm" tone="primary">전체유저 알림 관리하기 &gt;</Button>
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
        <h3 className="text-[16px] font-semibold">
          선택대회:{' '}
          <Link className="text-[#1E5EFF] hover:underline" href={`/admin/notifications/events/${eventId}`}>
            {eventName}
          </Link>
        </h3>

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
          <Link href="/admin/notifications/all">
            <Button size="sm" tone="primary">전체유저 알림 관리하기 &gt;</Button>
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
