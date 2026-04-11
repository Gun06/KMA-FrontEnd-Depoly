import React from 'react';
import { InquiryItem as InquiryItemType } from './types';

interface InquiryItemProps {
  item: InquiryItemType;
  onClick?: () => void;
}

export default function InquiryItem({ item, onClick }: InquiryItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className="block cursor-pointer" 
      onClick={handleClick}
    >
      <div
        className="py-3 transition-colors duration-200 hover:bg-gray-50"
        style={{ borderBottom: '1px solid #E5E7EB' }}
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
              {/* 공지 태그 칸과 동일 레이아웃, 투명(비표시) */}
              <div
                className="pointer-events-none flex h-5 w-16 shrink-0 items-center justify-end opacity-0"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
