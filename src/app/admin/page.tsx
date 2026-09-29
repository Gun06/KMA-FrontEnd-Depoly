'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Plus, ArrowRight, Clock, Image, Bell, BarChart } from 'lucide-react';
import { useAdminEventList, transformAdminEventToEventRow } from '@/services/admin';
import { useAllInquiries } from '@/hooks/useInquiries';
import { useCashReceiptStatistics } from '@/app/admin/api/cashReceipt';
import type { AdminEventItem } from '@/types/Admin';
import RegistrationStatusBadge from '@/components/common/Badge/RegistrationStatusBadge';
import type { EventRow } from '@/components/admin/events/EventTable';
import VisitorTrendPanel from '@/app/admin/components/VisitorTrendPanel';

export default function AdminHomePage() {
  const quickActionsRef = React.useRef<HTMLDivElement>(null);
  const recentEventsRef = React.useRef<HTMLDivElement>(null);
  const [visitorPanelHeight, setVisitorPanelHeight] = React.useState<number | undefined>();

  // 대회 목록 조회 (통계용)
  const { data: eventData, isLoading: eventsLoading } = useAdminEventList({ page: 1, size: 100 });

  // 문의사항 목록 조회 (통계용 - 전체 데이터를 가져오기 위해 size를 크게 설정)
  const { data: inquiryData, isLoading: inquiriesLoading } = useAllInquiries({ page: 1, size: 10000 });
  const { data: cashReceiptStatistics, isLoading: cashReceiptLoading } = useCashReceiptStatistics();

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
      title: '통계확인',
      description: '대회 통계 확인',
      href: '/admin/events/statistics',
      icon: BarChart,
      color: 'purple' as const,
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

  const updateVisitorPanelHeight = React.useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1280) {
      setVisitorPanelHeight(undefined);
      return;
    }
    const quickEl = quickActionsRef.current;
    const recentEl = recentEventsRef.current;
    if (!quickEl || !recentEl) return;

    const gap = 16;
    const height =
      recentEl.getBoundingClientRect().bottom -
      quickEl.getBoundingClientRect().bottom -
      gap;
    setVisitorPanelHeight(Math.max(280, Math.round(height)));
  }, []);

  React.useEffect(() => {
    const run = () => requestAnimationFrame(updateVisitorPanelHeight);
    run();

    window.addEventListener('resize', updateVisitorPanelHeight);
    const observer = new ResizeObserver(updateVisitorPanelHeight);

    if (quickActionsRef.current) observer.observe(quickActionsRef.current);
    if (recentEventsRef.current) observer.observe(recentEventsRef.current);

    return () => {
      window.removeEventListener('resize', updateVisitorPanelHeight);
      observer.disconnect();
    };
  }, [
    updateVisitorPanelHeight,
    eventsLoading,
    inquiriesLoading,
    cashReceiptLoading,
    recentEvents.length,
    totalInquiries,
    unansweredInquiries,
  ]);

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

  const kpis: KpiItem[] = [
    {
      label: '문의 응답률',
      value: inquiriesLoading ? '...' : `${responseRate.toFixed(1)}%`,
      href: '/admin/boards/inquiry/all',
      tone: 'blue',
    },
    {
      label: '미답변 문의',
      value: inquiriesLoading ? '...' : unansweredInquiries.toLocaleString(),
      href: '/admin/boards/inquiry/all?isAnswered=false',
      tone: 'red',
    },
    {
      label: '접수중 대회',
      value: eventsLoading ? '...' : openEvents.toLocaleString(),
      href: openEventsHref,
      tone: 'green',
    },
    {
      label: '현금영수증 대기',
      value: cashReceiptLoading ? '...' : (cashReceiptStatistics?.requestedCount ?? 0).toLocaleString(),
      href: '/admin/applications/cash-receipt?status=REQUESTED',
      tone: 'amber',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-4 px-4 py-4">
      <header className="rounded-lg bg-slate-900 px-5 py-4 text-white shadow-lg shadow-slate-900/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">ADMIN CONTROL CENTER</p>
            <h1 className="mt-1 font-pretendard-extrabold text-[24px] leading-tight md:text-[28px]">
              관리자 대시보드
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          <div ref={quickActionsRef}>
            <SectionPanel title="빠른 실행">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
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
          </div>

          <VisitorTrendPanel panelHeight={visitorPanelHeight} />
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <SectionPanel title="대회 현황" href="/admin/applications/management">
            <div className="grid grid-cols-3 gap-2">
              {summaryQueues.map((item) => (
                <StatTile key={item.title} label={item.title} value={item.count} href={item.href} />
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="현금영수증 현황" href="/admin/applications/cash-receipt">
            <div className="grid grid-cols-3 gap-2">
              <StatTile
                label="전체 건수"
                value={cashReceiptLoading ? '...' : (cashReceiptStatistics?.totalCount ?? 0).toLocaleString()}
                href="/admin/applications/cash-receipt"
              />
              <StatTile
                label="처리 대기"
                value={cashReceiptLoading ? '...' : (cashReceiptStatistics?.requestedCount ?? 0).toLocaleString()}
                href="/admin/applications/cash-receipt?status=REQUESTED"
                tone="amber"
              />
              <StatTile
                label="처리율"
                value={cashReceiptLoading ? '...' : `${(cashReceiptStatistics?.processedPercent ?? 0).toFixed(1)}%`}
                href="/admin/applications/cash-receipt"
              />
            </div>
          </SectionPanel>

          <SectionPanel title="문의 대응 현황" href="/admin/boards/inquiry">
            <div className="space-y-3">
              <div>
                <div className="flex items-end justify-between">
                  <p className="text-[13px] font-medium text-slate-600">답변 완료율</p>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    {inquiriesLoading ? '...' : `${responseRate.toFixed(1)}%`}
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                    style={{ width: `${Math.min(Math.max(responseRate, 0), 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {inquirySummaryItems.map((item) => (
                  <StatTile key={item.title} label={item.title} value={item.count} href={item.href} />
                ))}
              </div>

              <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                {inquiriesLoading ? (
                  <PanelFallback label="로딩 중..." />
                ) : recentInquiries.length === 0 ? (
                  <PanelFallback label="문의사항이 없습니다." />
                ) : (
                  recentInquiries.map((inquiry: any) => (
                    <Link
                      key={inquiry.id}
                      href={getInquiryLink(inquiry)}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-900">
                          {inquiry.title || '제목 없음'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                          <span>{inquiry.authorName || '익명'}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>{inquiry.createdAt ? formatDate(inquiry.createdAt) : '-'}</span>
                        </p>
                      </div>
                      {inquiry.answer || inquiry.answered ? (
                        <span className="shrink-0 rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700">답변</span>
                      ) : (
                        <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">미답변</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </SectionPanel>

          <div ref={recentEventsRef}>
            <SectionPanel title="최근 등록된 대회" href="/admin/events/management">
              {eventsLoading ? (
                <PanelFallback label="로딩 중..." />
              ) : recentEvents.length === 0 ? (
                <PanelFallback label="등록된 대회가 없습니다." />
              ) : (
                <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                  {recentEvents.map((event: EventRow) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900">{event.title}</p>
                        <div className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                          <span className="shrink-0">{formatDate(event.date)}</span>
                          <span>·</span>
                          <span className="truncate">{event.place}</span>
                        </div>
                      </div>
                      <RegistrationStatusBadge status={event.applyStatus} size="dense" className="!w-[72px]" />
                    </Link>
                  ))}
                </div>
              )}
            </SectionPanel>
          </div>
        </aside>
      </div>
    </div>
  );
}

type KpiItem = {
  label: string;
  value: string;
  href: string;
  tone: 'red' | 'amber' | 'green' | 'blue';
};

const KPI_TONE: Record<KpiItem['tone'], string> = {
  blue: 'border-blue-300/20 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25',
  red: 'border-rose-300/20 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
  green: 'border-emerald-300/20 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25',
  amber: 'border-amber-200/20 bg-amber-300/10 text-amber-200 hover:bg-amber-300/20',
};

function KpiCard({ label, value, href, tone }: KpiItem) {
  return (
    <Link
      href={href}
      className={`group min-w-[120px] rounded-md border px-3 py-2 transition-colors ${KPI_TONE[tone]}`}
    >
      <p className="flex items-center gap-1 text-[11px] font-medium">
        {label}
        <ArrowRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-80" />
      </p>
      <p className="mt-0.5 text-[18px] font-bold leading-tight tabular-nums text-white">{value}</p>
    </Link>
  );
}

function StatTile({
  label,
  value,
  href,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  href: string;
  tone?: 'neutral' | 'amber';
}) {
  return (
    <Link
      href={href}
      className={
        tone === 'amber'
          ? 'rounded-md border border-amber-100 bg-amber-50/60 px-3 py-2 transition-colors hover:bg-amber-50'
          : 'rounded-md border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100'
      }
    >
      <p className={`text-[11px] ${tone === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-0.5 text-[15px] font-bold tabular-nums ${tone === 'amber' ? 'text-amber-700' : 'text-slate-900'}`}>
        {value}
      </p>
    </Link>
  );
}

function SectionPanel({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 whitespace-nowrap text-[12px] font-medium text-gray-500 hover:text-blue-600"
          >
            더보기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
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
      className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-semibold text-slate-900">{title}</h3>
        <p className="truncate text-[12px] text-slate-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </Link>
  );
}

function PanelFallback({ label }: { label: string }) {
  return <div className="py-8 text-center text-[13px] text-slate-500">{label}</div>;
}
