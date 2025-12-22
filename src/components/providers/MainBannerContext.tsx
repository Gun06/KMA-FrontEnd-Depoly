// src/components/providers/MainBannerContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface MainBannerContextType {
  mainBannerColor: string | null;
  setMainBannerColor: (color: string | null) => void;
}

const MainBannerContext = createContext<MainBannerContextType | undefined>(
  undefined
);

const MAIN_BANNER_COLOR_KEY = 'main_banner_color';

interface MainBannerProviderProps {
  children: ReactNode;
  initialMainBannerColor?: string | null;
}

export function MainBannerProvider({ 
  children, 
  initialMainBannerColor = null 
}: MainBannerProviderProps) {
  const normalizedInitialColor =
    typeof initialMainBannerColor === 'string' && initialMainBannerColor.length > 0
      ? initialMainBannerColor
      : null;
  
  const [mainBannerColor, setMainBannerColor] = useState<string | null>(() => {
    if (normalizedInitialColor) return normalizedInitialColor;
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(MAIN_BANNER_COLOR_KEY);
    } catch {
      return null;
    }
  });

  // load from localStorage
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem(MAIN_BANNER_COLOR_KEY);
      if (savedColor) {
        setMainBannerColor(prev => prev ?? savedColor);
      }
    } catch {
      /* noop */
    }
  }, []);

  // 초기값이 갱신되면 컨텍스트도 함께 갱신
  useEffect(() => {
    if (normalizedInitialColor && normalizedInitialColor !== mainBannerColor) {
      setMainBannerColor(normalizedInitialColor);
    }
  }, [normalizedInitialColor, mainBannerColor]);

  // save to localStorage
  useEffect(() => {
    try {
      if (mainBannerColor) {
        localStorage.setItem(MAIN_BANNER_COLOR_KEY, mainBannerColor);
      } else {
        localStorage.removeItem(MAIN_BANNER_COLOR_KEY);
      }
    } catch {
      /* noop */
    }
  }, [mainBannerColor]);

  return (
    <MainBannerContext.Provider
      value={{ mainBannerColor, setMainBannerColor }}
    >
      {children}
    </MainBannerContext.Provider>
  );
}

// Event 페이지용 hook
export function useMainBanner() {
  const context = useContext(MainBannerContext);
  if (context === undefined) {
    throw new Error('useMainBanner must be used within a MainBannerProvider');
  }
  return context;
}

