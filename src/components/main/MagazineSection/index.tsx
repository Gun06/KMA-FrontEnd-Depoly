import React from 'react';
import Link from 'next/link';
import { magazines } from './data';
import MagazineItem from './MagazineItem';

export default function MagazineSection() {
  return (
    <div className="bg-white rounded-lg shadow-none border border-white p-4 md:p-5 lg:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-giants text-[22px] md:text-[28px] text-gray-900">
          매거진
        </h3>
        <Link 
          href="/magazine" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
        >
          더보기 &gt;
        </Link>
      </div>
      
      {/* 매거진 리스트 */}
      <div className="space-y-0">
        {magazines.slice(0, 5).map((item) => (
          <MagazineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
