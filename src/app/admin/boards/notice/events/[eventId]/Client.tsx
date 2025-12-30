'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button/Button';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import NoticeEventTable from '@/components/admin/boards/notice/NoticeEventTable';
import { useEventNotices, useEventList } from '@/hooks/useNotices';
import { deleteNotice, searchEventNotices, NoticeSearchParams } from '@/services/admin/notices';
import { useQueryClient } from '@tanstack/react-query';
import type { NoticeType } from '@/types/notice';
import type { NoticeListResponse } from '@/services/admin/notices';
import type { EventListResponse, EventListItem } from '@/types/eventList';

// 날짜시간 포맷팅 함수 (백엔드에서 한국시간으로 제공) - 상세 페이지용
function _formatDateWithTime(dateString: string): string {
  // ISO 8601 형식의 날짜 문자열을 파싱
  const date = new Date(dateString);
  
  // 백엔드에서 이미 한국시간으로 제공되므로 변환 없이 그대로 사용
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// 날짜만 포맷팅 함수 (목록용)
function formatDateOnly(dateString: string): string {
  // ISO 8601 형식의 날짜 문자열을 파싱
  const date = new Date(dateString);
  
  // 백엔드에서 이미 한국시간으로 제공되므로 변환 없이 그대로 사용
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

type Sort = 'new' | 'hit' | 'name';

// 변환된 행 타입 정의
type TransformedRow = {
  id: number | string; // UUID 문자열 또는 숫자 ID 지원
  type: NoticeType;
  title: string;
  author: string;
  date: string;
  views: number;
};

export default function Client() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 대회 목록에서 해당 대회 정보 찾기
  const { data: eventListData } = useEventList(1, 100) as {
    data: EventListResponse | undefined;
  };
  const event = eventListData?.content?.find((e: EventListItem) => e.id === eventId);
  const eventName = event?.nameKr ?? `#${eventId}`;

  // 페이징 & 필터 상태
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [sort, setSort] = React.useState<Sort>('new');
  const [kind, setKind] = React.useState<NoticeType | undefined>(undefined);
  const [q, setQ] = React.useState('');
  const [rev, setRev] = React.useState(0); // 삭제/등록 후 강제 재조회 트리거
  const [searchData, setSearchData] = React.useState<NoticeListResponse | null>(null);
  const [_isSearching, setIsSearching] = React.useState(false);

  // ✅ 모든 의존성을 한 객체로 묶어서 전달
  const args = React.useMemo(
    () => ({ eventId: String(eventId), page, pageSize, sort, kind, q, rev }),
    [eventId, page, pageSize, sort, kind, q, rev]
  );

  // 검색 파라미터 구성
  const searchParams = React.useMemo((): NoticeSearchParams => {
    const params: NoticeSearchParams = {
      page: args.page,
      size: args.pageSize,
    };

    // 정렬 옵션 매핑
    if (args.sort === "new") {
      params.noticeSortKey = "LATEST";
    } else if (args.sort === "hit") {
      params.noticeSortKey = "VIEW_COUNT";
    }

    // 카테고리 매핑
    if (args.kind) {
      const categoryMap: Record<NoticeType, string> = {
        notice: "801", // 공지
        event: "803",  // 이벤트
        match: "802",  // 대회
        general: "804", // 일반
      };
      params.categoryId = categoryMap[args.kind];
    }

    // 검색어
    if (args.q.trim()) {
      params.keyword = args.q.trim();
    }

    return params;
  }, [args]);

  // 검색 실행 함수
  const executeSearch = React.useCallback(async () => {
    const hasSearchParams = searchParams.noticeSortKey || searchParams.categoryId || searchParams.keyword;
    
    if (hasSearchParams && eventId) {
      setIsSearching(true);
      try {
        const result = await searchEventNotices(eventId, searchParams);
        setSearchData(result);
      } catch (error) {
        setSearchData(null);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchData(null);
    }
  }, [searchParams, eventId]);

  // 검색 파라미터가 변경될 때마다 검색 실행
  React.useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  // API에서 이벤트별 공지사항 목록 조회 (검색이 아닐 때만)
  const { data: noticeListData, isLoading, error } = useEventNotices(args.eventId, args.page, args.pageSize) as {
    data: NoticeListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  
  const { rows, total } = React.useMemo(() => {
    // 검색 결과가 있으면 검색 데이터 사용, 없으면 일반 목록 데이터 사용
    const dataSource = searchData || noticeListData;
    
    if (!dataSource?.content) {
      return { rows: [], total: 0 };
    }


    // API 데이터를 기존 형식으로 변환
    const transformedRows = dataSource.content.map((notice, index) => {
      // UUID 형태의 ID는 문자열 그대로, 숫자 형태는 숫자로 변환
      const id = notice.id ? (isNaN(Number(notice.id)) ? notice.id : Number(notice.id)) : index + 1;
      
      // 여러 가능한 조회수 필드명 확인
      const noticeWithExtra = notice as typeof notice & { views?: number; hitCount?: number; readCount?: number };
      
      // 백엔드에서 제공하는 categoryName을 기반으로 타입 결정
      const categoryName = notice.categoryName;
      let type: NoticeType = 'notice'; // 기본값
      
      if (categoryName === '공지') {
        type = 'notice';
      } else if (categoryName === '이벤트') {
        type = 'event';
      } else if (categoryName === '대회') {
        type = 'match';
      } else if (categoryName === '일반') {
        type = 'general';
      }
      
      // 여러 가능한 조회수 필드명 확인
      const viewCount = notice.viewCount || noticeWithExtra.views || noticeWithExtra.hitCount || noticeWithExtra.readCount || 0;
      
      return {
        id,
        type,
        title: notice.title || '제목 없음',
        author: notice.author || '작성자 없음',
        date: notice.createdAt ? formatDateOnly(notice.createdAt) : '날짜 없음', // 2025-08-25T10:00:00 -> 2025.08.25
        views: viewCount,
        categoryName: categoryName, // API에서 받은 categoryName 그대로 전달
      };
    });

    // 필터링 적용
    let filtered: TransformedRow[] = transformedRows;
    
    if (args.kind) {
      filtered = filtered.filter((r: TransformedRow) => r.type === args.kind);
    }
    
    
    if (args.q) {
      const query = args.q.toLowerCase();
      filtered = filtered.filter((r: TransformedRow) => 
        r.title.toLowerCase().includes(query) || 
        r.author.toLowerCase().includes(query)
      );
    }

    // 정렬 적용
    if (args.sort === 'hit') {
      filtered.sort((a: TransformedRow, b: TransformedRow) => b.views - a.views);
    } else if (args.sort === 'name') {
      filtered.sort((a: TransformedRow, b: TransformedRow) => a.title.localeCompare(b.title, 'ko'));
    } else {
      filtered.sort((a: TransformedRow, b: TransformedRow) => b.date.localeCompare(a.date));
    }

    return { rows: filtered, total: dataSource.totalElements || 0 };
  }, [searchData, noticeListData, args]);

  const preset = PRESETS['관리자 / 대회_공지사항']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const handleDelete = async (id: number | string) => {
    if (!confirm('이 공지를 삭제할까요?')) return;
    
    try {
      await deleteNotice(String(id));
      
      // 캐시 무효화로 즉시 UI 업데이트
      queryClient.invalidateQueries({ queryKey: ['notice', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['notice'] });
      
      // 페이지 보정(마지막 항목 삭제 시 이전 페이지로)
      const newTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      setRev((v) => v + 1);
    } catch (error) {
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">
            선택대회:{' '}
            <Link className="text-[#1E5EFF] hover:underline" href={`/admin/boards/notice/events/${eventId}`}>
              {eventName}
            </Link>
          </h3>
          <Link href="/admin/boards/notice/main">
            <Button size="sm" tone="primary">전마협 메인 공지사항 관리하기 &gt;</Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">공지사항을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">
            선택대회:{' '}
            <Link className="text-[#1E5EFF] hover:underline" href={`/admin/boards/notice/events/${eventId}`}>
              {eventName}
            </Link>
          </h3>
          <Link href="/admin/boards/notice/main">
            <Button size="sm" tone="primary">전마협 메인 공지사항 관리하기 &gt;</Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">공지사항을 불러오는데 실패했습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">
          선택대회:{' '}
          <Link className="text-[#1E5EFF] hover:underline" href={`/admin/boards/notice/events/${eventId}`}>
            {eventName}
          </Link>
        </h3>

        <Link href="/admin/boards/notice/main">
          <Button size="sm" tone="primary">전마협 메인 공지사항 관리하기 &gt;</Button>
        </Link>
      </div>

      {/* 필터 바 */}
      {preset && (
        <FilterBar
          {...preset}
          className="ml-auto !gap-3"
          buttons={[
            { label: '검색', tone: 'dark' },
            { label: '등록하기', tone: 'primary' },
          ]}
          showReset
          onFieldChange={(label, value) => {
            const L = norm(String(label));
            if (L === '정렬') setSort(value as Sort);
            else if (L === '유형') setKind(value as NoticeType);
            setPage(1);
          }}
          onSearch={(value) => { setQ(value); setPage(1); }}
          onActionClick={(label) => {
            if (label === '등록하기') router.push(`/admin/boards/notice/events/${eventId}/write`);
          }}
          onReset={() => { setSort('new'); setKind(undefined); setQ(''); setPage(1); }}
        />
      )}

      <NoticeEventTable
        rows={rows}
        eventId={String(eventId)}
        pagination={{ page, pageSize, total, onChange: setPage, align: 'center' }}
        onDelete={handleDelete}
      />
    </div>
  );
}
