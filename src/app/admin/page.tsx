'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, FileText, Plus, ArrowRight, Clock } from 'lucide-react';
import { useAdminEventList, transformAdminEventToEventRow } from '@/services/admin';
import { useAllInquiries } from '@/hooks/useInquiries';
import type { AdminEventItem } from '@/types/Admin';
import RegistrationStatusBadge from '@/components/common/Badge/RegistrationStatusBadge';
import type { EventRow } from '@/components/admin/events/EventTable';

export default function AdminHomePage() {
  // 대회 목록 조회 (통계용)
  const { data: eventData, isLoading: eventsLoading } = useAdminEventList({ page: 1, size: 100 });
  
  // 문의사항 목록 조회 (통계용 - 전체 데이터를 가져오기 위해 size를 크게 설정)
  const { data: inquiryData, isLoading: inquiriesLoading } = useAllInquiries({ page: 1, size: 10000 });

  // 통계 계산
  const totalEvents = (eventData as any)?.totalElements || 0;
  const eventContent = React.useMemo(() => (eventData as any)?.content || [], [eventData]);
  const openEvents = React.useMemo(() => eventContent.filter(
    (event: AdminEventItem) => event.eventStatus === 'OPEN'
  ).length, [eventContent]);
  const totalInquiries = (inquiryData as any)?.totalElements || 0;
  const unansweredInquiries = ((inquiryData as any)?.content || []).filter(
    (item: any) => !item?.answer || !item?.answered
  ).length;

  // 전체 대회 카드 href (대회 목록 페이지로 이동, 필터 없음)
  const allEventsHref = '/admin/applications/management';

  // 접수중인 대회 카드 href (대회 목록 페이지로 이동, 접수중 필터 적용)
  const openEventsHref = '/admin/applications/management?status=ing';

  // 최근 대회 (최근 5개) - EventRow 형식으로 변환
  const recentEvents: EventRow[] = React.useMemo(() => {
    if (!eventContent.length) return [];
    return eventContent
      .slice(0, 5)
      .map(transformAdminEventToEventRow);
  }, [eventContent]);

  // 최근 문의사항 (최근 5개)
  const recentInquiries = ((inquiryData as any)?.content || []).slice(0, 5);

  // 문의사항 링크 생성 함수 (main 또는 events 경로 판단)
  const getInquiryLink = React.useCallback((inquiry: any) => {
    // eventName이 있으면 이벤트 문의, 없으면 메인 문의
    if (inquiry.eventName && eventContent.length > 0) {
      // eventName으로 대회 목록에서 eventId 찾기
      const matchedEvent = eventContent.find((event: AdminEventItem) => 
        event.nameKr === inquiry.eventName
      );
      if (matchedEvent) {
        return `/admin/boards/inquiry/events/${matchedEvent.id}/${inquiry.id}`;
      }
    }
    // 메인 문의 또는 매칭되는 대회가 없는 경우
    return `/admin/boards/inquiry/main/${inquiry.id}`;
  }, [eventContent]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-10">
      {/* 페이지 제목 */}
      <div className="mb-8">
        <h1 className="font-pretendard-extrabold text-[24px] md:text-[32px] text-gray-900">
          관리자 대시보드
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base">
          전국마라톤협회 관리 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="전체 대회"
          value={eventsLoading ? '...' : totalEvents.toLocaleString()}
          icon={Calendar}
          color="blue"
          href={allEventsHref}
        />
        <StatCard
          title="접수중인 대회"
          value={eventsLoading ? '...' : openEvents.toLocaleString()}
          icon={Calendar}
          color="green"
          href={openEventsHref}
        />
        <StatCard
          title="전체 문의사항"
          value={inquiriesLoading ? '...' : totalInquiries.toLocaleString()}
          icon={FileText}
          color="orange"
          href="/admin/boards/inquiry"
        />
        <StatCard
          title="미답변 문의"
          value={inquiriesLoading ? '...' : unansweredInquiries.toLocaleString()}
          icon={FileText}
          color="red"
          href="/admin/boards/inquiry/all?isAnswered=false"
        />
      </div>

      {/* 빠른 액세스 */}
      <div className="mb-8">
        <h2 className="font-pretendard-bold text-[18px] md:text-[20px] text-gray-900 mb-4">
          빠른 액세스
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAccessCard
            title="대회 등록"
            description="새로운 대회를 등록합니다"
            href="/admin/events/register"
            icon={Plus}
            color="blue"
          />
          <QuickAccessCard
            title="신청자 관리"
            description="참가 신청자를 관리합니다"
            href="/admin/applications/management"
            icon={Users}
            color="green"
          />
          <QuickAccessCard
            title="문의사항 관리"
            description="사용자 문의사항을 확인합니다"
            href="/admin/boards/inquiry"
            icon={FileText}
            color="orange"
          />
          <QuickAccessCard
            title="대회 관리"
            description="등록된 대회를 관리합니다"
            href="/admin/events/management"
            icon={Calendar}
            color="purple"
          />
          <QuickAccessCard
            title="공지사항 관리"
            description="공지사항을 작성하고 관리합니다"
            href="/admin/boards/notice"
            icon={FileText}
            color="indigo"
          />
          <QuickAccessCard
            title="회원 관리"
            description="개인 및 단체 회원을 관리합니다"
            href="/admin/users/individual"
            icon={Users}
            color="teal"
          />
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 대회 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pretendard-bold text-[18px] md:text-[20px] text-gray-900">
              최근 등록된 대회
            </h2>
            <Link
              href="/admin/events/management"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {eventsLoading ? (
            <div className="text-gray-500 text-center py-8">로딩 중...</div>
          ) : recentEvents.length === 0 ? (
            <div className="text-gray-500 text-center py-8">등록된 대회가 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event: EventRow) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span>{event.place}</span>
                      </div>
                    </div>
                    <RegistrationStatusBadge status={event.applyStatus} size="smd" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 최근 문의사항 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pretendard-bold text-[18px] md:text-[20px] text-gray-900">
              최근 문의사항
            </h2>
            <Link
              href="/admin/boards/inquiry"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {inquiriesLoading ? (
            <div className="text-gray-500 text-center py-8">로딩 중...</div>
          ) : recentInquiries.length === 0 ? (
            <div className="text-gray-500 text-center py-8">문의사항이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inquiry: any) => (
                <Link
                  key={inquiry.id}
                  href={getInquiryLink(inquiry)}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-1">
                        {inquiry.title || '제목 없음'}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{inquiry.authorName || '익명'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {inquiry.createdAt
                            ? formatDate(inquiry.createdAt)
                            : '-'}
                        </span>
                      </div>
                    </div>
                    {inquiry.answer || inquiry.answered ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        답변
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        미답변
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const content = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

// 빠른 액세스 카드 컴포넌트
function QuickAccessCard({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'teal';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    teal: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
  };

  return (
    <Link
      href={href}
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Link>
  );
}
