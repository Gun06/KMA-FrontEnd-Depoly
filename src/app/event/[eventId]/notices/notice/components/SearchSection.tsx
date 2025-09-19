import { ChevronDown } from 'lucide-react';
import { CategoryItem } from '../types';

interface SearchSectionProps {
  categories: CategoryItem[];
  isDropdownOpen: boolean;
  selectedSearchType: string;
  onDropdownToggle: () => void;
  onSearchTypeChange: (type: string) => void;
}

export const SearchSection = ({ 
  categories, 
  isDropdownOpen, 
  selectedSearchType, 
  onDropdownToggle, 
  onSearchTypeChange 
}: SearchSectionProps) => {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
      {/* 카테고리 드롭다운 */}
      <div className="relative">
        <button
          type="button"
          onClick={onDropdownToggle}
          className="w-32 h-10 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
        >
          <span className="text-[15px] leading-[26px] text-[#1E2124]">
            {categories.find(cat => cat.id === selectedSearchType)?.name || '전체'}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#33363D] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <>
            {/* 백드롭 */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={onDropdownToggle}
            />
            {/* 드롭다운 메뉴 */}
            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#CDD1D5] rounded-md shadow-lg z-20 py-1">
              {/* 전체 옵션 */}
              <button
                type="button"
                onClick={() => onSearchTypeChange('all')}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  selectedSearchType === 'all' ? 'bg-[#EEF2F7]' : ''
                }`}
              >
                전체
              </button>
              {/* 카테고리 옵션들 */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSearchTypeChange(category.id)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    selectedSearchType === category.id ? 'bg-[#EEF2F7]' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          placeholder="검색어를 입력해주세요."
          className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
