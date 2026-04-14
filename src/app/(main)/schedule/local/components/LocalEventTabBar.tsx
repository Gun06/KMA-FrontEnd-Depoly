'use client';

import clsx from 'clsx';

export type LocalEventTabKey = 'register' | 'mine';

type Props = {
  tab: LocalEventTabKey;
  onTabChange: (tab: LocalEventTabKey) => void;
};

/** 마이페이지 탭과 동일한 선택 효과(파란 글자 + 굵기) */
export default function LocalEventTabBar({ tab, onTabChange }: Props) {
  return (
    <div className="mb-8">
      <div className="flex rounded-xl border border-gray-300 bg-white px-2 py-3 sm:px-4 divide-x divide-gray-200">
        <button
          type="button"
          onClick={() => onTabChange('register')}
          className={clsx(
            'flex-1 px-3 sm:px-6 text-center text-sm sm:text-base transition-colors',
            tab === 'register'
              ? 'text-blue-600 font-semibold'
              : 'text-gray-700 hover:text-gray-900'
          )}
        >
          등록
        </button>
        <button
          type="button"
          onClick={() => onTabChange('mine')}
          className={clsx(
            'flex-1 px-3 sm:px-6 text-center text-sm sm:text-base transition-colors',
            tab === 'mine'
              ? 'text-blue-600 font-semibold'
              : 'text-gray-700 hover:text-gray-900'
          )}
        >
          내 지역대회
        </button>
      </div>
    </div>
  );
}
