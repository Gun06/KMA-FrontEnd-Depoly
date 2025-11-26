'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button/Button';
import { authService } from '@/services/auth';
import logoImage from '@/assets/images/main/logo.jpg';
import { toast } from 'react-toastify';
// 로그인 후처리는 authService로 일원화됨

// 역할 파싱/스토어 업데이트 로직 제거 (중복 방지)

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    rememberId: false,
  });
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({});
  
  // returnUrl 파라미터 가져오기
  const returnUrl = searchParams.get('returnUrl');

  // 저장된 아이디 불러오기
  useEffect(() => {
    const rememberedId = authService.getRememberedId();
    if (rememberedId) {
      setFormData(prev => ({ ...prev, id: rememberedId, rememberId: true }));
    }
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // 전역 에러 메시지 초기화
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: { id?: string; password?: string } = {};
    if (!formData.id.trim()) {
      newErrors.id = '아이디를 입력해주세요.';
    }
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 중복 알림 방지: 전역 에러 블록에서 안내가 이미 보임
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      // 로그인 성공 시 공용 후처리가 수행되므로 여기서는 라우팅/알림만 담당
      if (response.token || response.accessToken) {
        toast.success('로그인되었습니다.');
        
        // returnUrl이 있으면 해당 페이지로, 없으면 홈으로 이동
        const redirectUrl = returnUrl && returnUrl !== '/login' ? returnUrl : '/';
        router.push(redirectUrl);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
      {/* 메인 컨테이너 */}
      <div className="w-full max-w-lg">
        {/* 콘텐츠 영역 */}
        <div className="p-8">
          <div className="space-y-6 w-full max-w-md mx-auto">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center space-x-6">
                {/* 로고 */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-kma-blue">
                  <Image
                    src={logoImage}
                    alt="전국마라톤협회 로고"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 제목 */}
                <div className="text-left">
                  <h1 className="text-4xl font-giants text-kma-black mb-2 leading-none">
                    전/마/협
                  </h1>
                  <p className="text-2xl text-[#999999] font-pretendard">
                    전국마라톤협회
                  </p>
                </div>
              </div>
              <p className="text-[#898989] font-pretendard text-[15px]">
                회원 서비스 이용을 위해 로그인해 주세요
              </p>
            </div>

            {/* 로그인 폼 */}
            <div className="mt-14">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID 입력 필드 */}
                <div>
                  <input
                    type="text"
                    placeholder="ID"
                    value={formData.id}
                    onChange={e => handleInputChange('id', e.target.value)}
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  {errors.id && (
                    <p className="text-xs text-kma-red mt-1">{errors.id}</p>
                  )}
                </div>

                {/* 비밀번호 입력 필드 */}
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    className="w-full h-[60px] px-4 text-lg border border-[#DFE0E4] rounded-[5px] outline-none focus:border-kma-blue transition-colors"
                  />
                  {errors.password && (
                    <p className="text-xs text-kma-red mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 전역 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-kma-red text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* 로그인 버튼 */}
                <Button
                  type="submit"
                  tone="primary"
                  size="lg"
                  full
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </div>

            {/* 옵션 섹션 */}
            <div className="space-y-10">
              {/* 아이디 저장 체크박스 (디자인 유지, 텍스트만 변경) */}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange('rememberId', !formData.rememberId)
                  }
                  className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.rememberId
                        ? 'border-kma-blue bg-kma-blue'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {formData.rememberId && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium">로그인 상태 유지하기</span>
                </button>
              </div>

              {/* 계정 관련 링크 */}
              <div className="flex items-center justify-center space-x-6 text-sm">
                <a
                  href="/find-id"
                  className="text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  아이디 찾기
                </a>
                <div className="w-px h-4 bg-gray-300"></div>
                <a
                  href="/find-password"
                  className="text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  비밀번호 찾기
                </a>
                <div className="w-px h-4 bg-gray-300"></div>
                <a
                  href="/signup"
                  className="text-gray-600 hover:text-kma-blue transition-colors font-medium"
                >
                  회원가입
                </a>
              </div>
            </div>

            {/* 푸터 섹션 */}
            <div className="text-center space-y-3 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#AEAEB2] font-medium">
                © 2025. RUN1080. All Right Reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <a
                  href="/"
                  className="text-[#AEAEB2] hover:text-kma-blue transition-colors font-medium"
                >
                  전국 마라톤 협회 공식 사이트
                </a>
                <div className="w-px h-3 bg-gray-300"></div>
                <a
                  href="/privacy"
                  className="text-[#AEAEB2] hover:text-kma-blue transition-colors font-medium"
                >
                  개인정보처리방침
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
