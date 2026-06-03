"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NoticeItem from './NoticeItem';
import { NoticeResponse, ApiNoticeItem } from './types';

const FRAME_X = 'px-3 sm:px-4 md:px-5 lg:px-[6vw]';

interface NoticeSectionProps {
  /** 메인 홈: FAQ와 동일 여백·리스트 스타일 (제목은 NoticeMagazineSection) */
  variant?: 'default' | 'embedded';
}

export default function NoticeSection({ variant = 'default' }: NoticeSectionProps) {
  const isEmbedded = variant === 'embedded';
  const router = useRouter();
  const [noticeData, setNoticeData] = useState<ApiNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        }
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/notice?page=1&size=5`;
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          const data: NoticeResponse = await response.json();
          // 고정 공지사항과 일반 공지사항을 합쳐서 중복 제거
          const allNotices = [
            ...(data.pinnedNoticeList || []),
            ...(data.noticePage.content || [])
          ];
          const uniqueNotices = allNotices.filter((notice: any, index: number, self: any[]) =>
            index === self.findIndex((n: any) => n.id === notice.id)
          );
          setNoticeData(uniqueNotices);
        } else {
          const errorText = await response.text();
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        
        // 서버 에러 시 기본 데이터 사용
        setNoticeData([]);
        setError(null); // 에러 상태를 null로 설정하여 기본 데이터 표시
      } finally {
        setIsLoading(false);
      }
    };
    fetchNoticeData();
  }, []);

  // 표시할 데이터 결정 (API 데이터만 사용)
  const displayData = noticeData.map(item => ({
    id: item.id,
    date: new Date(item.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, ''),
    category: item.category as '대회' | '이벤트' | '안내' | '공지' | '필독',
    title: item.title,
    description: item.title,
    link: `/notice/notice/${item.id}`
  }));

  const listContent = isLoading ? (
    <div className="divide-y divide-gray-200 rounded-md bg-white">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="py-4 sm:py-5 md:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="min-w-[80px] shrink-0">
              <div className="h-[14px] w-16 animate-pulse rounded bg-gray-200 md:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-nowrap items-center gap-2">
                <div className="h-[14px] flex-1 animate-pulse rounded bg-gray-200 md:h-4" />
                <div className="h-5 w-16 shrink-0 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : displayData.length > 0 ? (
    <div className="divide-y divide-gray-200 rounded-md bg-white">
      {displayData.slice(0, 5).map((item) => (
        <NoticeItem key={item.id} item={item} embedded={isEmbedded} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-sm text-gray-500">아직 글이 없습니다</p>
      <button
        type="button"
        onClick={() => router.push('/notice/notice')}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        공지사항 보러가기
      </button>
    </div>
  );

  if (isEmbedded) {
    return <div>{listContent}</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-white pt-4 pb-4 shadow-none md:pt-5 md:pb-5">
      <div className={`mx-auto w-full max-w-[1920px] ${FRAME_X}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-giants text-[22px] text-gray-900 md:text-[28px]">공지사항</h3>
          <Link
            href="/notice/notice"
            className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
          >
            더보기 &gt;
          </Link>
        </div>
        {listContent}
      </div>
    </div>
  );
}
