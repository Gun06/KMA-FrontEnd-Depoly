'use client';

import { RotateCcw, Search } from 'lucide-react';
import SelectMenu from '@/components/common/filters/SelectMenu';
import Button from '@/components/common/Button/Button';
import { cn } from '@/utils/cn';

type Opt = { label: string; value: string };

type Props = {
  year: string;
  regStatus: string;
  visibleStatus: string;
  keyword: string;
  yearOptions: Opt[];
  onYearChange: (v: string) => void;
  onRegStatusChange: (v: string) => void;
  onVisibleStatusChange: (v: string) => void;
  onKeywordChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
};

const REG_OPTIONS: Opt[] = [
  { label: '전체', value: '' },
  { label: '비접수', value: 'none' },
  { label: '접수중', value: 'ing' },
  { label: '접수마감', value: 'done' },
  { label: '최종마감', value: 'final_closed' },
  { label: '업로드신청', value: 'upload_applying' },
];

const VIS_OPTIONS: Opt[] = [
  { label: '전체', value: '' },
  { label: '공개', value: 'open' },
  { label: '테스트', value: 'test' },
  { label: '비공개', value: 'closed' },
];

export default function LocalEventMineSearchControls({
  year,
  regStatus,
  visibleStatus,
  keyword,
  yearOptions,
  onYearChange,
  onRegStatusChange,
  onVisibleStatusChange,
  onKeywordChange,
  onSearch,
  onReset,
}: Props) {

  const hasFilter = year !== '' || regStatus !== '' || visibleStatus !== '' || keyword !== '';

  return (
    <div className="mb-4">
      {/* ── 모바일 (sm 미만) ── */}
      <div className="sm:hidden space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <SelectMenu
            label="년도"
            value={year}
            onChange={onYearChange}
            options={yearOptions}
            buttonTextMode="current"
            menuMaxHeight={280}
            fullWidth
            compact
            safeTop={48}
          />
          <SelectMenu
            label="신청여부"
            value={regStatus}
            onChange={onRegStatusChange}
            options={REG_OPTIONS}
            buttonTextMode="current"
            menuMaxHeight={280}
            fullWidth
            compact
            safeTop={48}
          />
          <div className="col-span-2 flex gap-2 items-stretch">
            <div className="flex-1 min-w-0 flex">
              <SelectMenu
                label="공개여부"
                value={visibleStatus}
                onChange={onVisibleStatusChange}
                options={VIS_OPTIONS}
                buttonTextMode="current"
                menuMaxHeight={280}
                fullWidth
                compact
                safeTop={48}
              />
            </div>
            <button
              type="button"
              onClick={onReset}
              aria-label="초기화"
              title="초기화"
              className={cn(
                'shrink-0 min-h-[44px] h-11 px-3 flex items-center justify-center rounded-[5px] border bg-white active:scale-95 transition-all',
                hasFilter
                  ? 'border-blue-300 text-blue-500 hover:bg-blue-50'
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              )}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 검색창 + 검색 버튼 */}
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-[5px] border border-[#CDD1D5] bg-white min-h-[44px] h-11 px-3 focus-within:border-[#256EF4]">
            <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="검색어를 입력해주세요."
              className="flex-1 min-w-0 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={onSearch}
            className="shrink-0 min-h-[44px] h-11 px-3 rounded-[5px] bg-[#1E2124] text-white text-[13px] font-medium hover:bg-[#33363D] active:scale-95 transition-all"
          >
            검색
          </button>
        </div>

        {/* 활성 필터 chip 표시 */}
        {hasFilter && (
          <div className="flex flex-wrap gap-1.5">
            {year && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                {year}년
                <button type="button" onClick={() => onYearChange('')} className="ml-0.5 text-blue-500 hover:text-blue-800 leading-none">&times;</button>
              </span>
            )}
            {regStatus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                {REG_OPTIONS.find(o => o.value === regStatus)?.label}
                <button type="button" onClick={() => onRegStatusChange('')} className="ml-0.5 text-blue-500 hover:text-blue-800 leading-none">&times;</button>
              </span>
            )}
            {visibleStatus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                {VIS_OPTIONS.find(o => o.value === visibleStatus)?.label}
                <button type="button" onClick={() => onVisibleStatusChange('')} className="ml-0.5 text-blue-500 hover:text-blue-800 leading-none">&times;</button>
              </span>
            )}
            {keyword && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                &ldquo;{keyword}&rdquo;
                <button type="button" onClick={() => onKeywordChange('')} className="ml-0.5 text-blue-500 hover:text-blue-800 leading-none">&times;</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 데스크탑 (sm 이상) ── */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        <SelectMenu
          label="년도"
          value={year}
          onChange={onYearChange}
          options={yearOptions}
          buttonTextMode="current"
          menuMaxHeight={280}
        />
        <SelectMenu
          label="신청여부"
          value={regStatus}
          onChange={onRegStatusChange}
          options={REG_OPTIONS}
          buttonTextMode="current"
          menuMaxHeight={280}
        />
        <SelectMenu
          label="공개여부"
          value={visibleStatus}
          onChange={onVisibleStatusChange}
          options={VIS_OPTIONS}
          buttonTextMode="current"
          menuMaxHeight={280}
        />

        <label className="flex items-center gap-2 rounded-[5px] border border-[#58616A] bg-white h-10 px-3 min-w-[280px] focus-within:border-[#256EF4]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="검색어를 입력해주세요."
            className="flex-1 min-w-0 bg-transparent text-[15px] text-[#1E2124] placeholder:text-gray-400 outline-none"
          />
        </label>

        <div className="flex items-center gap-2">
          <Button type="button" tone="dark" size="xs" widthType="compact" onClick={onSearch}>
            검색
          </Button>
          <Button
            type="button"
            tone="neutral"
            size="xs"
            widthType="compact"
            iconLeft={<RotateCcw className="w-[18px] h-[18px]" aria-hidden />}
            onClick={onReset}
          >
            초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
