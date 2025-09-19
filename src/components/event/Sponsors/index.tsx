"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useMediaQuery } from '@/hooks/useMediaQuery'
type Logo = {
  src: string
  alt: string
  href?: string
  width?: number
  height?: number
  isFixed?: boolean // 고정 스폰서 여부
}

interface SponsorsMarqueeProps {
  eventId?: string
}

// 속도는 이 파일에서만 제어 (단일 소스)
const SPEED_MS = 50000 // 50초



export default function SponsorsMarquee({ eventId }: SponsorsMarqueeProps) {
  const [hosts, setHosts] = useState<Logo[]>([]);
  const [organizers, setOrganizers] = useState<Logo[]>([]);
  const [sponsors, setSponsors] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 모바일 여부 감지
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // 이전 API 호출 상태를 저장하여 중복 호출 방지
  const lastApiCallRef = useRef<{ eventId: string; isMobile: boolean } | null>(null);
  
  // API 호출 함수를 useCallback으로 메모이제이션
  const fetchSponsors = useCallback(async (eventId: string, isMobile: boolean) => {
    // 이전과 동일한 API 호출인지 확인
    const currentCall = { eventId, isMobile };
    if (lastApiCallRef.current && 
        lastApiCallRef.current.eventId === currentCall.eventId && 
        lastApiCallRef.current.isMobile === currentCall.isMobile) {
      return; // 중복 호출 방지
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 모바일/데스크톱 구분해서 배너 가져오기
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const serviceType = isMobile ? 'mobile' : 'desktop';
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/event-banner?serviceType=${serviceType}`;
      
      const response = await fetch(API_ENDPOINT);
      
      if (response.ok) {
        const data = await response.json();
        
        // staticBanner와 nonStaticBanner 배열을 합쳐서 처리
        const allBanners = [
          ...(data.staticBanner || []),
          ...(data.nonStaticBanner || [])
        ];
        
        // 배너 타입별로 분류
        const hosts = allBanners.filter((banner: any) => banner.bannerType === 'HOST').map((banner: any) => ({
          src: banner.imgUrl,
          alt: banner.providerName,
          href: banner.imglinkedUrl,
          isFixed: banner.static
        }));
        
        const organizers = allBanners.filter((banner: any) => banner.bannerType === 'ORGANIZER').map((banner: any) => ({
          src: banner.imgUrl,
          alt: banner.providerName,
          href: banner.imglinkedUrl,
          isFixed: banner.static
        }));
        
        const sponsors = allBanners.filter((banner: any) => banner.bannerType === 'SPONSOR').map((banner: any) => ({
          src: banner.imgUrl,
          alt: banner.providerName,
          href: banner.imglinkedUrl,
          isFixed: banner.static
        }));
        
        setHosts(hosts);
        setOrganizers(organizers);
        setSponsors(sponsors);
        
        // 성공한 API 호출 상태 저장
        lastApiCallRef.current = currentCall;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('스폰서 정보를 가져오는데 실패했습니다:', error);
      setError('스폰서 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // API에서 스폰서 정보 가져오기 (디바운싱 적용)
  useEffect(() => {
    if (!eventId) return;

    // 디바운싱: 300ms 후에 API 호출
    const timeoutId = setTimeout(() => {
      fetchSponsors(eventId, isMobile);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [eventId, isMobile, fetchSponsors]);



  // API 데이터가 없으면 렌더링하지 않음
  if (isLoading) {
    return (
      <section aria-label="organizer" className="bg-white">
        <div className="mx-auto max-w-[1920px] px-0 md:px-4 py-6 md:py-8">
          <div className="text-center text-gray-500">스폰서 정보를 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (error || (!hosts.length && !organizers.length && !sponsors.length)) {
    return (
      <section aria-label="organizer" className="bg-white">
        <div className="mx-auto max-w-[1920px] px-0 md:px-4 py-6 md:py-8">
          <div className="text-center text-gray-500">스폰서 정보가 없습니다</div>
        </div>
      </section>
    );
  }

  // 모든 스폰서를 타입별로 분류
  const all: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = [
    ...hosts.map((l: Logo) => ({ type: 'host' as const, logo: l })),
    ...organizers.map((l: Logo) => ({ type: 'organizer' as const, logo: l })),
    ...sponsors.map((l: Logo) => ({ type: 'sponsor' as const, logo: l })),
  ]

  // 고정 스폰서와 순환 스폰서 분리 (반응형)
  // 모바일과 데스크톱에 따라 다른 로직 적용
  let fixedSponsors: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = []
  let mobileFixedSponsors: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = []
  let mobileRotatingSponsors: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = []
  let rotatingSponsors: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = []

  if (isMobile) {
    // 모바일: API에서 mobile=true로 응답이 옴
    // staticBanner는 고정, nonStaticBanner는 순환
    const staticBanners = hosts.filter(h => h.isFixed).concat(organizers.filter(o => o.isFixed)).concat(sponsors.filter(s => s.isFixed))
    const nonStaticBanners = hosts.filter(h => !h.isFixed).concat(organizers.filter(o => !o.isFixed)).concat(sponsors.filter(s => !s.isFixed))
    
    mobileFixedSponsors = staticBanners.map(banner => {
      const type = hosts.includes(banner) ? 'host' : organizers.includes(banner) ? 'organizer' : 'sponsor'
      return { type, logo: banner }
    })
    mobileRotatingSponsors = nonStaticBanners.map(banner => {
      const type = hosts.includes(banner) ? 'host' : organizers.includes(banner) ? 'organizer' : 'sponsor'
      return { type, logo: banner }
    })
  } else {
    // 데스크톱: API에서 mobile=false로 응답이 옴
    // 모든 isFixed: true인 배너를 고정으로 처리
    fixedSponsors = all.filter(item => item.logo.isFixed)
    rotatingSponsors = all.filter(item => !item.logo.isFixed)
  }

  // 타이틀 라벨
  const labelMap: Record<'host' | 'organizer' | 'sponsor', string> = {
    host: '주최',
    organizer: '주관',
    sponsor: '후원',
  }

  const item = (entry: { type: 'host' | 'organizer' | 'sponsor'; logo: Logo }, idx: number) => {
    const badgeColorMap: Record<'host' | 'organizer' | 'sponsor', string> = {
      host: 'bg-red-100 text-red-800',
      organizer: 'bg-blue-100 text-blue-800',
      sponsor: 'bg-amber-100 text-amber-800',
    }
    const badge = (
      <span className={`absolute left-2 top-2 px-1 md:px-1.5 py-0.5 rounded-md text-[9px] md:text-xs whitespace-nowrap shadow-sm ${badgeColorMap[entry.type]}`}>
        {labelMap[entry.type]}
      </span>
    )
    const card = (
      <div className="relative h-16 w-[160px] md:h-24 md:w-[240px] rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {badge}
        <div className="h-full w-full flex items-center justify-center">
          <Image
            src={entry.logo.src}
            alt={entry.logo.alt}
            width={entry.logo.width ?? 160}
            height={entry.logo.height ?? 48}
            priority={entry.logo.isFixed}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    )
    return entry.logo.href ? (
      <a href={entry.logo.href} aria-label={entry.logo.alt} className="block">
        {card}
      </a>
    ) : (
      card
    )
  }

  // 순환 스폰서용 마키 트랙 생성 (반응형)
  const desktopRotatingTrack = (
    <ul className="flex items-center gap-4 md:gap-8 px-3 md:px-4">
      {rotatingSponsors.map((entry, idx) => (
        <li key={`rotating-${entry.type}-${idx}`} className="shrink-0">
          {item(entry, idx)}
        </li>
      ))}
    </ul>
  )
  
  const mobileRotatingTrack = (
    <ul className="flex items-center gap-4 md:gap-8 px-3 md:px-4">
      {mobileRotatingSponsors.map((entry, idx) => (
        <li key={`mobile-rotating-${entry.type}-${idx}`} className="shrink-0">
          {item(entry, idx)}
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-label="organizer" className="bg-white">
      <div className="mx-auto max-w-[1920px] px-0 md:px-4 py-6 md:py-8">
        {/* 데스크톱 버전 */}
        <div className="hidden md:flex items-center">
          
          {/* 왼쪽 고정 스폰서 영역 */}
          {fixedSponsors.length > 0 && (
            <div className="flex items-center gap-4 md:gap-6 px-4 md:px-8 shrink-0 z-10 bg-white">
              {fixedSponsors.map((entry, idx) => (
                <div key={`fixed-${entry.type}-${idx}`} className="shrink-0">
                  {item(entry, idx)}
                </div>
              ))}
              {/* 구분선 */}
              {rotatingSponsors.length > 0 && (
                <div className="w-px h-12 md:h-16 bg-gray-200 mx-2 md:mx-2 shrink-0" />
              )}
            </div>
          )}

          {/* 오른쪽 순환 스폰서 영역 (마키) */}
          {rotatingSponsors.length > 0 && (
            <div className="flex-1 relative overflow-hidden">
              <div className="marquee flex w-max">
                {desktopRotatingTrack}
                {desktopRotatingTrack}
              </div>
            </div>
          )}
          
        </div>

        {/* 모바일 버전 */}
        <div className="flex md:hidden items-center">
          
          {/* 왼쪽 고정 스폰서 영역 (주최만) */}
          {mobileFixedSponsors.length > 0 && (
            <div className="flex items-center gap-4 px-4 shrink-0 z-10 bg-white">
              {mobileFixedSponsors.map((entry, idx) => (
                <div key={`mobile-fixed-${entry.type}-${idx}`} className="shrink-0">
                  {item(entry, idx)}
                </div>
              ))}
              {/* 구분선 */}
              {mobileRotatingSponsors.length > 0 && (
                <div className="w-px h-12 bg-gray-200 mx-2 shrink-0" />
              )}
            </div>
          )}

          {/* 오른쪽 순환 스폰서 영역 (주관, 후원 포함) */}
          {mobileRotatingSponsors.length > 0 && (
            <div className="flex-1 relative overflow-hidden">
              <div className="marquee flex w-max">
                {mobileRotatingTrack}
                {mobileRotatingTrack}
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      <style jsx>{`
        .marquee {
          animation: marquee ${SPEED_MS}ms linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

