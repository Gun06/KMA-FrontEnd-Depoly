// 메인 문의사항 인증 훅

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';

export const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = authService.getToken();
        if (token) {
          // JWT 토큰에서 실제 사용자 ID 추출
          const userId = authService.getUserId();
          setCurrentUserId(userId);
        } else {
          setCurrentUserId(null);
        }
      } catch (error) {
        setCurrentUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    currentUserId,
    isLoading
  };
};
