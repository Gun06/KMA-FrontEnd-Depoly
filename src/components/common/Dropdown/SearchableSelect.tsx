'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SearchableSelectOption<T = string> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string> {
  /** 선택된 값 */
  value: T | null | undefined;
  /** 옵션 목록 */
  options: SearchableSelectOption<T>[];
  /** 값이 변경될 때 호출되는 콜백 */
  onChange: (value: T) => void;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 검색 기능 활성화 여부 */
  searchable?: boolean;
  /** 검색 placeholder */
  searchPlaceholder?: string;
  /** className */
  className?: string;
  /** 값이 비어있을 때 텍스트 색상을 회색으로 */
  showPlaceholderColor?: boolean;
}

export function SearchableSelect<T = string>({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  searchable = false,
  searchPlaceholder = '검색...',
  className = '',
  showPlaceholderColor = true,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchKeyword('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 선택된 옵션 찾기
  const selectedOption = options.find(opt => opt.value === value);
  
  // 검색 필터링
  const filteredOptions = searchable && searchKeyword
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchKeyword('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 선택된 값 표시 버튼 */}
      <button
        type="button"
        className="w-full rounded border px-2 py-1 text-left bg-white hover:bg-gray-50 relative"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchKeyword('');
        }}
      >
        <span className={`block pr-8 ${selectedOption && !showPlaceholderColor ? 'text-gray-900' : selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-[71] max-h-60 flex flex-col">
            {/* 검색 입력 필드 (searchable이 true일 때만) */}
            {searchable && (
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <input
                  type="text"
                  className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={searchPlaceholder}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            
            {/* 옵션 리스트 */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      option.value === value ? 'bg-blue-50 font-medium' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
        </div>
      )}
    </div>
  );
}
