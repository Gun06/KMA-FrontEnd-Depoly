import { useState, useEffect } from 'react';
import { tokenService } from '@/utils/tokenService';
import { decodeToken } from '@/utils/jwt';

interface User {
  id: string;
  name: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenService.getAccessToken();
      
      if (!token || !tokenService.isTokenValid()) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      try {
        const payload = decodeToken(token);
        if (payload && typeof payload === 'object' && 'sub' in payload) {
          setAuthState({
            isAuthenticated: true,
            user: {
              id: payload.sub as string,
              name: (payload as any).name || (payload as any).username || '사용자',
              email: (payload as any).email,
            },
            isLoading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    checkAuth();

    // 로그아웃 브로드캐스트 리스너 설정
    const cleanup = tokenService.setupLogoutListener(() => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    });

    // 토큰 상태 변경 감지를 위한 주기적 체크 (5초마다)
    const interval = setInterval(() => {
      const token = tokenService.getAccessToken();
      const isValid = tokenService.isTokenValid();
      
      setAuthState(prevState => {
        // 상태가 변경된 경우에만 업데이트
        if (prevState.isAuthenticated !== isValid) {
          if (!isValid) {
            return {
              isAuthenticated: false,
              user: null,
              isLoading: false,
            };
          } else {
            // 토큰이 유효해진 경우 다시 체크
            checkAuth();
            return prevState;
          }
        }
        return prevState;
      });
    }, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  return authState;
}

export function useAuthActions() {
  const login = (token: string, refreshToken?: string) => {
    tokenService.setAccessToken(token);
    if (refreshToken) {
      tokenService.saveRefreshToken(refreshToken);
    }
  };

  const logout = () => {
    tokenService.clearAllTokens();
    tokenService.broadcastLogout();
  };

  return { login, logout };
}