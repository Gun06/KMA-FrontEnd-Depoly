// app/admin/local-events/management/LocalEventsClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import LocalEventTable from './components/LocalEventTable';
import type { LocalEventRow } from './api/types';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import type { LocalEventListResponse } from './api/types';
import {
  useLocalEventList,
  transformLocalEventToRow,
} from './api';
import Toast from '@/components/common/Toast/Toast';

export default function LocalEventsClient({
  initialRows,
  initialPage,
  pageSize,
}: {
  initialRows: LocalEventRow[];
  initialPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const queryClient = useQueryClient();

  // URL 파라미터에서 필터 값 추출
  const urlYear = search.get('year');
  const urlVisibleStatus = search.get('visibleStatus') as 'OPEN' | 'TEST' | 'CLOSE' | null;
  const urlEventStatus = search.get('eventStatus') as 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED' | null;
  const urlKeyword = search.get('keyword') || '';

  // URL status 파라미터를 RegStatus로 변환
  const urlStatusToRegStatus = (urlStatus: string | null): RegStatus | '' => {
    if (!urlStatus) return '';
    const normalized = urlStatus.toLowerCase();
    if (['ing', 'open', 'opening'].includes(normalized)) return '접수중';
    if (['done', 'closed', 'final_closed'].includes(normalized)) return '접수마감';
    if (['none', 'pending'].includes(normalized)) return '비접수';
    return '';
  };

  // ---------- 초기 상태 (URL → 상태) ----------
  const [q, setQ] = React.useState(urlKeyword);
  const [year, setYear] = React.useState(urlYear || '');
  const [status, setStatus] = React.useState<RegStatus | ''>(
    urlStatusToRegStatus(urlEventStatus)
  );
  const [pub, setPub] = React.useState<'' | '공개' | '테스트' | '비공개'>(
    urlVisibleStatus === 'OPEN'
      ? '공개'
      : urlVisibleStatus === 'TEST'
        ? '테스트'
        : urlVisibleStatus === 'CLOSE'
          ? '비공개'
          : ''
  );
  const [page, setPage] = React.useState(
    Number(search.get('page') ?? initialPage) || initialPage
  );
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  // URL 파라미터가 변경되면 상태 업데이트 (외부에서 URL 변경된 경우만, 예: 브라우저 뒤로가기)
  React.useEffect(() => {
    const newYear = search.get('year') || '';
    const newVisibleStatus = search.get('visibleStatus') as 'OPEN' | 'TEST' | 'CLOSE' | null;
    const newEventStatus = search.get('eventStatus') as 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED' | null;
    const newKeyword = search.get('keyword') || '';
    const newPage = Number(search.get('page') ?? initialPage) || initialPage;

    // 실제로 값이 다를 때만 업데이트 (불필요한 리렌더링 방지)
    if (newYear !== year) setYear(newYear);
    if (newKeyword !== q) setQ(newKeyword);
    if (newPage !== page) setPage(newPage);
    
    const newStatus = urlStatusToRegStatus(newEventStatus);
    if (newStatus !== status) setStatus(newStatus);
    
    const newPub = newVisibleStatus === 'OPEN' ? '공개' : newVisibleStatus === 'TEST' ? '테스트' : newVisibleStatus === 'CLOSE' ? '비공개' : '';
    if (newPub !== pub) setPub(newPub as '' | '공개' | '테스트' | '비공개');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, initialPage]);

  // 삭제 성공 토스트 처리
  React.useEffect(() => {
    if (search.get('deleted') === 'true') {
      setShowSuccessToast(true);
      // URL에서 deleted 파라미터 제거
      const newSearchParams = new URLSearchParams(search.toString());
      newSearchParams.delete('deleted');
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
      // 3초 후 토스트 자동 닫기
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [search, router]);

  // API 파라미터 구성
  const apiParams = React.useMemo(() => {
    const params: {
      page: number;
      size: number;
      year?: number;
      visibleStatus?: 'OPEN' | 'TEST' | 'CLOSE';
      eventStatus?: 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED';
      keyword?: string;
    } = {
      page,
      size: pageSize,
    };

    if (year) params.year = Number(year);
    if (pub === '공개') params.visibleStatus = 'OPEN';
    if (pub === '테스트') params.visibleStatus = 'TEST';
    if (pub === '비공개') params.visibleStatus = 'CLOSE';
    if (status === '접수중') params.eventStatus = 'OPEN';
    if (status === '접수마감') params.eventStatus = 'CLOSED';
    if (status === '비접수') params.eventStatus = 'PENDING';
    if (q.trim()) params.keyword = q.trim();

    return params;
  }, [page, pageSize, year, pub, status, q]);

  // API에서 지역대회 목록 조회
  const {
    data: apiData,
    isLoading,
    error,
  } = useLocalEventList(apiParams);

  // 삭제 후 목록으로 돌아온 경우 에러 무시
  const isDeletedFlow = search.get('deleted') === 'true';
  const shouldIgnoreError = isDeletedFlow && error;

  // API 데이터를 LocalEventRow로 변환
  const apiRows: LocalEventRow[] = React.useMemo(() => {
    if (!apiData?.content) return [];
    return apiData.content.map(transformLocalEventToRow);
  }, [apiData]);

  // base: SSR 한 페이지 or API 데이터
  const base: LocalEventRow[] = React.useMemo(() => {
    if (apiRows.length > 0) {
      return [...apiRows];
    }
    return [...initialRows];
  }, [apiRows, initialRows]);

  // 이전 rows를 유지하기 위한 ref
  const previousRowsRef = React.useRef<LocalEventRow[]>([]);
  const previousTotalCountRef = React.useRef<number>(0);

  // ---------- 필터/정렬/페이징 ----------
  // API에서 이미 필터링된 데이터를 받아오므로 클라이언트 사이드 필터링 제거
  const { rows, totalCount } = React.useMemo(() => {
    // API 데이터가 있고 로딩 중이 아닐 때만 업데이트
    if (apiData && !isLoading) {
      const totalCount = apiData.totalElements || 0;
      
      // API에서 이미 페이지네이션된 데이터를 받아오므로 그대로 사용
      const withNo = apiRows.map((r, i) => ({
        ...r,
        no: totalCount - ((page - 1) * pageSize + i),
      })) as LocalEventRow[];

      // 이전 데이터 업데이트
      previousRowsRef.current = withNo;
      previousTotalCountRef.current = totalCount;

      return { rows: withNo, totalCount };
    }

    // 로딩 중일 때: 캐시에서 이전 데이터를 찾아서 사용 (깜빡임 방지)
    if (isLoading) {
      // 현재 쿼리 키로 캐시에서 데이터 찾기
      const normalizedYear = apiParams.year ?? null;
      const normalizedVisibleStatus = apiParams.visibleStatus ?? null;
      const normalizedEventStatus = apiParams.eventStatus ?? null;
      const normalizedKeyword = apiParams.keyword ?? null;
      const currentQueryKey = ['admin', 'local-events', 'list', page, pageSize, normalizedYear, normalizedVisibleStatus, normalizedEventStatus, normalizedKeyword];
      
      // 현재 쿼리 키의 캐시 데이터 확인
      const cachedData = queryClient.getQueryData<LocalEventListResponse>(currentQueryKey);
      
      if (cachedData?.content) {
        const cachedRows = cachedData.content.map(transformLocalEventToRow);
        const cachedTotal = cachedData.totalElements || 0;
        const withNo = cachedRows.map((r, i) => ({
          ...r,
          no: cachedTotal - ((page - 1) * pageSize + i),
        })) as LocalEventRow[];
        return { rows: withNo, totalCount: cachedTotal };
      }

      // 캐시에 없으면 이전 데이터 유지
      if (previousRowsRef.current.length > 0) {
        return { rows: previousRowsRef.current, totalCount: previousTotalCountRef.current };
      }
    }

    // 데이터가 없을 때는 이전 데이터 유지 (깜빡임 방지)
    if (previousRowsRef.current.length > 0) {
      return { rows: previousRowsRef.current, totalCount: previousTotalCountRef.current };
    }

    // 최초 로드 시에는 빈 배열 반환
    return { rows: [], totalCount: 0 };
  }, [apiRows, page, pageSize, apiData, isLoading, apiParams, queryClient]);

  // ---------- URL 동기화 ----------
  const replaceQuery = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(search.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  // 필터 초기값 계산 (FilterBar에 전달) - 값이 실제로 변경되었을 때만 새 배열 생성
  const filterInitialValuesRef = React.useRef<string[]>(['', '', '']);
  const filterInitialValues = React.useMemo(() => {
    // 년도, 신청여부, 공개여부 순서
    const statusValue = status === '접수중' ? 'ing' : status === '접수마감' ? 'done' : status === '비접수' ? 'none' : '';
    const publicValue = pub === '공개' ? 'open' : pub === '테스트' ? 'test' : pub === '비공개' ? 'closed' : '';
    const newValues = [year || '', statusValue, publicValue];
    
    // 초기값 설정
    if (filterInitialValuesRef.current.length === 0 || filterInitialValuesRef.current.every(v => v === '')) {
      filterInitialValuesRef.current = newValues;
      return newValues;
    }
    
    // 값이 실제로 변경되었는지 확인
    const hasChanged = filterInitialValuesRef.current.length !== newValues.length ||
      filterInitialValuesRef.current.some((v, i) => v !== newValues[i]);
    
    if (hasChanged) {
      filterInitialValuesRef.current = newValues;
      return newValues;
    }
    
    // 값이 같으면 이전 배열 반환 (참조 동일성 유지)
    return filterInitialValuesRef.current;
  }, [year, status, pub]);

  // 필터가 적용되었는지 확인
  const hasActiveFilters = React.useMemo(() => {
    return !!(year || status || pub || q.trim());
  }, [year, status, pub, q]);

  // ---------- 핸들러 ----------
  const onPageChange = (p: number) => {
    setPage(p);
    replaceQuery({ page: String(p) });
  };

  const onSearch = (value: string) => {
    // 상태를 먼저 즉시 업데이트 (깜빡임 방지)
    setQ(value);
    setPage(1);
    // URL 업데이트는 다음 틱에서 실행
    setTimeout(() => {
      replaceQuery({ page: '1', keyword: value });
    }, 0);
  };

  const onYearChange = (y: string) => {
    // 상태를 먼저 즉시 업데이트 (깜빡임 방지)
    setYear(y);
    setPage(1);
    // URL 업데이트는 다음 틱에서 실행
    setTimeout(() => {
      replaceQuery({ page: '1', year: y });
    }, 0);
  };

  const onFilterStatusChange = (s: RegStatus | '') => {
    // 상태를 먼저 즉시 업데이트 (깜빡임 방지)
    setStatus(s);
    setPage(1);
    const eventStatus = s === '접수중' ? 'OPEN' : s === '접수마감' ? 'CLOSED' : s === '비접수' ? 'PENDING' : '';
    // URL 업데이트는 다음 틱에서 실행
    setTimeout(() => {
      replaceQuery({
        page: '1',
        eventStatus: eventStatus || undefined,
      });
    }, 0);
  };

  const onFilterPublicChange = (v: '' | '공개' | '테스트' | '비공개') => {
    // 상태를 먼저 즉시 업데이트 (깜빡임 방지)
    setPub(v);
    setPage(1);
    const visibleStatus = v === '공개' ? 'OPEN' : v === '테스트' ? 'TEST' : v === '비공개' ? 'CLOSE' : '';
    // URL 업데이트는 다음 틱에서 실행
    setTimeout(() => {
      replaceQuery({
        page: '1',
        visibleStatus: visibleStatus || undefined,
      });
    }, 0);
  };

  const onResetFilters = () => {
    // 상태를 먼저 동기적으로 업데이트 (깜빡임 방지)
    setQ('');
    setYear('');
    setStatus('');
    setPub('');
    setPage(1);
    
    // URL 업데이트는 다음 틱에서 실행하여 상태 업데이트가 먼저 반영되도록
    setTimeout(() => {
      router.replace('?page=1', { scroll: false });
    }, 0);
  };

  // 에러 상태 처리 (삭제 후 목록으로 돌아온 경우 에러 무시)
  if (error && !apiData && !shouldIgnoreError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return (
    <>
      <LocalEventTable
        rows={rows}
        total={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onYearChange={onYearChange}
        onFilterStatusChange={onFilterStatusChange}
        onFilterPublicChange={onFilterPublicChange}
        onClickRegister={() => router.push('/admin/local-events/register')}
        onTitleClick={r => {
          router.push(`/admin/local-events/${r.id}`);
        }}
        onResetFilters={onResetFilters}
        allEvents={base}
        filterInitialValues={filterInitialValues}
        searchInitialValue={q}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
      />
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            toast={{
              id: 'local-event-delete-success',
              message: '지역대회가 성공적으로 삭제되었습니다.',
              type: 'success',
            }}
            onClose={() => setShowSuccessToast(false)}
          />
        </div>
      )}
    </>
  );
}
