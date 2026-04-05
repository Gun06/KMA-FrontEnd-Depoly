'use client';

import clsx from 'clsx';

export type LocalEventTabKey = 'register' | 'mine';

type Props = {
  tab: LocalEventTabKey;
  onTabChange: (tab: LocalEventTabKey) => void;
};

export default function LocalEventTabBar({ tab, onTabChange }: Props) {
  return (
    <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50 mb-8">
      <button
        type="button"
        onClick={() => onTabChange('register')}
        className={clsx(
          'flex-1 py-2.5 text-sm font-medium rounded-md transition-colors',
          tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        )}
      >
        등록
      </button>
      <button
        type="button"
        onClick={() => onTabChange('mine')}
        className={clsx(
          'flex-1 py-2.5 text-sm font-medium rounded-md transition-colors',
          tab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        )}
      >
        내 지역대회
      </button>
    </div>
  );
}
