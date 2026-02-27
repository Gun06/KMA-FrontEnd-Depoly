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

  // 최근 대회 (최근 4개) - EventRow 형식으로 변환
  const recentEvents: EventRow[] = React.useMemo(() => {
    if (!eventContent.length) return [];
    return eventContent
      .slice(0, 5)
      .map(transformAdminEventToEventRow);
  }, [eventContent]);

  // 최근 문의사항 (최근 4개)
  const recentInquiries = ((inquiryData as any)?.content || []).slice(0, 4);

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

  const summaryQueues = [
    {
      title: '전체 대회',
      count: eventsLoading ? '...' : totalEvents.toLocaleString(),
      href: allEventsHref,
    },
    {
      title: '접수중인 대회',
      count: eventsLoading ? '...' : openEvents.toLocaleString(),
      href: openEventsHref,
    },
    {
      title: '마감된 대회',
      count: eventsLoading ? '...' : closedEvents.toLocaleString(),
      href: closedEventsHref,
    },
  ];

  const inquirySummaryItems = [
    {
      title: '전체 문의사항',
      count: inquiriesLoading ? '...' : totalInquiries.toLocaleString(),
      href: '/admin/boards/inquiry/all',
    },
    {
      title: '미답변 문의',
      count: inquiriesLoading ? '...' : unansweredInquiries.toLocaleString(),
      href: '/admin/boards/inquiry/all?isAnswered=false',
    },
  ];

  return (
    <section className="-mt-6 w-full max-w-[1920px] mx-auto px-4 md:px-6 pt-0 pb-16 md:pb-20 space-y-8 md:space-y-10">
      <header className="rounded-b-3xl border border-slate-900/10 border-t-0 bg-slate-900 px-6 py-6 text-white shadow-xl shadow-slate-900/10 md:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-300">ADMIN CONTROL CENTER</p>
            <h1 className="mt-2 font-pretendard-extrabold text-[26px] md:text-[34px] leading-tight text-white">
              관리자 대시보드
            </h1>
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
            title="빠른 실행"
            description="주요 관리 기능으로 즉시 이동합니다."
            hideHeader
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
            hideHeader
          >
            {eventsLoading ? (
              <PanelFallback label="로딩 중..." />
            ) : recentEvents.length === 0 ? (
              <PanelFallback label="등록된 대회가 없습니다." />
            ) : (
              <div>
                <div className="space-y-2">
                  {recentEvents.map((event: EventRow) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:bg-slate-50 transition-colors"
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
                <div className="mt-3 flex justify-end">
                  <Link
                    href="/admin/events/management"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    더보기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </SectionPanel>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <SectionPanel
            title="처리 대기 큐"
            description="우선 확인이 필요한 운영 업무입니다."
            hideHeader
          >
            <div className="space-y-2">
              {summaryQueues.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 hover:bg-slate-100 transition-colors"
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
            hideHeader
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-end justify-between">
                <p className="text-sm font-medium text-slate-600">답변 완료율</p>
                <p className="text-2xl font-bold text-slate-900">
                  {inquiriesLoading ? '...' : `${responseRate.toFixed(1)}%`}
                </p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                  style={{ width: `${Math.min(Math.max(responseRate, 0), 100)}%` }}
                />
              </div>
              <div className="mt-3 space-y-2">
                {inquirySummaryItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{item.title}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {inquiriesLoading ? (
                  <PanelFallback label="로딩 중..." />
                ) : recentInquiries.length === 0 ? (
                  <PanelFallback label="문의사항이 없습니다." />
                ) : (
                  recentInquiries.map((inquiry: any) => (
                    <Link
                      key={inquiry.id}
                      href={getInquiryLink(inquiry)}
                      className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:bg-slate-50 transition-colors"
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
                  ))
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/admin/boards/inquiry"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  더보기
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
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
    blue: 'border-blue-300/20 bg-blue-500/15 text-blue-200',
    red: 'border-rose-300/20 bg-rose-500/15 text-rose-200',
    green: 'border-emerald-300/20 bg-emerald-500/15 text-emerald-200',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-medium">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function SectionPanel({
  title,
  description,
  href,
  hideHeader = false,
  showFloatingTitle = true,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  hideHeader?: boolean;
  showFloatingTitle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      {showFloatingTitle ? (
        <div className="absolute -top-3 left-4 px-2 py-0 bg-white text-sm font-extrabold text-slate-800">
          {title}
        </div>
      ) : null}
      {!hideHeader ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
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
      className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300"
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
