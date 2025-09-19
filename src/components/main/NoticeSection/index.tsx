import React from 'react';
import Link from 'next/link';
import { notices } from './data';
import NoticeItem from './NoticeItem';

export default function NoticeSection() {
  return (
    <div className="bg-white rounded-lg shadow-none border border-white p-4 md:p-5 lg:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-giants text-[22px] md:text-[28px] text-gray-900">
          공지사항
        </h3>
        <Link 
          href="/notice" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
        >
          더보기 &gt;
        </Link>
      </div>
      
      {/* 공지사항 리스트 */}
      <div className="space-y-0">
        {notices.slice(0, 5).map((item) => (
          <NoticeItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
