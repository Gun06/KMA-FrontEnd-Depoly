"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { SponsorBanner } from '@/types/event'

export default function SponsorSection() {
  
  // API 데이터 상태
  const [sponsorData, setSponsorData] = useState<SponsorBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)
  const marqueeRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  // API에서 스폰서 배너 데이터 가져오기
  useEffect(() => {
    const fetchSponsorData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER
        
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.')
        }
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/main-page/main-sponsor`
        
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        
        if (response.ok) {
          const data: SponsorBanner[] = await response.json()
          
          // visible이 true인 배너만 필터링하고 orderNo 순으로 정렬
          const visibleBanners = data
            .filter(banner => banner.visible)
            .sort((a, b) => a.orderNo - b.orderNo)
          
          setSponsorData(visibleBanners)
        } else {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
      } catch (_error) {
        // 서버 에러 시 기본 데이터 사용
        setSponsorData([])
        setError(null) // 에러 상태를 null로 설정하여 기본 데이터 표시
      } finally {
        setIsLoading(false)
      }
    }

    fetchSponsorData()
  }, [])

  // 표시할 배너 결정 (API 데이터만 사용, 더미 데이터 제거)
  const baseBanners = sponsorData.length > 0 
    ? sponsorData.map(banner => ({ src: banner.imageUrl, alt: banner.url, url: banner.url }))
    : []
  
  // 중복 제거 (URL 기준) - 관리자 미리보기와 동일한 로직
  const uniqueBanners = baseBanners.filter((banner, index, arr) => 
    arr.findIndex(other => other.src === banner.src) === index
  )
  
  // 최소 12개가 되도록 반복 (관리자 미리보기와 동일한 로직)
  const banners = uniqueBanners.length > 0
    ? Array.from({ length: Math.max(12, uniqueBanners.length * 3) }, (_, i) => uniqueBanners[i % uniqueBanners.length])
    : []

  // 로딩 중이거나 데이터가 없을 때도 스켈레톤 표시 (기본값: true)
  const showSkeleton = isLoading || banners.length === 0;

  useEffect(() => {
    if (!marqueeRef.current || !listRef.current || banners.length === 0) return

    let animationFrameId: number
    let offset = 0
    let listWidth = listRef.current.scrollWidth
    const speed = 1.6

    const updateWidth = () => {
      if (!listRef.current) return
      listWidth = listRef.current.scrollWidth
    }

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(listRef.current)

    const animate = () => {
      if (!marqueeRef.current || listWidth === 0) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      offset -= speed
      if (Math.abs(offset) >= listWidth) {
        offset += listWidth
      }

      marqueeRef.current.style.transform = `translate3d(${offset}px, 0, 0)`
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [banners.length])

  return (
    <section 
      className="relative bg-white sponsor-section" 
      style={{ 
        height: 'var(--sectionH, 140px)',
        minHeight: 'var(--sectionH, 140px)' // 최소 높이 보장 + fallback
      }}
    >
      {/* 이미지 트랙 (12개 반복, 중앙 정렬, 무한 이동) */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden z-10"
        style={{ 
          height: 'var(--imgH, 80px)',
          minHeight: 'var(--imgH, 80px)' // 최소 높이 보장 + fallback
        }}
      >
        {/* 로딩 스켈레톤 - 항상 먼저 렌더링하여 레이아웃 유지 (기본값: 보임) */}
        <div 
          className="absolute top-0 right-0 bottom-0 flex items-center gap-4 md:gap-6 lg:gap-8 px-0 h-full overflow-hidden transition-opacity duration-300"
          style={{ 
            height: '100%',
            minHeight: 'var(--imgH, 80px)',
            // 초기 렌더링 시 항상 보이도록 강제 (showSkeleton이 false가 될 때까지)
            opacity: showSkeleton ? 1 : 0,
            zIndex: showSkeleton ? 20 : 0,
            pointerEvents: showSkeleton ? 'auto' : 'none',
            background: 'transparent'
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="shrink-0 w-32 md:w-40 lg:w-48 h-full rounded-lg"
              style={{ 
                height: 'var(--imgH, 80px)',
                minWidth: '128px',
                background: 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite linear'
              }}
            />
          ))}
        </div>

        {/* 실제 콘텐츠 - 항상 렌더링하되 조건부로 표시 */}
        <div 
          className={`relative w-full h-full transition-opacity duration-300 ${
            showSkeleton ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            height: '100%', 
            minHeight: 'var(--imgH, 80px)' // fallback 추가
          }}
        >
          <div ref={marqueeRef} className="marquee-track flex w-max items-center h-full leading-[0]">
            <ul ref={listRef} className="flex items-center gap-0 h-full px-0">
              {banners.map((banner, idx) => (
              <li key={`s-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <a 
                  href={banner.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image 
                    src={banner.src} 
                    alt={banner.alt} 
                    height={100} 
                    width={200}
                    style={{ height: 'var(--imgH, 80px)' }} 
                    className="w-auto object-contain hover:opacity-80 transition-opacity select-none" 
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </a>
              </li>
            ))}
          </ul>
          {/* 두 번째 트랙을 이어붙여 끊김 없는 루프 */}
          <ul className="flex items-center gap-0 h-full px-0">
            {banners.map((banner, idx) => (
              <li key={`s2-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <a 
                  href={banner.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image 
                    src={banner.src} 
                    alt={banner.alt} 
                    height={100} 
                    width={200}
                    style={{ height: 'var(--imgH, 80px)' }} 
                    className="w-auto object-contain hover:opacity-80 transition-opacity select-none" 
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>

      {/* 양쪽 파란 테두리 + 흰색 배경 영역 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20" style={{ width: 'var(--leftW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20" style={{ width: 'var(--rightW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>

      {/* 아래 구분선(회색 계열) */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 z-[60]" />

      <style jsx>{`
        .marquee-track { will-change: transform; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* 이미지 드래그 방지 */
        .marquee img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          pointer-events: none;
        }
        
        .marquee a {
          pointer-events: auto;
        }
        /* Desktop default (>=1280px) */
        .sponsor-section {
          --sectionH: clamp(140px, 9vw, 160px); /* 자연스럽게 증가 */
          --imgH: clamp(80px, 5.4vw, 96px);
          --imgW: clamp(200px, 17vw, 300px);
          --leftW: clamp(96px, 6.5vw, 120px);
          --rightW: clamp(96px, 6.5vw, 120px);
        }
        /* 1024–1279px */
        @media (max-width: 1279px) and (min-width: 1024px) {
          .sponsor-section {
            --sectionH: 120px;
            --imgH: 70px;
            --leftW: 96px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 96px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* 768–1023px (Tablet) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .sponsor-section {
            --sectionH: 100px;
            --imgH: 60px;
            --leftW: 32px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 32px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* 480–767px (Phones) */
        @media (max-width: 767px) and (min-width: 480px) {
          .sponsor-section {
            --sectionH: 80px;
            --imgH: 50px;
            --leftW: 12px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 12px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
        /* <=479px (Small phones) */
        @media (max-width: 479px) {
          .sponsor-section {
            --sectionH: 70px;
            --imgH: 44px;
            --leftW: 12px;    /* 주요대회일정 시작선과 맞춤 */
            --rightW: 12px;   /* 오른쪽도 동일하게 맞춤 */
          }
        }
      `}</style>
    </section>
  )
}