'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import ProfileInfoPanel from '@/components/main/mypage/ProfileInfoPanel';
import { useMyProfile, useUnreadCount } from '@/app/(main)/mypage/profile/shared';
import {
  LocalEventBanner,
  LocalEventTabBar,
  type LocalEventTabKey,
  LocalEventRegisterPanel,
  LocalEventMineList,
} from './components';

export default function Client() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<LocalEventTabKey>('register');
  const [hydrationFallbackReady, setHydrationFallbackReady] = useState(false);
  const { isLoggedIn, accessToken, hasHydrated, user } = useAuthStore();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const unreadCount = useUnreadCount();
  const isAuthenticated = isLoggedIn && Boolean(accessToken);
  const hydrationSettled = hasHydrated || hydrationFallbackReady;
  const showAuthPending = !hydrationSettled;
  const showAccessGate = hydrationSettled && !isAuthenticated;

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'mine') setTab('mine');
    if (t === 'register') setTab('register');
  }, [searchParams]);

  // 드물게 persist hydration 신호가 늦거나 누락될 때 무한 스켈레톤 방지
  useEffect(() => {
    if (hasHydrated) {
      setHydrationFallbackReady(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setHydrationFallbackReady(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [hasHydrated]);

  return (
    <div className="min-h-[50vh] sm:min-h-screen flex flex-col">
      <main className="flex-1">
        <LocalEventBanner />

        <div className="w-full bg-white py-8 sm:py-10 md:py-14">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <ProfileInfoPanel
                name={profile?.name || user?.account}
                account={profile?.account || user?.account}
                birth={profile?.birth}
                gender={profile?.gender}
                role={user?.role}
                isLoading={showAuthPending || (isAuthenticated && isProfileLoading)}
                statusText="활성"
                unreadCountText={`${unreadCount}건`}
                onEditClick={() => router.push('/mypage/profile')}
              />

              <div className="order-2 min-w-0">
                <LocalEventTabBar tab={tab} onTabChange={setTab} />
                <div className="relative mt-4">
                  {tab === 'register' && isAuthenticated && <LocalEventRegisterPanel />}

                  {tab === 'mine' && isAuthenticated && <LocalEventMineList />}

                  {showAuthPending && (
                    <>
                      {tab === 'register' ? (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
                          <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-2xl bg-gray-100" />
                          <div className="mx-auto h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                          <div className="mx-auto mt-3 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                          <div className="mx-auto mt-8 h-10 w-48 animate-pulse rounded-xl bg-gray-100" />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                          <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
                          <div className="mt-4 h-40 animate-pulse rounded-lg bg-gray-50" />
                        </div>
                      )}
                    </>
                  )}

                  {showAccessGate && (
                    <>
                      {tab === 'register' ? (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
                          <div className="mx-auto mb-6 h-12 w-12 rounded-2xl bg-[#E8F0FF]" />
                          <div className="mx-auto h-4 w-5/6 rounded bg-gray-100" />
                          <div className="mx-auto mt-3 h-4 w-2/3 rounded bg-gray-100" />
                          <div className="mx-auto mt-8 h-10 w-48 rounded-xl bg-gray-100" />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                          <div className="h-12 rounded-lg bg-gray-100" />
                          <div className="mt-4 h-40 rounded-lg bg-gray-50" />
                        </div>
                      )}

                      {/* 마이페이지와 동일한 블러 강도: 탭 콘텐츠 영역에만 오버레이 */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/55 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-8 text-center shadow-sm">
                          <p className="text-lg font-semibold text-gray-900">
                            로그인 후 이용할 수 있습니다.
                          </p>
                          <p className="mt-2 text-sm text-gray-600">
                            {tab === 'register'
                              ? '지역대회 등록은 로그인 후 가능합니다.'
                              : '내 지역대회 조회는 로그인 후 가능합니다.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="mt-5 h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            로그인하러 가기
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
