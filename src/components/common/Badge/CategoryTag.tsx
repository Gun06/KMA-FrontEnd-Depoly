import React from 'react';
import { cn } from '@/utils/cn';

interface CategoryTagProps {
  category: '대회' | '이벤트' | '안내';
  className?: string;
}

export default function CategoryTag({ category, className }: CategoryTagProps) {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case '대회':
        return 'bg-red-500 text-white';
      case '이벤트':
        return 'bg-blue-500 text-white';
      case '안내':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span
      className={cn(
        'inline-block px-2 py-1 text-xs font-medium rounded',
        getCategoryStyle(category),
        className
      )}
    >
      {category}
    </span>
  );
}
