'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';

interface GalleryCardProps {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  subtitle: string;
  title: string;
  date: string;
  disableAnimation?: boolean;
  onClick?: () => void;
}

export default function GalleryCard({
  imageSrc,
  imageAlt,
  subtitle,
  title,
  date,
  disableAnimation = false,
  onClick,
}: GalleryCardProps) {
  const [isVisible, setIsVisible] = useState(disableAnimation);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disableAnimation) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [disableAnimation]);

  return (
    <div
      ref={cardRef}
      className={`w-[250px] md:w-[350px] h-[320px] md:h-[425px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] overflow-hidden border-2 border-gray-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-full overflow-hidden border-2 border-gray-50 pointer-events-none select-none">
        {typeof imageSrc === 'string' ? (
          imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] border-2 border-gray-50 pointer-events-none select-none"
              draggable={false}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center pointer-events-none select-none">
              <span className="text-gray-400 text-sm">이미지 없음</span>
            </div>
          )
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] border-2 border-gray-50 pointer-events-none select-none"
            sizes="(max-width: 768px) 250px, 350px"
            draggable={false}
          />
        )}
        {/* 어두운 투명 배경 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] border-2 border-gray-50"></div>

        {/* 오른쪽 상단 태그 */}
        {subtitle && (
          <div className="absolute top-0 right-0 w-[120px] md:w-[150px] h-[40px] md:h-[50px] bg-gray-50 rounded-tl-none rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-none border-gray-50 z-20 overflow-hidden pointer-events-none select-none">
            <div
              className="absolute top-0 right-0 w-[110px] md:w-[140px] h-[32px] md:h-[40px] rounded-[12px] md:rounded-[15px] flex items-center justify-center z-30"
              style={{ backgroundColor: '#256EF4' }}
            >
              <span className="text-[10px] md:text-xs font-bold text-white truncate px-2 select-none">
                {subtitle}
              </span>
            </div>
          </div>
        )}

        {/* 타이틀과 날짜 */}
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 pl-3 md:pl-4 pr-8 md:pr-12 text-white pointer-events-none select-none">
          <h3
            className="text-lg md:text-2xl font-semibold mb-1 md:mb-2 font-giants text-left"
            title={title}
            style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-200 text-left select-none">{date}</p>
        </div>

        {/* 오른쪽 하단 화살표 버튼 - 클릭 가능한 유일한 영역 */}
        <div className="absolute bottom-0 right-0 w-[56px] md:w-[70px] h-[56px] md:h-[70px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-none rounded-bl-none rounded-br-[16px] md:rounded-br-[15px] border-gray-50 z-30 overflow-visible pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
            className="absolute bottom-0 right-0 w-[48px] md:w-[60px] h-[48px] md:h-[60px] bg-black rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer group hover:bg-gray-600 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="갤러리 상세 보기"
          >
            <svg
              className="w-5 h-5 md:w-7 md:h-7 text-white pointer-events-none"
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
            <div className="absolute inset-0 bg-black rounded-full opacity-0 group-hover:opacity-15 group-active:opacity-25 transition-opacity duration-300 ease-out blur-sm pointer-events-none"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
