'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { UploadItem } from '@/components/common/Upload/types';
import ApiBannerSlide from '@/components/main/HeroCarousel/ApiBannerSlide';

import 'swiper/css';

export type MainBannerRow = {
  id: string | number; // UUID 또는 숫자 ID
  uuid?: string; // 원본 UUID 저장용
  visible: boolean;
  image: UploadItem | null;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  /** URL 입력 대신 eventId만 사용 */
  bannerType?: 'association' | 'event';
  eventId?: string;
};

function srcFromFile(f: UploadItem | null): string {
  if (!f) return '';
  const fileWithUrl = f as UploadItem & { previewUrl?: string; url?: string };
  if (typeof fileWithUrl?.previewUrl === 'string' && fileWithUrl.previewUrl) return fileWithUrl.previewUrl; // data:
  if (typeof fileWithUrl?.url === 'string' && /^https?:\/\//i.test(fileWithUrl.url)) return fileWithUrl.url; // 절대경로
  return '';
}

export default function MainBannersPreview({ rows }: { rows: MainBannerRow[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = React.useMemo(
    () =>
      rows
        .filter(r => r.image) // image가 있는 것만 (eventId는 선택사항)
        .map(r => ({
          id: r.id,
          imageUrl: srcFromFile(r.image) || '',
          title: r.title || '',
          subtitle: r.subtitle || '',
          date: r.date || '',
          eventId: r.eventId || '',
        })),
    [rows]
  );
  const total = slides.length || 1;

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] rounded-lg border border-dashed text-gray-500">
        노출할 배너가 없습니다. 이미지를 등록해 주세요.
      </div>
    );
  }

  return (
    <div className="relative mt-2 w-full hero-section sm:mt-4 md:mt-6 lg:mt-0">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        speed={350}
        loop={total > 1}
        slidesPerView={1}
        centeredSlides={false}
        spaceBetween={0}
        updateOnWindowResize
        observer
        observeParents
        className="h-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`preview-banner-${slide.id}-${index}`}>
            <ApiBannerSlide
              id={index}
              imageUrl={slide.imageUrl}
              title={slide.title}
              subtitle={slide.subtitle}
              date={slide.date}
              eventId={slide.eventId}
              total={total}
              currentIndex={activeIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 실제 메인 히어로와 동일한 비율·애니메이션 규칙 */}
      <style jsx global>{`
        .hero-section {
          width: 100%;
          max-height: 880px;
          contain: layout;
        }
        @media (max-width: 639px) {
          .hero-section {
            aspect-ratio: 9 / 8;
            min-height: min(48vw, 254px);
            max-height: min(59vh, 374px);
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-section {
            aspect-ratio: 16 / 10;
            min-height: 320px;
          }
        }
        @media (min-width: 1024px) {
          .hero-section {
            aspect-ratio: 16 / 10;
            min-height: 400px;
          }
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
        /* Stagger */
        .swiper-slide-active .hero-badge { transition-delay: 180ms; }
        .swiper-slide-active .hero-title { transition-delay: 360ms; }
        .swiper-slide-active .hero-date { transition-delay: 540ms; }
        .swiper-slide-active .hero-readmore { transition-delay: 630ms; }
        .swiper-slide-active .hero-buttons { transition-delay: 720ms; }
      `}</style>
    </div>
  );
}

