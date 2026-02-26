'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, FileText, Plus, ArrowRight, Clock, Image, Bell } from 'lucide-react';
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
  const closedEventsHref = '/admin/applications/management?status=done';

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

  const responseRate = totalInquiries > 0
    ? Number((((totalInquiries - unansweredInquiries) / totalInquiries) * 100).toFixed(1))
    : 0;
  const closedEvents = Math.max(totalEvents - openEvents, 0);

  const kpiCards = [
    {
      title: '전체 대회',
      value: eventsLoading ? '...' : totalEvents.toLocaleString(),
      description: '등록된 전체 대회 수',
      icon: Calendar,
      color: 'blue' as const,
      href: allEventsHref,
    },
    {
      title: '접수중인 대회',
      value: eventsLoading ? '...' : openEvents.toLocaleString(),
      description: '현재 접수 진행중',
      icon: Calendar,
      color: 'green' as const,
      href: openEventsHref,
    },
    {
      title: '전체 문의사항',
      value: inquiriesLoading ? '...' : totalInquiries.toLocaleString(),
      description: '누적 문의 접수',
      icon: FileText,
      color: 'orange' as const,
      href: '/admin/boards/inquiry/all',
    },
    {
      title: '미답변 문의',
      value: inquiriesLoading ? '...' : unansweredInquiries.toLocaleString(),
      description: '우선 확인이 필요한 문의',
      icon: FileText,
      color: 'red' as const,
      href: '/admin/boards/inquiry/all?isAnswered=false',
    },
  ];

  const quickActions = [
    {
      title: '대회 등록',
      description: '새로운 대회 생성',
      href: '/admin/events/register',
      icon: Plus,
      color: 'blue' as const,
    },
    {
      title: '스폰서 관리',
      description: '스폰서 배너 운영',
      href: '/admin/banners/sponsors',
      icon: Image,
      color: 'green' as const,
    },
    {
      title: '알림 관리',
      description: '전체 유저 알림 발송/관리',
      href: '/admin/notifications',
      icon: Bell,
      color: 'orange' as const,
    },
    {
      title: '대회 관리',
      description: '등록 대회 편집/검수',
      href: '/admin/events/management',
      icon: Calendar,
      color: 'purple' as const,
    },
    {
      title: '공지사항 관리',
      description: '공지 작성 및 노출 관리',
      href: '/admin/boards/notice',
      icon: FileText,
      color: 'indigo' as const,
    },
    {
      title: '회원 관리',
      description: '개인/단체 회원 운영',
      href: '/admin/users/individual',
      icon: Users,
      color: 'teal' as const,
    },
  ];

  const priorityQueues = [
    {
      title: '미답변 문의 처리',
      count: inquiriesLoading ? '...' : unansweredInquiries.toLocaleString(),
      href: '/admin/boards/inquiry/all?isAnswered=false',
    },
    {
      title: '접수중 대회 점검',
      count: eventsLoading ? '...' : openEvents.toLocaleString(),
      href: openEventsHref,
    },
    {
      title: '마감 대회 점검',
      count: eventsLoading ? '...' : closedEvents.toLocaleString(),
      href: closedEventsHref,
    },
  ];

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">ADMIN CONTROL CENTER</p>
            <h1 className="mt-2 font-pretendard-extrabold text-[26px] md:text-[34px] leading-tight text-slate-900">
              관리자 대시보드
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600">
              운영 지표, 처리 대기 업무, 최근 활동을 한 화면에서 확인하고 바로 실행할 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <HeaderPill label="문의 응답률" value={inquiriesLoading ? '...' : `${responseRate.toFixed(1)}%`} tone="blue" />
            <HeaderPill label="미답변 문의" value={inquiriesLoading ? '...' : unansweredInquiries.toLocaleString()} tone="red" />
            <HeaderPill label="접수중 대회" value={eventsLoading ? '...' : openEvents.toLocaleString()} tone="green" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <SectionPanel
            title="운영 지표"
            description="핵심 상태를 빠르게 파악하고 상세 화면으로 이동할 수 있습니다."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kpiCards.map((item) => (
                <KpiCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  description={item.description}
                  icon={item.icon}
                  color={item.color}
                  href={item.href}
                />
              ))}
            </div>
          </SectionPanel>

          <SectionPanel
            title="빠른 실행"
            description="주요 관리 기능으로 즉시 이동합니다."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((item) => (
                <QuickActionCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  icon={item.icon}
                  color={item.color}
                />
              ))}
            </div>
          </SectionPanel>

          <SectionPanel
            title="최근 등록된 대회"
            description="최근 등록된 대회의 상태와 주요 정보를 확인합니다."
            href="/admin/events/management"
          >
            {eventsLoading ? (
              <PanelFallback label="로딩 중..." />
            ) : recentEvents.length === 0 ? (
              <PanelFallback label="등록된 대회가 없습니다." />
            ) : (
              <div className="space-y-2">
                {recentEvents.map((event: EventRow) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm md:text-base font-semibold text-slate-900 line-clamp-1">{event.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{event.place}</span>
                      </div>
                    </div>
                    <RegistrationStatusBadge status={event.applyStatus} size="smd" />
                  </Link>
                ))}
              </div>
            )}
          </SectionPanel>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <SectionPanel
            title="처리 대기 큐"
            description="우선 확인이 필요한 운영 업무입니다."
          >
            <div className="space-y-2">
              {priorityQueues.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">{item.title}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </Link>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel
            title="문의 대응 현황"
            description="전체 문의 대비 답변 완료 비율입니다."
            href="/admin/boards/inquiry/all"
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <p className="text-sm font-medium text-slate-600">답변 완료율</p>
                <p className="text-2xl font-bold text-slate-900">
                  {inquiriesLoading ? '...' : `${responseRate.toFixed(1)}%`}
                </p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${Math.min(Math.max(responseRate, 0), 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>전체 문의 {inquiriesLoading ? '...' : totalInquiries.toLocaleString()}</span>
                <span>미답변 {inquiriesLoading ? '...' : unansweredInquiries.toLocaleString()}</span>
              </div>
            </div>
          </SectionPanel>

          <SectionPanel
            title="최근 문의사항"
            description="최근 유입된 문의를 우선 확인하세요."
            href="/admin/boards/inquiry"
          >
            {inquiriesLoading ? (
              <PanelFallback label="로딩 중..." />
            ) : recentInquiries.length === 0 ? (
              <PanelFallback label="문의사항이 없습니다." />
            ) : (
              <div className="space-y-2">
                {recentInquiries.map((inquiry: any) => (
                  <Link
                    key={inquiry.id}
                    href={getInquiryLink(inquiry)}
                    className="block rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {inquiry.title || '제목 없음'}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <span>{inquiry.authorName || '익명'}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{inquiry.createdAt ? formatDate(inquiry.createdAt) : '-'}</span>
                        </p>
                      </div>
                      {inquiry.answer || inquiry.answered ? (
                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">답변</span>
                      ) : (
                        <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">미답변</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionPanel>
        </aside>
      </div>
    </section>
  );
}

function HeaderPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'blue' | 'red' | 'green';
}) {
  const toneClasses = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    green: 'border-green-100 bg-green-50 text-green-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-medium">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function SectionPanel({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-pretendard-bold text-[18px] md:text-[20px] text-slate-900">{title}</h2>
          <p className="mt-1 text-xs md:text-sm text-slate-500">{description}</p>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// 운영 지표 카드
function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  const content = (
    <div className="h-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-slate-300 hover:bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className="text-2xl md:text-[30px] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}
        >
          <Icon className="w-5 h-5" />
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

function QuickActionCard({
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
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
  };

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm md:text-base line-clamp-1">{title}</h3>
          <p className="text-xs md:text-sm text-slate-600 line-clamp-1">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function PanelFallback({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}
