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
  /** 드롭다운 최대 높이 (Tailwind 클래스, 예: 'max-h-60', 'max-h-96') */
  maxHeight?: string;
  /** 트리거(닫힌 상태) 밀도 — compact: 관리자 툴바 버튼과 동일 h-10·text-sm */
  variant?: 'default' | 'compact';
  /**
   * 전달 시 클라이언트 필터 대신 서버 검색 모드.
   * 부모에서 options를 검색 결과에 맞게 갱신해야 함.
   */
  onSearchChange?: (keyword: string) => void;
  /** 추가 페이지 로드 */
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  /** 더보기 버튼 문구 (기본: 더보기 (현재/전체)) */
  loadMoreLabel?: string;
  emptyMessage?: string;
}

const TRIGGER_VARIANT: Record<'default' | 'compact', { button: string; label: string }> = {
  default: {
    button: 'w-full rounded border px-2 py-1 text-left bg-white hover:bg-gray-50 relative',
    label: 'block pr-8',
  },
  compact: {
    button:
      'flex h-10 w-full items-center rounded-md border border-gray-300 bg-white px-3 text-left text-sm hover:bg-gray-50 relative',
    label: 'min-w-0 flex-1 truncate pr-8',
  },
};

export function SearchableSelect<T = string>({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  searchable = false,
  searchPlaceholder = '검색...',
  className = '',
  showPlaceholderColor = true,
  maxHeight = 'max-h-60',
  variant = 'default',
  onSearchChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  loadMoreLabel,
  emptyMessage = '검색 결과가 없습니다.',
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const serverSearch = typeof onSearchChange === 'function';

  const trigger = TRIGGER_VARIANT[variant];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchKeyword('');
        if (serverSearch) onSearchChange('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, serverSearch, onSearchChange]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions =
    searchable && searchKeyword && !serverSearch
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : options;

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchKeyword('');
    if (serverSearch) onSearchChange('');
  };

  const handleSearchInput = (next: string) => {
    setSearchKeyword(next);
    if (serverSearch) onSearchChange(next);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        className={trigger.button}
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          setSearchKeyword('');
          if (serverSearch) onSearchChange('');
        }}
      >
        <span
          className={`${trigger.label} ${
            selectedOption
              ? 'text-gray-900'
              : showPlaceholderColor
                ? 'text-gray-400'
                : 'text-gray-900'
          }`}
        >
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

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-[71] ${maxHeight} flex flex-col`}>
          {searchable && (
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => handleSearchInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {emptyMessage}
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

            {hasMore && onLoadMore ? (
              <div className="sticky bottom-0 border-t border-gray-200 bg-white p-2">
                <button
                  type="button"
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  disabled={isLoadingMore}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadMore();
                  }}
                >
                  {isLoadingMore
                    ? '불러오는 중…'
                    : loadMoreLabel ?? '더보기'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
