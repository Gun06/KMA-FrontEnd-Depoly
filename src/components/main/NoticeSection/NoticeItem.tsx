import React from 'react';
import Link from 'next/link';
import { NoticeItem as NoticeItemType } from './types';
import CategoryTag from '@/components/common/Badge/CategoryTag';

interface NoticeItemProps {
  item: NoticeItemType;
}

export default function NoticeItem({ item }: NoticeItemProps) {
  return (
    <Link href={item.link || '#'} className="block">
            <div className="py-3 hover:bg-gray-50 transition-colors duration-200" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-start gap-3">
          {/* 날짜 */}
          <div className="text-sm text-gray-500 whitespace-nowrap min-w-[80px]">
            {item.date}
          </div>
          
          {/* 카테고리 및 제목 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-nowrap">
              {item.category && (
                <div className="flex-shrink-0">
                  <CategoryTag category={item.category} />
                </div>
              )}
              <h4 className="text-sm text-gray-900 leading-relaxed truncate min-w-0">
                {item.title}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
