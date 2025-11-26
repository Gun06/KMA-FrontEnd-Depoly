/**
 * 네비게이션 중복 방지를 위한 가드 유틸리티
 */

// 네비게이션 진행 중 플래그
let isNavigating = false;
let navigationTimeout: NodeJS.Timeout | null = null;

/**
 * 네비게이션 가드 - 중복 네비게이션 방지
 */
export const navigationGuard = {
  /**
   * 네비게이션 시작
   */
  startNavigation: (): boolean => {
    if (isNavigating) {
      return false; // 이미 네비게이션 중이면 차단
    }
    
    isNavigating = true;
    
    // 3초 후 자동으로 플래그 리셋 (안전장치)
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
    }
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
    }, 3000);
    
    return true;
  },

  /**
   * 네비게이션 완료
   */
  endNavigation: (): void => {
    isNavigating = false;
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
      navigationTimeout = null;
    }
  },

  /**
   * 안전한 네비게이션 실행
   */
  safeNavigate: async (
    navigateFn: () => void | Promise<void>,
    delay: number = 0
  ): Promise<boolean> => {
    if (!navigationGuard.startNavigation()) {
      return false; // 네비게이션 차단됨
    }

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await navigateFn();
      return true;
    } catch (error) {
      navigationGuard.endNavigation();
      return false;
    }
  },

  /**
   * 현재 네비게이션 상태 확인
   */
  isNavigating: (): boolean => isNavigating,
};
