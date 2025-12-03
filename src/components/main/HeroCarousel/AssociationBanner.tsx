'use client';

import Image from 'next/image';
import mainAssociationBanner from '@/assets/images/main/mainbanner02.png';

interface AssociationBannerProps {
  total: number;
  currentIndex: number;
}

export default function AssociationBanner({ total, currentIndex }: AssociationBannerProps) {
  return (
    <a
      href="#"
      className="relative block w-full hero-slide rounded-lg lg:rounded-none overflow-hidden motion-safe:transition-all motion-safe:duration-300"
      style={{ height: 'var(--heroH, clamp(220px, 48vw, 680px))' }}
    >
      <Image
        src={mainAssociationBanner}
        alt="전국마라톤협회"
        fill
        priority
        fetchPriority="high"
        placeholder="blur"
        quality={70}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 1200px"
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-black/30" />

      {/* Content overlay - 중앙 정렬 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white px-4 sm:px-8 md:px-10 lg:mx-32 xl:mx-40 2xl:mx-48 flex flex-col relative">
          <div className="relative z-10 w-auto">
            {/* RENEWAL 배지 - 왼쪽 정렬 */}
            <div className="hero-anim hero-badge w-full mb-2 sm:mb-3 md:mb-4 lg:mb-6">
              <div className="inline-block w-fit bg-white/30 backdrop-blur-sm rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-medium px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 border border-white/20 hero-text-shadow">
                RENEWAL
              </div>
            </div>

            {/* Main title & description - 모두 가운데 정렬 */}
            <h1 className="hero-anim hero-title font-giants text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight text-center hero-text-shadow">
              <div className="whitespace-nowrap inline-block">
                <span>회원 수 </span>
                <span className="gradient-text">3만명</span>
                <span>, 누적 완주 거리 </span>
                <span className="gradient-text">120만 Km</span>
                <span> 달성!</span>
              </div>
            </h1>
            <p className="hero-anim hero-date font-giants text-sm sm:text-base md:text-lg lg:text-xl text-white/95 leading-relaxed mb-1 sm:mb-2 md:mb-2 lg:mb-2 text-center hero-text-shadow">
              누적된 발걸음이 하나의 큰 꿈이 되었습니다.
            </p>
            <p className="hero-anim hero-date font-giants text-sm sm:text-base md:text-lg lg:text-xl text-white/95 leading-relaxed mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center hero-text-shadow">
              그 길 위에서, 우리는 함께 꿈을 완주합니다.
            </p>
            <p className="hero-anim hero-date font-giants text-[10px] sm:text-xs md:text-sm lg:text-base text-white/90 text-center hero-text-shadow">
              전국마라톤협회
            </p>
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

