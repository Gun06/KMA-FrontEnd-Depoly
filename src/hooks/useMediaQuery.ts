import { useState, useEffect, useMemo } from 'react'
import { mediaMaxWidth, SCREEN_PX } from '@/lib/layout/breakpoints'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // SSR 환경에서는 window가 없으므로 체크
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    
    // 초기 값 설정
    setMatches(media.matches)
    
    // 실시간 변화 감지를 위한 콜백 함수
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // 이벤트 리스너 등록 (addEventListener 사용)
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // 구형 브라우저 지원
      media.addListener(listener)
    }
    
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // 구형 브라우저 지원
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

// 자주 사용되는 미디어 쿼리들을 위한 편의 훅들
export function useBreakpoints() {
  const isXs = useMediaQuery(mediaMaxWidth(SCREEN_PX.xs))
  const isSm = useMediaQuery(mediaMaxWidth(SCREEN_PX.sm))
  const isMd = useMediaQuery(mediaMaxWidth(SCREEN_PX.md))
  const isLg = useMediaQuery(mediaMaxWidth(SCREEN_PX.lg))
  const isXl = useMediaQuery(mediaMaxWidth(SCREEN_PX.xl))
  const isCustom = useMediaQuery(mediaMaxWidth(SCREEN_PX.custom))
  const is2xl = useMediaQuery(mediaMaxWidth(SCREEN_PX['2xl']))

  return useMemo(() => ({
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isCustom,
    is2xl,
    // 현재 활성 브레이크포인트
    currentBreakpoint: isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : isXl ? 'xl' : isCustom ? 'custom' : '2xl'
  }), [isXs, isSm, isMd, isLg, isXl, isCustom, is2xl])
} 