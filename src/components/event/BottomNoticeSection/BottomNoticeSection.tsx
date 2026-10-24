'use client';

import React from 'react';
import { formatDateShort } from '@/utils/formatDate';
import { useMustReadNotices } from '@/hooks/useMustReadNotices';

interface BottomNoticeSectionProps {
  eventId?: string;
  className?: string;
}

export default function BottomNoticeSection({
  eventId,
  className = '',
}: BottomNoticeSectionProps) {
  const { data, isLoading, isError, error } = useMustReadNotices(eventId ?? '');
  const notices = (data?.eventNoticeHeaderList ?? []).slice(0, 6);

  if (!eventId) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  if (isError && notices.length === 0) {
    return (
      <section className={`bg-white py-8 md:py-16 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            공지사항
          </h2>
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
            <div className="text-sm text-gray-400">{error?.message}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white py-8 md:py-16 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
          공지사항
        </h2>

        <div className="max-w-5xl mx-auto relative">
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {notices.map((notice, index) => (
                <div
                  key={notice.noticeId}
                  className={`flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index !== notices.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onClick={() => {
                    window.location.href = `/event/${eventId}/notices/notice/${notice.noticeId}`;
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.location.href = `/event/${eventId}/notices/notice/${notice.noticeId}`;
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium flex-shrink-0 ${
                        notice.category === '필독'
                          ? 'bg-red-600 text-white'
                          : 'bg-black text-white'
                      }`}
                    >
                      {notice.category}
                    </span>

                    <h3 className="text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                      {notice.noticeTitle}
                    </h3>
                  </div>

                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-2 sm:ml-4">
                    {formatDateShort(notice.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base px-4 py-2 hover:bg-gray-50 rounded-md"
                onClick={() => {
                  window.location.href = `/event/${eventId}/notices/notice`;
                }}
              >
                더보기
                <span className="text-red-500 text-lg">+</span>
              </button>
            </div>
          </>
        </div>
      </div>
    </section>
  );
}
