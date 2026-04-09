// src/components/admin/Navigation/index.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Users, FileText, Calendar, Image, Database, ChevronDown, LucideIcon, Bell } from 'lucide-react';
import clsx from 'clsx';

// 기존 데이터 소스
import { listOrganizations, getOrganizationById } from '@/data/users/organization';
import { listIndividualUsers } from '@/data/users/individual';

// API 훅들
import { useEventList } from '@/hooks/useNotices';
import type { EventListResponse } from '@/types/eventList';
import { useInquiryDetail } from '@/hooks/useInquiries';
import { useLocalEventDetail } from '@/app/admin/local-events/[eventId]/api';
import { useOrganizationDetail } from '@/services/admin/users';

// 공지(기존) 소스 - 유지
import { fetchEventNotices } from '@/components/common/Notice/event';
import { getMainNotices } from '@/components/common/Notice/main';

// 문의 소스 - 유지
import { getEventInquiries } from '@/components/common/Inquiry/event';
import { getMainInquiries } from '@/components/common/Inquiry/main';

// FAQ 소스 (이벤트/메인)
import { getEventFaqs, getHomepageFaqs } from '@/services/admin/faqs';

type Child = { name: string; href: string };
type Item = { name: string; base: string; icon: LucideIcon; children: Child[] };

const NAV_ITEMS: Item[] = [
  { name: '참가신청', base: '/admin/applications', icon: Users, children: [
    { name: '신청자 관리', href: '/admin/applications/management' },
    { name: '현금영수증 관리', href: '/admin/applications/cash-receipt' },
    { name: '기록관리', href: '/admin/applications/records' },
  ]},
  { name: '대회관리', base: '/admin/events', icon: Calendar, children: [
    { name: '대회관리', href: '/admin/events/management' },
    { name: '대회등록', href: '/admin/events/register' },
    { name: '지역대회 관리', href: '/admin/local-events/management' },
    { name: '지역대회 등록', href: '/admin/local-events/register' },
    { name: '통계확인', href: '/admin/events/statistics' },
  ]},
  { name: '게시판관리', base: '/admin/boards', icon: FileText, children: [
    { name: '공지사항', href: '/admin/boards/notice' },
    { name: '문의사항', href: '/admin/boards/inquiry' },
    { name: 'FAQ', href: '/admin/boards/faq' },
  ]},
  { name: '회원관리', base: '/admin/users', icon: Users, children: [
    { name: '개인 회원관리', href: '/admin/users/individual' },
    { name: '단체 회원관리', href: '/admin/users/organization' },
  ]},
  { name: '콘텐츠관리', base: '/admin/banners', icon: Database, children: [
    { name: '메인 배너등록',    href: '/admin/banners/main' },
    { name: '스폰서 배너등록',  href: '/admin/banners/sponsors' },
    { name: '팝업 등록',  href: '/admin/banners/popups' },
    { name: '갤러리 등록', href: '/admin/galleries' },
    ]},
  { name: '알림관리', base: '/admin/notifications', icon: Bell, children: [
    { name: '알림관리', href: '/admin/notifications' },
    { name: '알림등록', href: '/admin/notifications/all/register' },
  ]},
];

export default function AdminNavigation() {
  const router = useRouter();
  const rawPath = usePathname();
  const searchParams = useSearchParams();

  // 경로 보정
  const pathname = useMemo(
    () => (rawPath ? rawPath.replace(/\/+$/, '') || '/' : '/'),
    [rawPath]
  );

  // 1단계
  const currentMenu = useMemo(
    () => NAV_ITEMS.find((i) => {
      // base로 시작하거나 children 중 하나로 시작하는지 확인
      if (pathname.startsWith(i.base)) return true;
      // 지역대회 관련 경로는 /admin/events base를 가진 메뉴에 포함되므로 특별 처리
      if (i.base === '/admin/events' && pathname.startsWith('/admin/local-events')) return true;
      return i.children.some((c) => pathname.startsWith(c.href));
    }) || null,
    [pathname]
  );
  const showNav = !!currentMenu;

  // 2단계
  const safeMenu = currentMenu ?? NAV_ITEMS[0];
  const currentSub =
    // 먼저 정확히 일치하는 것을 찾음
    safeMenu.children.find((c) => pathname === c.href) ??
    // 없으면 더 긴 경로부터 startsWith로 확인
    safeMenu.children
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((c) => {
        // 지역대회 관련 경로는 /admin/local-events/로 시작하는 모든 경로를 "지역대회 관리"로 매칭
        if (c.href === '/admin/local-events/management') {
          return pathname.startsWith('/admin/local-events/');
        }
        return pathname.startsWith(c.href);
      }) ?? safeMenu.children[0];

  // 드롭다운 제어
  const [openSub, setOpenSub] = useState(false);
  const [openEntity, setOpenEntity] = useState(false);
  const [openFourth, setOpenFourth] = useState(false);

  const subRef = useRef<HTMLDivElement>(null);
  const entRef = useRef<HTMLDivElement>(null);
  const fourthRef = useRef<HTMLDivElement>(null);

  const listboxRef = useRef<HTMLDivElement>(null);
  const fourthListRef = useRef<HTMLDivElement>(null);

  const toggleSub = () => setOpenSub((v) => (setOpenEntity(false), setOpenFourth(false), !v));
  const toggleEntity = () => setOpenEntity((v) => (setOpenSub(false), setOpenFourth(false), !v));
  const toggleFourth = () => setOpenFourth((v) => (setOpenSub(false), setOpenEntity(false), !v));

  useEffect(() => {
    setOpenSub(false);
    setOpenEntity(false);
    setOpenFourth(false);
  }, [pathname]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      const outside =
        !subRef.current?.contains(t) &&
        !entRef.current?.contains(t) &&
        !fourthRef.current?.contains(t);
      if (outside) {
        setOpenSub(false);
        setOpenEntity(false);
        setOpenFourth(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (setOpenSub(false), setOpenEntity(false), setOpenFourth(false));
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // ===== 기존 컨텍스트 =====
  // A) 신청자 관리
  const isApplicationsMgmt = /^\/admin\/applications\/management(\/[^/]+)?$/.test(pathname);
  const isApplicationsList = pathname.startsWith('/admin/applications/list');
  const eventIdFromPathA = (() => {
    const m = pathname.match(/^\/admin\/applications\/management\/([^/]+)/);
    return m ? m[1] : null;
  })();

  // 실제 이벤트 목록 API 사용
  const { data: eventListData } = useEventList(1, 100) as { data: EventListResponse | undefined };
  const eventList = useMemo(
    () => {
      if (!eventListData?.content) return [];
      return [...eventListData.content].sort((a, b) => 
        b.no - a.no // no 기준 내림차순 (테이블과 동일)
      );
    },
    [eventListData]
  );

  // /admin/applications/management는 이제 대회 목록 페이지이므로 자동 리다이렉트 제거
  const currentEventA = useMemo(
    () => (eventIdFromPathA ? eventList.find((e) => String(e.id) === String(eventIdFromPathA)) : null),
    [eventIdFromPathA, eventList]
  );

  // B) 단체 상세
  const isOrgDetail = /^\/admin\/users\/organization\/[^/]+$/.test(pathname);
  const orgIdFromPath = (() => {
    const m = pathname.match(/^\/admin\/users\/organization\/([^/]+)$/);
    return m ? m[1] : null;
  })();
  const orgTab = (searchParams.get('tab') ?? 'members') as 'members' | 'apps' | 'settings';

  const { data: orgDetailData } = useOrganizationDetail({ 
    organizationId: orgIdFromPath || '' 
  });

  const orgThirdLabel = useMemo(() => {
    if (!orgDetailData) return null;
    return orgDetailData.groupName;
  }, [orgDetailData]);

  // C) 개인 상세
  const isIndivDetail = /^\/admin\/users\/individual\/\d+\/detail$/.test(pathname);
  const indivIdFromPath = (() => {
    const m = pathname.match(/^\/admin\/users\/individual\/(\d+)\/detail$/);
    return m ? Number(m[1]) : null;
  })();

  type IndivSortKey = 'id' | 'name' | 'birth' | 'member' | 'createdAt';
  const sortFromQS = useMemo(
    () => ((searchParams.get('sort') as IndivSortKey) ?? 'createdAt'),
    [searchParams]
  );
  const orderFromQS = useMemo(
    () => ((searchParams.get('order') as 'asc' | 'desc') ?? 'desc'),
    [searchParams]
  );

  const allIndividuals = useMemo(() => {
    const { rows } = listIndividualUsers({
      query: '',
      field: 'all',
      sortKey: sortFromQS,
      sortDir: orderFromQS,
      memberFilter: '',
      page: 1,
      pageSize: 5000,
    } as Parameters<typeof listIndividualUsers>[0]);
    return rows || [];
  }, [sortFromQS, orderFromQS]);

  const currentIndiv = useMemo(
    () => (indivIdFromPath ? allIndividuals.find((u) => String(u.id) === String(indivIdFromPath)) : null),
    [indivIdFromPath, allIndividuals]
  );
  const indivThirdLabel = useMemo(
    () => (currentIndiv ? `${currentIndiv.name} 상세` : null),
    [currentIndiv]
  );

  // ===== 게시판관리 > 공지사항(기존 유지) =====
  const isBoardsNotice = pathname.startsWith('/admin/boards/notice');
  const matchEventNotice = pathname.match(/^\/admin\/boards\/notice\/events\/(\d+)(?:\/(\d+))?$/);
  const boardsEventId_notice = matchEventNotice ? Number(matchEventNotice[1]) : null;
  const boardsEventNoticeId = matchEventNotice && matchEventNotice[2] ? Number(matchEventNotice[2]) : null;
  const isBoardsMainRoot_notice = /^\/admin\/boards\/notice\/main$/.test(pathname);
  const matchMainNotice = pathname.match(/^\/admin\/boards\/notice\/main\/(\d+)$/);
  const boardsMainNoticeId = matchMainNotice ? Number(matchMainNotice[1]) : null;

  const boardsEventList_notice = useMemo(
    () => {
      if (!eventListData?.content) return [];
      return [...eventListData.content].sort((a, b) => 
        b.no - a.no // no 기준 내림차순 (테이블과 동일)
      );
    },
    [eventListData]
  );
  const boardsCurrentEvent_notice = useMemo(
    () => (boardsEventId_notice ? boardsEventList_notice.find((e) => String(e.id) === String(boardsEventId_notice)) : null),
    [boardsEventId_notice, boardsEventList_notice]
  );
  const boardsEventNotices = useMemo(() => {
    if (!boardsEventId_notice) return [];
    try {
      const { rows } = fetchEventNotices(boardsEventId_notice, 1, 1000);
      return rows || [];
    } catch {
      return [];
    }
  }, [boardsEventId_notice]);
  const boardsMainNotices = useMemo(() => {
    if (!isBoardsNotice) return [];
    try {
      const rows = getMainNotices();
      return rows || [];
    } catch {
      return [];
    }
  }, [isBoardsNotice]);

  // ===== 🔹 게시판관리 > 문의사항(Inquiry) =====
  const isBoardsInquiry = pathname.startsWith('/admin/boards/inquiry');

  // 이벤트 문의: /admin/boards/inquiry/events/[eventId] (/[inquiryId]?)
  const matchEventInquiry = pathname.match(/^\/admin\/boards\/inquiry\/events\/(\d+)(?:\/([^/?]+))?$/);
  const boardsEventId_inq = matchEventInquiry ? Number(matchEventInquiry[1]) : null;
  const boardsEventInquiryId = matchEventInquiry && matchEventInquiry[2] ? matchEventInquiry[2] : null;

  // 메인 문의: /admin/boards/inquiry/main (/ [inquiryId]?)
  const isBoardsMainRoot_inq = /^\/admin\/boards\/inquiry\/main$/.test(pathname);
  const matchMainInquiry = pathname.match(/^\/admin\/boards\/inquiry\/main\/([^/?]+)/);
  const boardsMainInquiryId = matchMainInquiry ? matchMainInquiry[1] : null;

  // 이벤트 리스트 (3단계 라벨/드롭다운용)
  const boardsEventList_inq = useMemo(
    () => {
      if (!eventListData?.content) return [];
      return [...eventListData.content].sort((a, b) => 
        b.no - a.no // no 기준 내림차순 (테이블과 동일)
      );
    },
    [eventListData]
  );
  const boardsCurrentEvent_inq = useMemo(
    () => (boardsEventId_inq ? boardsEventList_inq.find((e) => String(e.id) === String(boardsEventId_inq)) : null),
    [boardsEventId_inq, boardsEventList_inq]
  );

  // 이벤트 문의 목록(4단계용)
  const boardsEventInquiries = useMemo(() => {
    if (!boardsEventId_inq) return [];
    try {
      const { rows } = getEventInquiries(String(boardsEventId_inq), 1, 1000, { sort: 'new', searchMode: 'post', q: '' });
      // 가상 답변행(__replyOf) 제거
      return (rows || []).filter((r: Record<string, unknown>) => !('__replyOf' in r));
    } catch {
      return [];
    }
  }, [boardsEventId_inq]);

  // 메인 문의 목록(4단계용)
  const boardsMainInquiries = useMemo(() => {
    if (!isBoardsInquiry) return [];
    try {
      const { rows } = getMainInquiries(1, 1000, { sort: 'new', searchMode: 'post', q: '' });
      return (rows || []).filter((r: Record<string, unknown>) => !('__replyOf' in r));
    } catch {
      return [];
    }
  }, [isBoardsInquiry]);

  // 상세 페이지에서 eventName 가져오기 (메인 문의 상세)
  const { data: mainInquiryDetail } = useInquiryDetail(boardsMainInquiryId || '');
  const mainInquiryEventName = (mainInquiryDetail as { questionDetail?: { eventName?: string } } | undefined)?.questionDetail?.eventName;

  // 상세 페이지에서 eventName 가져오기 (이벤트 문의 상세)
  const { data: eventInquiryDetail } = useInquiryDetail(boardsEventInquiryId || '');
  const eventInquiryEventName = (eventInquiryDetail as { questionDetail?: { eventName?: string } } | undefined)?.questionDetail?.eventName;

  // ===== 🔹 게시판관리 > FAQ =====
  const isBoardsFaq = pathname.startsWith('/admin/boards/faq');

  // ===== 🔹 지역대회 관리 =====
  const isLocalEvents = pathname.startsWith('/admin/local-events');
  const matchLocalEventDetail = pathname.match(/^\/admin\/local-events\/([^/]+)$/);
  const matchLocalEventEdit = pathname.match(/^\/admin\/local-events\/([^/]+)\/edit$/);
  
  // management, register 같은 특수 경로 제외
  const excludedPaths = ['management', 'register'];
  const potentialId = matchLocalEventDetail ? matchLocalEventDetail[1] : (matchLocalEventEdit ? matchLocalEventEdit[1] : null);
  const localEventId = potentialId && !excludedPaths.includes(potentialId) ? potentialId : null;
  
  // 지역대회 상세 정보 가져오기 (localEventId가 있을 때만 호출)
  const { data: localEventDetail } = useLocalEventDetail(localEventId || '');
  const localEventName = (localEventDetail as { eventName?: string } | undefined)?.eventName;

  // ===== 🔹 배너관리 > 팝업 =====
  const isBannersPopup = pathname.startsWith('/admin/banners/popups');
  const isMainPopup = pathname === '/admin/banners/popups/main';
  const isEventPopup = pathname.startsWith('/admin/banners/popups/events');

  // 이벤트 FAQ: /admin/boards/faq/events/[eventId] (/[faqId]?)
  const matchEventFaq = pathname.match(/^\/admin\/boards\/faq\/events\/(\d+)(?:\/(\d+))?$/);
  const boardsEventId_faq = matchEventFaq ? Number(matchEventFaq[1]) : null;
  const boardsEventFaqId = matchEventFaq && matchEventFaq[2] ? Number(matchEventFaq[2]) : null;

  // 메인 FAQ: /admin/boards/faq/main (/[faqId]?)
  const isBoardsMainRoot_faq = /^\/admin\/boards\/faq\/main$/.test(pathname);
  const matchMainFaq = pathname.match(/^\/admin\/boards\/faq\/main\/(\d+)$/);
  const boardsMainFaqId = matchMainFaq ? Number(matchMainFaq[1]) : null;

  // 이벤트 리스트(FAQ용 3단계)
  const boardsEventList_faq = useMemo(
    () => {
      if (!eventListData?.content) return [];
      return [...eventListData.content].sort((a, b) => 
        b.no - a.no // no 기준 내림차순 (테이블과 동일)
      );
    },
    [eventListData]
  );
  const boardsCurrentEvent_faq = useMemo(
    () => (boardsEventId_faq ? boardsEventList_faq.find((e) => String(e.id) === String(boardsEventId_faq)) : null),
    [boardsEventId_faq, boardsEventList_faq]
  );

  // 이벤트 FAQ 목록(4단계용) - 비동기 API이므로 현재는 빈 배열 반환
  // TODO: 필요시 useQuery로 변경하여 실제 데이터 로드
  const boardsEventFaqs = useMemo<Array<{ id: string | number; title: string; [key: string]: unknown }>>(() => {
    if (!boardsEventId_faq) return [];
    // 비동기 API이므로 useMemo에서 직접 호출 불가
    // 실제 사용 시 useQuery 등으로 변경 필요
    return [];
  }, [boardsEventId_faq]);

  // 메인 FAQ 목록(4단계용) - 비동기 API이므로 현재는 빈 배열 반환
  // TODO: 필요시 useQuery로 변경하여 실제 데이터 로드
  const boardsMainFaqs = useMemo<Array<{ id: string | number; title: string; [key: string]: unknown }>>(() => {
    if (!isBoardsFaq) return [];
    // 비동기 API이므로 useMemo에서 직접 호출 불가
    // 실제 사용 시 useQuery 등으로 변경 필요
    return [];
  }, [isBoardsFaq]);

  // ===== 3단계 리스트 =====
  const thirdList =
    (isApplicationsMgmt || isApplicationsList)
      ? eventList.map((e) => ({ key: String(e.id), label: e.nameKr, href: `/admin/applications/management/${e.id}` }))
      : isIndivDetail
      ? allIndividuals.map((u) => ({ key: String(u.id), label: u.name, href: `/admin/users/individual/${u.id}/detail` }))
      : // 공지(기존)
        (matchEventNotice
          ? boardsEventList_notice.map((e) => ({
              key: String(e.id),
              label: e.nameKr,
              href: `/admin/boards/notice/events/${e.id}`,
            }))
          // 문의(이벤트)
          : matchEventInquiry
          ? boardsEventList_inq.map((e) => ({
              key: String(e.id),
              label: e.nameKr,
              href: `/admin/boards/inquiry/events/${e.id}`,
            }))
          // ✅ FAQ(이벤트)
          : matchEventFaq
          ? boardsEventList_faq.map((e) => ({
              key: String(e.id),
              label: e.nameKr,
              href: `/admin/boards/faq/events/${e.id}`,
            }))
          // 🔹 팝업 관리
          : isBannersPopup
          ? [
              { key: 'main', label: '메인팝업관리', href: '/admin/banners/popups/main' },
              { key: 'events', label: '대회팝업관리', href: '/admin/banners/popups' },
            ]
          : [])
  ;

  const thirdActiveKey =
    isApplicationsMgmt ? String(eventIdFromPathA ?? '') :
    isOrgDetail        ? String(orgIdFromPath ?? '')   :
    isIndivDetail      ? String(indivIdFromPath ?? '') :
    matchEventNotice   ? String(boardsEventId_notice ?? '') :
    matchEventInquiry  ? String(boardsEventId_inq ?? '') :
    matchEventFaq      ? String(boardsEventId_faq ?? '') :
    isMainPopup        ? 'main' :
    isEventPopup       ? 'events' :
    '';

  const showThird =
    isApplicationsMgmt ||
    isApplicationsList ||
    (isOrgDetail && !!orgIdFromPath) ||
    (isIndivDetail && !!(indivIdFromPath || currentIndiv)) ||
    (matchEventNotice && !!boardsEventId_notice) ||
    (matchEventInquiry && (!!boardsEventId_inq || !!boardsEventInquiryId)) ||
    (matchEventFaq && !!boardsEventId_faq) ||
    isBoardsMainRoot_inq || !!boardsMainInquiryId ||
    isBoardsMainRoot_faq || !!boardsMainFaqId ||
    isMainPopup || isEventPopup
  ;

  // ===== 4단계 리스트 =====
  const fourthList =
    // 공지(이벤트)
    matchEventNotice
      ? boardsEventNotices.map((n: Record<string, unknown>) => ({
          key: String(n.id),
          label: n.title as string,
          href: `/admin/boards/notice/events/${boardsEventId_notice}/${n.id}`,
        }))
      // 공지(메인)
      : (isBoardsMainRoot_notice || !!boardsMainNoticeId)
      ? getSafeArray(boardsMainNotices).map((n: Record<string, unknown>) => ({
          key: String(n.id),
          label: (n.title as string) ?? `공지 #${n.id}`,
          href: `/admin/boards/notice/main/${n.id}`,
        }))
      // 문의(이벤트)
      : matchEventInquiry
      ? boardsEventInquiries.map((q: Record<string, unknown>) => ({
          key: String(q.id),
          label: q.title as string,
          href: `/admin/boards/inquiry/events/${boardsEventId_inq}/${q.id}`,
        }))
      // 문의(메인)
      : (isBoardsMainRoot_inq || !!boardsMainInquiryId)
      ? boardsMainInquiries.map((q: Record<string, unknown>) => ({
          key: String(q.id),
          label: q.title as string,
          href: `/admin/boards/inquiry/main/${q.id}`,
        }))
      // ✅ FAQ(이벤트)
      : matchEventFaq
      ? boardsEventFaqs.map((f: Record<string, unknown>) => ({
          key: String(f.id),
          label: f.title as string,
          href: `/admin/boards/faq/events/${boardsEventId_faq}/${f.id}`,
        }))
      // ✅ FAQ(메인)
      : (isBoardsMainRoot_faq || !!boardsMainFaqId)
      ? boardsMainFaqs.map((f: Record<string, unknown>) => ({
          key: String(f.id),
          label: f.title as string,
          href: `/admin/boards/faq/main/${f.id}`,
        }))
      : []
  ;

  const fourthActiveKey =
    boardsEventNoticeId ? String(boardsEventNoticeId) :
    boardsMainNoticeId  ? String(boardsMainNoticeId)  :
    boardsEventInquiryId ? String(boardsEventInquiryId) :
    boardsMainInquiryId  ? String(boardsMainInquiryId)  :
    boardsEventFaqId ? String(boardsEventFaqId) :
    boardsMainFaqId  ? String(boardsMainFaqId)  :
    '';

  const showFourth = false; // 4단계 제거 (boards 메인/이벤트 모두)

  // 열릴 때 활성 항목으로 스크롤
  useEffect(() => {
    if (!openEntity || !thirdActiveKey) return;
    const el = listboxRef.current?.querySelector<HTMLElement>(`[data-key="${thirdActiveKey}"]`);
    el?.scrollIntoView({ block: 'center' });
  }, [openEntity, thirdActiveKey]);

  useEffect(() => {
    if (!openFourth || !forthActiveKeySafe()) return;
    const el = fourthListRef.current?.querySelector<HTMLElement>(`[data-key="${forthActiveKeySafe()}"]`);
    el?.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFourth, fourthActiveKey]);

  const forthActiveKeySafe = () => fourthActiveKey || '';

  if (!showNav) return null;

  // ===== 3단계 라벨 =====
  const thirdLabel = (() => {
    // 신청/단체/개인
    if (isApplicationsMgmt || isApplicationsList) {
      if (!eventIdFromPathA) return '대회 선택';
      return currentEventA?.nameKr || '대회 선택';
    }
    if (isOrgDetail) return orgThirdLabel || undefined;
    if (isIndivDetail) return indivThirdLabel || undefined;

    // 공지
    if (matchEventNotice) return boardsCurrentEvent_notice?.nameKr || '대회 선택';
    if (isBoardsMainRoot_notice || !!boardsMainNoticeId) return '전마협 공지사항';

    // 문의
    if (matchEventInquiry) {
      // 이벤트 문의 상세 페이지에서 eventName이 있으면 표시
      if (boardsEventInquiryId && eventInquiryEventName) {
        return eventInquiryEventName;
      }
      return boardsCurrentEvent_inq?.nameKr || '대회 선택';
    }
    if (isBoardsMainRoot_inq || !!boardsMainInquiryId) {
      // 메인 문의 상세 페이지에서 eventName이 있으면 표시
      if (boardsMainInquiryId && mainInquiryEventName) {
        return mainInquiryEventName;
      }
      return '전마협 문의사항';
    }

    // ✅ FAQ
    if (matchEventFaq) return boardsCurrentEvent_faq?.nameKr || '대회 선택';
    if (isBoardsMainRoot_faq || !!boardsMainFaqId) return '전마협 FAQ';

    // 🔹 팝업 관리
    if (isMainPopup) return '메인팝업관리';
    if (isEventPopup) return '대회팝업관리';

    return undefined;
  })();

  // 3단계가 드롭다운인지
  const isThirdDropdown =
    isApplicationsMgmt ||
    isApplicationsList ||
    isOrgDetail ||
    isIndivDetail ||
    !!matchEventNotice ||
    !!matchEventInquiry ||
    !!matchEventFaq ||
    isBannersPopup;

  // ===== 4단계 라벨 =====
  const fourthLabel: string = (() => {
    // 공지
    if (boardsEventNoticeId) {
      const found = boardsEventNotices.find((n: Record<string, unknown>) => n.id === boardsEventNoticeId);
      return (found?.title as string) || '공지 선택';
    }
    if (boardsMainNoticeId) {
      const found = getSafeArray(boardsMainNotices).find((n: Record<string, unknown>) => n.id === boardsMainNoticeId);
      return ((found as Record<string, unknown>)?.eventTitle as string) || '공지 선택';
    }

    // 문의
    if (boardsEventInquiryId) {
      const found = boardsEventInquiries.find((q: Record<string, unknown>) => q.id === boardsEventInquiryId);
      return (found?.title as string) || '문의 선택';
    }
    if (boardsMainInquiryId) {
      const found = boardsMainInquiries.find((q: Record<string, unknown>) => q.id === boardsMainInquiryId);
      return (found?.title as string) || '문의 선택';
    }

    // ✅ FAQ
    if (boardsEventFaqId) {
      const found = boardsEventFaqs.find((f: Record<string, unknown>) => f.id === boardsEventFaqId);
      return (found?.title as string) || 'FAQ 선택';
    }
    if (boardsMainFaqId) {
      const found = boardsMainFaqs.find((f: Record<string, unknown>) => f.id === boardsMainFaqId);
      return (found?.title as string) || 'FAQ 선택';
    }

    return '선택';
  })();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 py-4 min-h-[56px]">
          {/* 1) 섹션 */}
          <div className="flex items-center gap-6 text-gray-600 mx-5">
            <safeMenu.icon className="w-5 h-5" />
            <span className="font-medium">{safeMenu.name}</span>
          </div>

          {isApplicationsMgmt || isApplicationsList ? (
            <>
              {/* Event breadcrumb first */}
              {showThird && (
                <>
                  <span className="text-gray-400">&gt;</span>
                  <div className="relative" ref={entRef}>
                    <button
                      onClick={toggleEntity}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      aria-haspopup="listbox"
                      aria-expanded={openEntity}
                      title={thirdLabel}
                    >
                      <span className="max-w-[320px] truncate">{thirdLabel}</span>
                      <ChevronDown className={clsx('w-4 h-4 transition-transform', openEntity && 'rotate-180')} />
                    </button>

                    {openEntity && thirdList.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div
                          ref={listboxRef}
                          role="listbox"
                          aria-activedescendant={thirdActiveKey ? `opt-${thirdActiveKey}` : undefined}
                          className="py-1 max-h-[264px] overflow-y-auto"
                        >
                          {thirdList.map((it) => {
                            const active = it.key === thirdActiveKey;
                            return (
                              <Link
                                key={it.key}
                                id={`opt-${it.key}`}
                                data-key={it.key}
                                href={it.href}
                                aria-selected={active}
                                className={clsx(
                                  'block px-4 py-2 text-sm transition-colors truncate',
                                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                )}
                                title={it.label}
                                onClick={() => setOpenEntity(false)}
                              >
                                {it.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Sub breadcrumb (신청자 관리) after event */}
              <span className="text-gray-400">&gt;</span>
              <div className="relative" ref={subRef}>
                <button
                  onClick={toggleSub}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={openSub}
                >
                  {currentSub.name}
                  <ChevronDown className={clsx('w-4 h-4 transition-transform', openSub && 'rotate-180')} />
                </button>

                {openSub && (
                  <div role="menu" className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {safeMenu.children.map((child) => {
                        // 정확히 일치하는 것을 우선 확인
                        const active = child.href === currentSub.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={clsx(
                              'block px-4 py-2 text-sm transition-colors',
                              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )}
                            onClick={() => setOpenSub(false)}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
          <span className="text-gray-400">&gt;</span>

              {/* Sub breadcrumb default position */}
          <div className="relative" ref={subRef}>
            <button
              onClick={toggleSub}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              aria-haspopup="menu"
              aria-expanded={openSub}
            >
              {currentSub.name}
              <ChevronDown className={clsx('w-4 h-4 transition-transform', openSub && 'rotate-180')} />
            </button>

            {openSub && (
              <div role="menu" className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {safeMenu.children.map((child) => {
                    // 정확히 일치하는 것을 우선 확인
                    const active = child.href === currentSub.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          'block px-4 py-2 text-sm transition-colors',
                          active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        onClick={() => setOpenSub(false)}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3) 3단계 */}
          {showThird && (
            <>
              <span className="text-gray-400">&gt;</span>

              {isThirdDropdown ? (
                <div className="relative" ref={entRef}>
                  <button
                    onClick={toggleEntity}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    aria-haspopup="listbox"
                    aria-expanded={openEntity}
                    title={thirdLabel}
                  >
                    <span className="max-w-[320px] truncate">{thirdLabel}</span>
                    <ChevronDown className={clsx('w-4 h-4 transition-transform', openEntity && 'rotate-180')} />
                  </button>

                  {openEntity && thirdList.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div
                        ref={listboxRef}
                        role="listbox"
                        aria-activedescendant={thirdActiveKey ? `opt-${thirdActiveKey}` : undefined}
                        className="py-1 max-h-[264px] overflow-y-auto"
                      >
                        {thirdList.map((it) => {
                          const active = it.key === thirdActiveKey;
                          return (
                            <Link
                              key={it.key}
                              id={`opt-${it.key}`}
                              data-key={it.key}
                              href={it.href}
                              aria-selected={active}
                              className={clsx(
                                'block px-4 py-2 text-sm transition-colors truncate',
                                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              )}
                              title={it.label}
                              onClick={() => setOpenEntity(false)}
                            >
                              {it.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md">
                  {thirdLabel}
                </div>
                  )}
                </>
              )}
            </>
          )}

          {/* 4) 4단계 (제목 드롭다운) */}
          {showFourth && (
            <>
              <span className="text-gray-400">&gt;</span>

              <div className="relative" ref={fourthRef}>
                <button
                  onClick={toggleFourth}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={openFourth}
                  title={fourthLabel}
                >
                  <span className="max-w-[320px] truncate">{fourthLabel}</span>
                  <ChevronDown className={clsx('w-4 h-4 transition-transform', openFourth && 'rotate-180')} />
                </button>

                {openFourth && fourthList.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div
                      ref={fourthListRef}
                      role="listbox"
                      aria-activedescendant={forthActiveKeySafe() ? `opt4-${forthActiveKeySafe()}` : undefined}
                      className="py-1 max-h-[264px] overflow-y-auto"
                    >
                      {fourthList.map((it: { key: string; label: string; href: string }) => {
                        const active = it.key === forthActiveKeySafe();
                        return (
                          <Link
                            key={it.key}
                            id={`opt4-${it.key}`}
                            data-key={it.key}
                            href={it.href}
                            aria-selected={active}
                            className={clsx(
                              'block px-4 py-2 text-sm transition-colors truncate',
                              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )}
                            title={it.label}
                            onClick={() => setOpenFourth(false)}
                          >
                            {it.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function getSafeArray<T = unknown>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}
