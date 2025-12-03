'use client';

import Image from 'next/image';
import HeroButton from '@/components/common/Button/HeroButton';

interface ApiBannerSlideProps {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  date: string;
  eventId: string;
  total: number;
  currentIndex: number;
}

export default function ApiBannerSlide({
  imageUrl,
  title,
  subtitle,
  date,
  eventId,
  total,
  currentIndex,
}: ApiBannerSlideProps) {
  return (
    <a
      href={`/event/${eventId}/guide/overview`}
      className="relative block w-full hero-slide rounded-lg lg:rounded-none overflow-hidden motion-safe:transition-all motion-safe:duration-300"
      style={{ height: 'var(--heroH, clamp(220px, 48vw, 680px))' }}
    >
      <Image
        src={imageUrl || '/placeholder.svg'}
        alt={title}
        fill
        fetchPriority="auto"
        placeholder="empty"
        quality={70}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 1200px"
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-black/30" />

      {/* Content overlay - 왼쪽 정렬 */}
      <div className="absolute inset-0 flex items-center justify-start">
        <div className="text-left text-white max-w-4xl px-4 sm:px-8 md:px-10 min-[900px]:px-12 lg:px-28 xl:px-36 2xl:px-44 flex flex-col relative">
          <div className="relative z-10 w-full">
            {/* Category badge */}
            <div className="hero-anim hero-badge inline-block w-fit bg-white/30 backdrop-blur-sm rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-medium px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 mb-2 sm:mb-3 md:mb-4 lg:mb-6 border border-white/20 hero-text-shadow">
              대회 안내
            </div>

            {/* Main title & description */}
            <h1 className="hero-anim hero-title font-giants text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-6 leading-tight text-left hero-text-shadow">
              <div className="whitespace-nowrap">{title}</div>
              <div className="whitespace-nowrap">{subtitle}</div>
            </h1>
            {/* Date */}
            <p className="hero-anim hero-date text-xs sm:text-sm md:text-base lg:text-xl text-white/95 mb-2 sm:mb-3 md:mb-5 lg:mb-6 hero-text-shadow">
              {date}
            </p>

            {/* Action buttons: 모바일에서 숨김, 태블릿 이상 노출 */}
            <div className="hero-anim hero-buttons hidden sm:flex sm:flex-row gap-2 md:gap-3 mt-2">
              {/* 신청하기: sm+md 동일, lg는 그대로 */}
              <HeroButton
                variant="main"
                tone="blue"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>
              <HeroButton
                variant="main"
                tone="blue"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>
              <HeroButton
                variant="main"
                tone="blue"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/apply`;
                }}
              >
                신청하기
              </HeroButton>

              {/* 대회 요강: sm+md 동일 */}
              <HeroButton
                variant="main"
                tone="white"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/guide/overview`;
                }}
              >
                대회 요강
              </HeroButton>

              {/* 신청 확인: sm+md 동일 */}
              <HeroButton
                variant="main"
                tone="white"
                size="xs"
                className="hidden sm:inline-flex md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="sm"
                className="hidden md:inline-flex lg:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
              <HeroButton
                variant="main"
                tone="white"
                size="md"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event/${eventId}/registration/confirm`;
                }}
              >
                신청 확인
              </HeroButton>
            </div>
          </div>
        </div>
      </div>

      {/* per-slide fraction at right-bottom inside slide */}
      <div className="absolute right-4 bottom-3 z-10">
        <div className="px-2.5 py-1 rounded-full bg-black/50 text-white text-xs md:text-sm backdrop-blur-sm border border-white/20">
          {currentIndex + 1}/{total}
        </div>
      </div>
    </a>
  );
}

