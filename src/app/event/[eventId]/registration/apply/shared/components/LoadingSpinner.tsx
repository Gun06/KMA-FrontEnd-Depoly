// 로딩 스피너 컴포넌트
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = "로딩 중...", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
