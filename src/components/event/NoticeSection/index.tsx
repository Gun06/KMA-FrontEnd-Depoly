'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMustReadNotices } from '@/hooks/useMustReadNotices';

interface NoticeSectionProps {
  eventId: string;
  noticeIndex?: number;
  className?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export default function NoticeSection({
  eventId,
  noticeIndex = 0,
  className = '',
  autoRotate = true,
  rotateInterval = 5000,
}: NoticeSectionProps) {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(noticeIndex);
  const [isVisible, setIsVisible] = useState(true);
  const { data, isLoading, isError } = useMustReadNotices(eventId);
  const notices = data?.eventNoticeHeaderList ?? [];

  useEffect(() => {
    if (!autoRotate || notices.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentNoticeIndex(prevIndex => (prevIndex + 1) % notices.length);
        setIsVisible(true);
      }, 300);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, notices.length]);

  if (isLoading) {
    return null;
  }

  if (isError || notices.length === 0) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-red-600">
            필독
          </span>
          <span className="text-gray-400 text-sm sm:text-base">•</span>
          <span className="text-gray-500 text-sm sm:text-base lg:text-lg font-medium">
            공지사항이 없습니다
          </span>
        </div>
      </div>
    );
  }

  const currentNotice = notices[currentNoticeIndex];

  const getCategoryColor = (category: string) => {
    if (category === '필독') return 'text-red-600';
    if (category === '공지') return 'text-blue-600';
    if (category === '이벤트') return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
      <Link
        href={`/event/${eventId}/notices/notice/${currentNotice.noticeId}`}
        className="inline-flex items-center gap-1 sm:gap-2 cursor-pointer select-none"
      >
        <span
          className={`font-semibold text-sm sm:text-base lg:text-lg ${getCategoryColor(currentNotice.category)}`}
        >
          {currentNotice.category}
        </span>
        <span className="text-gray-400 text-sm sm:text-base">•</span>
        <span
          className={`text-gray-900 text-sm sm:text-base lg:text-lg font-medium transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentNotice.noticeTitle}
        </span>
      </Link>
    </div>
  );
}
