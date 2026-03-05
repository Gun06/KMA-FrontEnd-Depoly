'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { MainBannerItem } from '@/types/event';
import ApiBannerSlide from './ApiBannerSlide';
import 'swiper/css';
import 'swiper/css/navigation';

const RESIZE_DEBOUNCE_MS = 180;

export default function MarathonHeroCarousel() {
  const [bannerData, setBannerData] = useState<MainBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

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

  const total = bannerData.length;
  const showSkeleton = isLoading || bannerData.length === 0;

  // 리사이즈 시 Swiper는 디바운스로만 갱신 (실제 사이트처럼 버벅임 방지)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        swiperRef.current?.update();
        timer = null;
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full hero-section">
      <div
        className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300"
        style={{
          opacity: showSkeleton ? 1 : 0,
          zIndex: showSkeleton ? 20 : 0,
          pointerEvents: showSkeleton ? 'auto' : 'none',
        }}
      >
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>

      <div
        className={`relative w-full h-full transition-opacity duration-300 ${showSkeleton ? 'opacity-0' : 'opacity-100'}`}
      >
      <Swiper
        modules={[Navigation, Autoplay]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
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
        updateOnWindowResize={false}
        className="h-full"
        onSlideChange={(swiper) => {
          const idx = typeof swiper.realIndex === 'number' && Number.isFinite(swiper.realIndex)
            ? swiper.realIndex
            : 0;
          setActiveIndex(idx);
        }}
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

      {/* 실제 사이트 방식: aspect-ratio로 높이 결정 (리사이즈 시 한 번에 계산, 버벅임 방지) */}
      <style jsx global>{`
        .hero-section {
          width: 100%;
          aspect-ratio: 21/9;
          min-height: 240px;
          max-height: 560px;
          contain: layout;
        }
        .hero-section > div,
        .hero-section .swiper,
        .hero-section .swiper-wrapper,
        .hero-section .swiper-slide {
          height: 100%;
        }
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
