import { useState, useEffect } from 'react';
import { getAccessToken, isTokenValid, decodeToken } from '@/utils/jwt';

export const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 현재 로그인한 사용자 ID 가져오기
  const getCurrentUserId = () => {
    const token = getAccessToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token) as { sub?: string; name?: string } | null;
      // name 필드를 우선으로 사용 (API의 authorName과 매칭)
      const userId = decoded?.name || decoded?.sub || null;
      return userId;
    }
    return null;
  };

  useEffect(() => {
    // 현재 사용자 ID 설정
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

  return {
    currentUserId
  };
};
