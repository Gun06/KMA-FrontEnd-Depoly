'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { decodeToken } from '@/utils/jwt';
import { toast } from 'react-toastify';
import { adminAuthService, type AdminLoginCredentials } from '@/services/admin';

type DecodedAdminToken = {
  role?: Array<{ authority?: string } | string>;
  roles?: Array<string>;
  sub?: string;
  admin_id?: string;
  name?: string;
};

interface AdminLoginFormData {
  account: string;
  password: string;
}

interface LoginTokens {
  accessToken: string;
  refreshToken?: string;
}

/** 역할 문자열 정규화 (ROLE_ 프리픽스 제거, 대문자) */
function normalizeRoleName(role?: unknown): string | null {
  if (typeof role !== 'string') return null;
  const upper = role.toUpperCase();
  return upper.startsWith('ROLE_') ? upper.replace(/^ROLE_/i, '') : upper;
}

/** 토큰 저장 및 store 업데이트 */
function saveTokensAndUpdateStore(tokens: LoginTokens): void {
  try {
    if (typeof window !== 'undefined') {
      // localStorage에 토큰 저장 (새 키)
      localStorage.setItem('kmaAdminAccessToken', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('kmaAdminRefreshToken', tokens.refreshToken);
      }

      // JWT에서 사용자 정보 추출
      const decodedToken = decodeToken(
        tokens.accessToken
      ) as DecodedAdminToken | null;

      // 역할 추출 (유연 처리)
      const extractedRoles: string[] = [];
      // 1) decodedToken.role: [{ authority: 'ROLE_X' }, ...] 형태
      if (Array.isArray(decodedToken?.role)) {
        for (const r of decodedToken.role) {
          const n =
            typeof r === 'string'
              ? normalizeRoleName(r)
              : normalizeRoleName(r?.authority);
          if (n) extractedRoles.push(n);
        }
      }
      // 2) decodedToken.roles: ['ROLE_X', 'Y'] 형태
      if (Array.isArray(decodedToken?.roles)) {
        for (const r of decodedToken.roles) {
          const n = normalizeRoleName(r);
          if (n) extractedRoles.push(n);
        }
      }
      // 3) decodedToken.authorities 등 기타 키가 있다면 필요 시 추가

      // 중복 제거
      const roles = Array.from(new Set(extractedRoles));
      const primaryRole =
        (Array.isArray(decodedToken?.role)
          ? typeof decodedToken!.role[0] === 'string'
            ? (decodedToken!.role[0] as string)
            : (decodedToken!.role[0] as { authority?: string })?.authority
          : undefined) || undefined;

      // authStore에 로그인 정보 저장
      useAuthStore.getState().login(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        {
          id: decodedToken?.sub || decodedToken?.admin_id || 'admin',
          account: decodedToken?.name || 'admin', // UUID가 들어와도 그대로 저장
          role: primaryRole || 'ROLE_SUPER_ADMIN',
          roles,
        }
      );

      console.log('Tokens saved and store updated successfully');
    }
  } catch (error) {
    console.error('Failed to save tokens or update store:', error);
    throw new Error('토큰 저장 및 store 업데이트에 실패했습니다.');
  }
}

/** 토큰 삭제 및 store 초기화 */
function clearTokensAndStore(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmaAdminAccessToken');
      localStorage.removeItem('kmaAdminRefreshToken');

      // authStore 초기화
      useAuthStore.getState().logout();

      console.log('Tokens cleared and store reset successfully');
    }
  } catch (error) {
    console.error('Failed to clear tokens or reset store:', error);
  }
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<AdminLoginFormData>({
    account: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 이미 로그인된 경우 로그인 페이지 접근 시 /admin으로 이동
  const { accessToken } = useAuthStore();
  useEffect(() => {
    if (accessToken) {
      router.replace('/admin');
    }
  }, [accessToken, router]);

  /** 서비스 함수 사용: 관리자 로그인 처리 */
  const handleLogin = async (credentials: AdminLoginFormData) => {
    try {
      setIsLoading(true);
      const result = await adminAuthService.login(
        credentials as AdminLoginCredentials
      );

      if (!result.accessToken) {
        throw new Error('액세스 토큰을 받지 못했습니다.');
      }

      const tokens: LoginTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };

      // 토큰 저장 및 store 업데이트
      saveTokensAndUpdateStore(tokens);
      console.log('로그인 성공 - 토큰 저장 완료');

      // 관리자 페이지로 이동
      router.replace('/admin');
    } catch (error) {
      console.error('로그인 처리 실패:', error);
      const anyErr = error as unknown as {
        response?: { message?: string };
        message?: string;
      };
      const msg = anyErr?.response?.message || anyErr?.message || '로그인 처리 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 간단 유효성 검사
    if (!formData.account.trim() || !formData.password.trim()) {
      toast.error('ID와 Password를 입력해 주세요.');
      return;
    }

    // 서비스 함수를 통한 로그인 호출
    handleLogin(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="mb-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold text-center">
            National
            <br />
            Marathon
            <br />
            Association
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          전국마라톤협회
        </h1>
        <p className="text-lg text-gray-600">Administrator Login</p>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <input
            type="text"
            name="account"
            value={formData.account}
            onChange={handleInputChange}
            placeholder="ID"
            autoComplete="username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            disabled={isLoading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="mt-8 text-sm text-gray-500 text-center">
        관리자 서비스를 이용하기 위해 로그인하세요
      </p>

      {/* 임시 로그아웃 버튼 */}
      <button
        onClick={() => clearTokensAndStore()}
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
