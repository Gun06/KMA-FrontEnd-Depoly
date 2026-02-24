'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import { MainBannerItem } from '@/types/event';
import ApiBannerSlide from './ApiBannerSlide';
// Swiper 스타일
import 'swiper/css';
import 'swiper/css/navigation';

export default function MarathonHeroCarousel() {
  const [bannerData, setBannerData] = useState<MainBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // API에서 메인 배너 데이터 가져오기
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/public/main-page/main-banner`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data: MainBannerItem[] = await response.json();
          // orderNo 기준으로 정렬
          const sortedData = data.sort((a, b) => a.orderNo - b.orderNo);
          setBannerData(sortedData);
        } else {
          setError('배너 데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('배너 데이터를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  // API 배너들만 사용
  const total = bannerData.length;
  // 스켈레톤은 로딩 중이거나 데이터가 없을 때 표시 (기본값: true)
  const showSkeleton = isLoading || bannerData.length === 0;

  return (
    <div
      className="relative w-full hero-section motion-safe:transition-all motion-safe:duration-300"
      style={{
        height: 'var(--heroH, clamp(220px, 48vw, 680px))',
        minHeight: 'var(--heroH, clamp(220px, 48vw, 680px))',
      }}
    >
      {/* KMA-Mobile 스타일: 단순 스켈레톤 (ShimmerSkeleton과 유사) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300"
        style={{
          height: '100%',
          minHeight: 'var(--heroH, clamp(220px, 48vw, 680px))',
          opacity: showSkeleton ? 1 : 0,
          zIndex: showSkeleton ? 20 : 0,
          pointerEvents: showSkeleton ? 'auto' : 'none',
        }}
      >
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>

      {/* 실제 콘텐츠 - 항상 렌더링하되 조건부로 표시 */}
      <div 
        className={`relative w-full h-full transition-opacity duration-300 ${
          showSkeleton ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ 
          height: '100%', 
          minHeight: 'var(--heroH, clamp(220px, 48vw, 680px))' // fallback 추가
        }}
      >
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        speed={350}
        loop
        slidesPerView={1}
        centeredSlides
        spaceBetween={0}
        className="h-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {/* API 배너들 */}
        {bannerData.map((banner, index) => {
          return (
            <SwiperSlide key={`api-banner-${banner.eventId}-${index}`}>
              <ApiBannerSlide
                id={index}
                imageUrl={banner.imageUrl}
                title={banner.title}
                subtitle={banner.subTitle}
                date={banner.date}
                eventId={banner.eventId}
                total={total}
                currentIndex={activeIndex}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

        {/* Custom Navigation Buttons - 데스크톱에서만 표시 */}
        <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors cursor-pointer hidden lg:block">
          <svg
            className="w-12 md:w-16 h-12 md:h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>

        <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors cursor-pointer hidden lg:block">
          <svg
            className="w-12 md:w-16 h-12 md:h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* KMA-Mobile 스타일: 높이 및 텍스트 애니메이션 */}
      <style jsx global>{`
        .hero-section { --heroH: clamp(220px, 48vw, 680px); }
        @media (max-width: 1023px) { .hero-section { --heroH: clamp(200px, 44vw, 560px); } }
        /* 모바일: KMA-Mobile 240.h에 맞춘 고정 높이감 */
        @media (max-width: 639px) { .hero-section { --heroH: 240px; } }
        .swiper-slide .hero-anim {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 800ms ease, transform 900ms ease;
          will-change: opacity, transform;
        }
        .swiper-slide-active .hero-anim {
          opacity: 1;
          transform: translateY(0);
        }
        .swiper-slide-active .hero-badge { transition-delay: 180ms; }
        .swiper-slide-active .hero-title { transition-delay: 360ms; }
        .swiper-slide-active .hero-date { transition-delay: 540ms; }
        .swiper-slide-active .hero-buttons { transition-delay: 720ms; }
      `}</style>
    </div>
  );
}
