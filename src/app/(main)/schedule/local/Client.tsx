'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import {
  LocalEventBanner,
  LocalEventTabBar,
  type LocalEventTabKey,
  LocalEventLoginNotice,
  LocalEventRegisterPanel,
  LocalEventMineList,
} from './components';

export default function Client() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<LocalEventTabKey>('register');
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'mine') setTab('mine');
    if (t === 'register') setTab('register');
  }, [searchParams]);

  return (
    <div className="min-h-[50vh] sm:min-h-screen flex flex-col">
      <main className="flex-1">
        <LocalEventBanner />

        <div className="w-full bg-white py-8 sm:py-10 md:py-14">
          <div
            className={clsx(
              'mx-auto px-4 sm:px-6 lg:px-8',
              tab === 'mine' ? 'max-w-[1300px]' : 'max-w-3xl'
            )}
          >
            <p className="text-sm sm:text-base text-gray-600 text-center mb-8">
              지역에서 진행하는 대회를 등록하고, 내가 등록한 지역대회를 확인할 수 있습니다.
              <span className="block mt-1 text-gray-500 text-xs sm:text-sm">
                로그인 후 &quot;내 지역대회&quot; 목록 조회가 가능합니다.
              </span>
            </p>

            <LocalEventTabBar tab={tab} onTabChange={setTab} />

            {!isLoggedIn && <LocalEventLoginNotice />}

            {tab === 'register' && <LocalEventRegisterPanel />}

            {tab === 'mine' && isLoggedIn && <LocalEventMineList />}

            {tab === 'mine' && !isLoggedIn && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-6 py-12 text-center text-sm text-gray-500">
                로그인 후 내가 등록한 지역대회를 확인할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
