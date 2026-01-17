'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TimeSelectProps {
  /** 선택된 값 */
  value: string;
  /** 옵션 목록 (00~23 또는 00~59) */
  options: string[];
  /** 값이 변경될 때 호출되는 콜백 */
  onChange: (value: string) => void;
  /** className */
  className?: string;
  /** disabled */
  disabled?: boolean;
}

export function TimeSelect({
  value,
  options,
  onChange,
  className = '',
  disabled = false,
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 선택된 값 표시 버튼 */}
      <button
        type="button"
        className={`w-full rounded px-2 py-1 text-center bg-white hover:bg-gray-50 relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="block pr-6 text-gray-900">
          {value}
        </span>
        <svg 
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-[71] overflow-hidden w-full">
          {/* 옵션 리스트 - 8개 높이로 제한 */}
          <div 
            className="overflow-y-auto"
            style={{ 
              maxHeight: 'calc(2.25rem * 8)', // py-2 + text 높이 * 8개
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`w-full px-3 py-2 text-center text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  option === value ? 'bg-blue-50 font-medium' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
