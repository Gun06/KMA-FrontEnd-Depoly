import React from 'react';
import Link from 'next/link';
import { NoticeItem as NoticeItemType } from './types';
import CategoryTag from '@/components/common/Badge/CategoryTag';

interface NoticeItemProps {
  item: NoticeItemType;
  embedded?: boolean;
}

export default function NoticeItem({ item, embedded = false }: NoticeItemProps) {
  return (
    <Link href={item.link || '#'} className="block">
      <div
        className={`transition-colors duration-200 hover:bg-gray-50 ${
          embedded ? 'py-4 sm:py-5 md:py-6' : 'py-3'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-[80px] shrink-0 whitespace-nowrap text-sm text-gray-500">
            {item.date}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-nowrap items-center gap-2">
              <h4 className="min-w-0 flex-1 truncate text-sm leading-relaxed text-gray-900">
                {item.title}
              </h4>
              <div className="flex h-5 w-16 shrink-0 items-center justify-end">
                {item.category ? (
                  <CategoryTag category={item.category} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
