import React from 'react';
import Link from 'next/link';
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
      <div className="py-3 hover:bg-gray-50 transition-colors duration-200" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-start gap-3">
          {/* 날짜 */}
          <div className="text-sm text-gray-500 whitespace-nowrap min-w-[80px]">
            {item.date}
          </div>
          
          {/* 제목만 표시 */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm leading-relaxed truncate min-w-0 ${
              item.secret ? 'text-gray-500 italic' : 'text-gray-900'
            }`}>
              {item.title}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
