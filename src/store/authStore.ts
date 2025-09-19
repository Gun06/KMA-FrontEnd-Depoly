// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getRememberLogin } from '@/utils/jwt';

interface User {
  id: string;
  account: string;
  role: string;
  roles?: string[];
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;

  // Actions
  login: (
    tokens: { accessToken: string; refreshToken?: string },
    user: User
  ) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      login: (tokens, user) =>
        set({
          isLoggedIn: true,
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      updateUser: user => set({ user }),
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => {
        // SSR 안전 가드: 서버에서는 no-op 메모리 스토리지 사용
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        const remember = getRememberLogin();
        // true → localStorage, false → sessionStorage, null(초기) → localStorage 기본
        return remember === false ? sessionStorage : localStorage;
      }),
      // 영속화 대상에서 isLoggedIn 제외(파생 값)
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        // 저장소 로딩 완료 표시 및 안전 조정
        if (state) {
          const accessToken = state.accessToken;
          // accessToken이 있으면 isLoggedIn을 true로 보정 (혹시 불일치 대비)
          if (accessToken && !state.isLoggedIn) {
            // 상태 업데이트는 별도로 처리해야 함
            setTimeout(() => {
              useAuthStore.setState({ isLoggedIn: true, hasHydrated: true });
            }, 0);
          } else {
            useAuthStore.setState({ hasHydrated: true });
          }
        } else {
          useAuthStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);
