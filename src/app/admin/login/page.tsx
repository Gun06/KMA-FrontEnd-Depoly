'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { tokenService } from '@/utils/tokenService';
import { toast } from 'react-toastify';
import { authService } from '@/services/auth';
import logoImage from '@/assets/images/main/logo.jpg';

interface AdminLoginFormData {
  account: string;
  password: string;
}

/** 로그인 페이지 전용 폼 타입만 유지하고 나머지 로직은 서비스에 위임 */

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<AdminLoginFormData>({
    account: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tokenService.getAdminAccessToken()) {
      router.replace('/admin');
    }
  }, [router]);

  /** 서비스 함수 사용: 관리자 로그인 처리 */
  const handleLogin = async (credentials: AdminLoginFormData) => {
    try {
      setIsLoading(true);
      const result = await authService.adminLogin(credentials);

      if (!result.accessToken) {
        throw new Error('액세스 토큰을 받지 못했습니다.');
      }

      // 서비스에서 저장 및 스토어 업데이트 완료됨

      // 관리자 페이지로 이동
      router.replace('/admin');
    } catch (error) {
      const anyErr = error as unknown as {
        code?: string;
        mustChangePassword?: boolean;
        message?: string;
        response?: { message?: string };
      };
      
      // mustChangePassword 에러인 경우 비밀번호 변경 페이지로 리다이렉트
      if (anyErr?.code === 'MUST_CHANGE_PASSWORD' || anyErr?.mustChangePassword) {
        router.replace('/admin/admins/change-password');
        return;
      }
      
      const msg =
        anyErr?.response?.message ||
        anyErr?.message ||
        '로그인 처리 중 오류가 발생했습니다.';
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
        <div className="w-24 h-24 mx-auto mb-4 rounded-full ring-2 ring-green-600 overflow-hidden flex items-center justify-center bg-white">
          <Image
            src={logoImage}
            alt="전국마라톤협회 로고"
            width={96}
            height={96}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-giants text-gray-900 mb-2">
          전국마라톤협회
        </h1>
        <p className="text-lg text-gray-600 font-pretendard">Admin Login</p>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
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
    </div>
  );
}
