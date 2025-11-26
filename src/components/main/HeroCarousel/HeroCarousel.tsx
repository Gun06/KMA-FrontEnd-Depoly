'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { marathonSlides } from './carouselData';
import { MainBannerItem } from '@/types/event';
import HeroButton from '@/components/common/Button/HeroButton';
// Swiper 스타일
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function MarathonHeroCarousel() {
  const [bannerData, setBannerData] = useState<MainBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 첫 번째 슬라이드는 하드코딩, 나머지는 API 데이터 사용
  const allSlides = [
    marathonSlides[0], // 첫 번째는 하드코딩된 슬라이드
    ...bannerData.map((banner, index) => ({
      id: index + 2, // 2번부터 시작
      image: banner.imageUrl,
      badge: "대회 안내",
      title: banner.title,
      subtitle: banner.subTitle,
      date: banner.date,
      eventId: banner.eventId,
      buttons: [
        { text: "신청하기", variant: "default" as const },
        { text: "대회 요강", variant: "outline" as const },
        { text: "신청 확인", variant: "outline" as const },
      ],
    }))
  ];

  const total = allSlides.length;

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="relative w-full hero-section mt-2 sm:mt-4 md:mt-6 lg:mt-0 motion-safe:transition-all motion-safe:duration-300 flex items-center justify-center" style={{ height: 'var(--heroH)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">배너를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리 - 기본 슬라이드만 사용
  if (error) {
    
  }

  return (
    <div className="relative w-full hero-section mt-2 sm:mt-4 md:mt-6 lg:mt-0 motion-safe:transition-all motion-safe:duration-300" style={{ height: 'var(--heroH)' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        speed={700}
        loop
        slidesPerView={1}
        centeredSlides={true}
        spaceBetween={0}
        breakpoints={{
          320: {
            slidesPerView: 1.25,
            spaceBetween: 10,
            centeredSlides: true,
          },
          640: {
            slidesPerView: 1.2,
            spaceBetween: 10,
            centeredSlides: true,
          },
          768: {
            slidesPerView: 1.2,
            spaceBetween: 10,
            centeredSlides: true,
          },
          1000: {
            slidesPerView: 1.1,
            spaceBetween: 8,
            centeredSlides: true,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: false,
          },
        }}
        className="h-full"
      >
        {allSlides.map((slide, idx) => (
          <SwiperSlide key={slide.id}>
            <a href={slide.eventId ? `/event/${slide.eventId}/guide/overview` : "/event/[eventId]/guide/overview"} className="relative block w-full hero-slide rounded-lg lg:rounded-none overflow-hidden motion-safe:transition-all motion-safe:duration-300" style={{ height: 'var(--heroH)' }}>
              <Image
                src={slide.image || '/placeholder.svg'}
                alt={slide.title}
                fill
                priority={idx === 0}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                placeholder={typeof slide.image === 'object' ? 'blur' : 'empty'}
                quality={70}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 1200px"
                className="object-cover object-center"
              />

              {/* Dark overlay */}
              {slide.id !== 1 ? (
                <div className="absolute inset-0 bg-black/40" />
              ) : (
                // 첫 슬라이드는 텍스트 가독성을 위해 좌->우 그라데이션 스크림
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              )}

              {/* Content overlay */}
              {slide.id === 1 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white w-full max-w-none px-4 sm:px-8 md:px-10 lg:px-24">
                    <div className="w-fit mx-auto flex flex-col items-center text-center">
                      <div className="hero-anim hero-badge self-start text-left font-semibold text-[clamp(8px,1.2vw,16px)] mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2">
                        <span className="gradient-text">RENEWAL</span>
                      </div>
                      <h1 className="hero-anim hero-title font-giants leading-tight font-bold text-[clamp(10px,3.4vw,56px)] whitespace-nowrap tracking-tight mb-4 sm:mb-6 md:mb-10">
                        회원 수 <span className="gradient-text">3만명</span>, 누적 완주 거리 <span className="gradient-text">120만 Km</span> 달성!
                      </h1>
                      <p className="hero-anim hero-date text-white/90 text-[clamp(10px,2vw,20px)] mb-0 sm:mb-0.5 md:mb-1">
                        누적된 발걸음이 하나의 큰 꿈이 되었습니다.
                      </p>
                      <p className="hero-anim hero-buttons text-white/90 text-[clamp(10px,2vw,20px)] mb-0 sm:mb-0.5 md:mb-1">
                        그 길 위에서, 우리는 함께 꿈을 완주합니다.
                      </p>
                      <p className="hero-anim hero-buttons text-white/80 text-[clamp(9px,1.6vw,14px)]">전국마라톤협회</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="text-left text-white max-w-4xl px-4 sm:px-8 md:px-10 min-[900px]:px-12 lg:px-48 flex flex-col">
                    {/* Category badge */}
                    <div className="hero-anim hero-badge inline-block w-fit bg-white/20 rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-medium px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                      {slide.badge}
                    </div>

                    {/* Main title */}
                    <h1 className="hero-anim hero-title font-giants text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-6 leading-tight text-left">
                      <div className="whitespace-nowrap">{slide.title}</div>
                      <div className="whitespace-nowrap">{slide.subtitle}</div>
                    </h1>

                    {/* Date */}
                    <p className="hero-anim hero-date text-xs sm:text-sm md:text-base lg:text-xl text-white/90 mb-2 sm:mb-3 md:mb-5 lg:mb-6">
                      {slide.date}
                    </p>

                    {/* Action buttons: 모바일에서 숨김, 태블릿 이상 노출 */}
                    <div className="hero-anim hero-buttons hidden sm:flex sm:flex-row gap-2 md:gap-3 mt-2">
                      {/* 신청하기: sm+md 동일, lg는 그대로 */}
                      <HeroButton
                        variant="main"
                        tone="blue"
                        size="xs"
                        className="hidden sm:inline-flex md:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/apply` : '/event/[eventId]/registration/apply'; }}
                      >
                        신청하기
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="blue"
                        size="sm"
                        className="hidden md:inline-flex lg:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/apply` : '/event/[eventId]/registration/apply'; }}
                      >
                        신청하기
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="blue"
                        size="md"
                        className="hidden lg:inline-flex"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/apply` : '/event/[eventId]/registration/apply'; }}
                      >
                        신청하기
                      </HeroButton>

                      {/* 대회 요강: sm+md 동일 */}
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="xs"
                        className="hidden sm:inline-flex md:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/guide/overview` : '/event/[eventId]/guide/overview'; }}
                      >
                        대회 요강
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="sm"
                        className="hidden md:inline-flex lg:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/guide/overview` : '/event/[eventId]/guide/overview'; }}
                      >
                        대회 요강
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="md"
                        className="hidden lg:inline-flex"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/guide/overview` : '/event/[eventId]/guide/overview'; }}
                      >
                        대회 요강
                      </HeroButton>

                      {/* 신청 확인: sm+md 동일 */}
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="xs"
                        className="hidden sm:inline-flex md:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/confirm` : '/event/[eventId]/registration/confirm'; }}
                      >
                        신청 확인
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="sm"
                        className="hidden md:inline-flex lg:hidden"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/confirm` : '/event/[eventId]/registration/confirm'; }}
                      >
                        신청 확인
                      </HeroButton>
                      <HeroButton
                        variant="main"
                        tone="white"
                        size="md"
                        className="hidden lg:inline-flex"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = slide.eventId ? `/event/${slide.eventId}/registration/confirm` : '/event/[eventId]/registration/confirm'; }}
                      >
                        신청 확인
                      </HeroButton>
                    </div>
                  </div>
                </div>
              )}
              {/* per-slide fraction at right-bottom inside slide */}
              <div className="absolute right-4 bottom-3 z-10">
                <div className="px-2.5 py-1 rounded-full bg-black/50 text-white text-xs md:text-sm backdrop-blur-sm border border-white/20">
                  {idx + 1}/{total}
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}

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
      </Swiper>


      {/* Custom Pagination Styles & Text Animations */}
      <style jsx global>{`
        /* Fluid responsive height like Programmers */
        .hero-section { --heroH: clamp(220px, 48vw, 680px); }
        @media (max-width: 1023px) { .hero-section { --heroH: clamp(200px, 44vw, 560px); } }
        /* Mobile: revert to preferred height ~28vh */
        @media (max-width: 639px)  { .hero-section { --heroH: 28vh; } }
        /* Text entrance animation per slide */
        .swiper-slide .hero-anim {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 800ms ease, transform 900ms ease;
          will-change: opacity, transform;
        }
        .gradient-text {
          background: linear-gradient(90deg, #00C4F4 0%, #00D886 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .swiper-slide-active .hero-anim {
          opacity: 1;
          transform: translateY(0);
        }
        /* Stagger */
        .swiper-slide-active .hero-badge { transition-delay: 180ms; }
        .swiper-slide-active .hero-title { transition-delay: 360ms; }
        .swiper-slide-active .hero-date { transition-delay: 540ms; }
        .swiper-slide-active .hero-buttons { transition-delay: 720ms; }

        /* Pagination 기본 스타일 */
        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          margin: 0 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: #256ef4;
          transform: scale(1.2);
        }
        
        .swiper-pagination {
          bottom: 20px !important;
        }

        /* 데스크탑 스타일 (768px 이상) */
        @media (min-width: 768px) {
          .swiper-pagination-bullet-custom {
            width: 12px;
            height: 12px;
            margin: 0 4px;
          }
          
          .swiper-pagination {
            bottom: 30px !important;
          }
        }

        /* 모바일 전용 스타일 (≤639px) - 옆 슬라이드 더 드러나게 */
        @media (max-width: 639px) {
          .swiper-slide {
            transition: transform 0.3s ease;
          }
          
          .swiper-slide:not(.swiper-slide-active) {
            transform: scale(0.9);
            opacity: 0.6;
          }
          
          .swiper-slide-active {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* 태블릿 전용 스타일 (640px–1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .swiper-slide {
            transition: transform 0.3s ease;
          }
          .swiper-slide:not(.swiper-slide-active) {
            transform: scale(0.94);
            opacity: 0.75;
          }
          .swiper-slide-active {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
