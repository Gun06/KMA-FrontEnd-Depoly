import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';
import clsx from 'clsx';
interface EventCardProps {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  title: string;
  subtitle: string;
  date: string;
  price: string;
  status: string;
  eventDate: string; // YYYY-MM-DD 형식
  eventStartDate?: string; // 대회 시작일 (YYYY-MM-DD 형식) - 접수 마감 판단 기준
  eventDeadLine?: string; // 접수 마감일 (YYYY-MM-DD 형식) - 하위 호환성 유지
  eventId?: string; // API에서 받은 이벤트 ID
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'test'; // 추가: 사이즈 설정용
}

export default function EventCard({
  imageSrc,
  imageAlt,
  title,
  date,
  price,
  status,
  eventDate,
  eventStartDate,
  eventDeadLine,
  eventId,
  className,
  size = 'large'
}: EventCardProps) {
  // D-day 계산 (eventStartDate 기준으로 접수 마감 판단)
  const calculateDday = (startDateStr: string | undefined, fallbackDateStr: string) => {
    const today = new Date();
    // eventStartDate가 있으면 eventStartDate 기준, 없으면 fallback (eventDate) 기준
    const targetDate = startDateStr ? new Date(startDateStr) : new Date(fallbackDateStr);
    
    // 시간을 제거하고 날짜만 비교
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { dDay: `D-${diffDays}`, status: '접수중' };
    } else if (diffDays === 0) {
      return { dDay: 'D-Day', status: '접수중' };
    } else {
      return { dDay: `D+${Math.abs(diffDays)}`, status: '접수마감' };
    }
  };

  // eventStartDate를 기준으로 D-day 계산 (표시용)
  const { dDay, status: dynamicStatus } = calculateDday(eventStartDate, eventDate);
  
  // 서버에서 받은 status를 우선 사용 (관리자가 설정한 마감 상태 유지)
  // 서버 상태가 '접수마감', '완료', '취소' 중 하나면 서버 상태 우선
  // 그 외의 경우(접수중, 없음 등)에만 날짜 기반 계산 사용
  const displayStatus = (status === '접수마감' || status === '완료' || status === '취소')
    ? status  // 서버에서 마감/완료/취소로 설정된 경우 서버 상태 우선
    : (status || dynamicStatus); // 서버 상태가 없거나 '접수중'인 경우 날짜 기반 계산 사용

  // size에 따른 크기 클래스 설정
  const sizeClasses = {
    small: "w-[100px] h-[130px] md:w-[110px] md:h-[140px] lg:w-[160px] lg:h-[190px]",
    medium: "w-[140px] h-[180px] md:w-[150px] md:h-[220px] lg:w-[240px] lg:h-[320px]",
    large: "w-[160px] md:w-[280px] lg:w-[300px] h-[200px] md:h-[350px] lg:h-[370px]",
    test: "w-full h-auto"
  };

  // size에 따른 이미지 높이 클래스 설정
  const imageHeightClasses = {
    small: "h-24 md:h-28 lg:h-32",
    medium: "h-32 md:h-36 lg:h-40",
    large: "h-24 md:h-44 lg:h-48",
    test: "h-32 md:h-36 lg:h-40"
  };

  // size에 따른 정보 영역 높이 클래스 설정
  const infoHeightClasses = { 
    small: "h-[82px] md:h-[86px] lg:h-[92px]",
    medium: "h-[114px] md:h-[118px] lg:h-[124px]",
    large: "h-[128px] md:h-[180px] lg:h-[200px]",
    test: "h-auto"
  };

  const cardContent = (
    <div className={clsx(
      sizeClasses[size],
      "select-none bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 ease-in-out cursor-pointer transform hover:-translate-y-2 md:hover:-translate-y-3 lg:hover:-translate-y-5 hover:shadow-2xl",
      className
    )} style={{ filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.05))' }}>
      {/* 이미지 영역 */}
      <div className={clsx("relative w-full overflow-hidden", imageHeightClasses[size])}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover select-none pointer-events-none"
          priority={false}
          style={{ position: 'absolute' }}
        />
        {/* 접수 상태 배지 */}
        <div className="absolute top-1.5 md:top-3 left-1.5 md:left-3 bg-white/40 text-blue-600 text-xs md:text-sm px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-full z-10 backdrop-blur-sm">
          {displayStatus}
        </div>
      </div>
      
      {/* 정보 영역 */}
      <div className={clsx("p-2 md:p-4 flex flex-col", infoHeightClasses[size])}>
        <div className="space-y-1 md:space-y-2">
          {/* 이벤트 제목 */}
          <h4 
            className="font-medium text-gray-800 text-xs md:text-base lg:text-lg leading-tight truncate"
            title={title}
          >
            {title}
          </h4>
          {/* 가격 - 크고 굵게 */}
          <p className="text-sm md:text-xl font-black text-gray-900 font-pretendard-extrabold">
            {price}
          </p>
          
          {/* 날짜/시간 */}
          <p 
            className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-1"
            title={date}
          >
            {date}
          </p>
        </div>
        
        {/* 하단 상태 정보 - 파란색 배지 (왼쪽 정렬) */}
        <div className="flex items-center justify-start mt-2 md:mt-5 lg:mt-6">
          <div className="bg-[#ECF2FE] text-blue-600 px-1.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 lg:gap-3">
            <span className="whitespace-nowrap">{displayStatus}</span>
            <div className="w-px h-2.5 md:h-4 bg-blue-600 opacity-60"></div>
            <span className="whitespace-nowrap">{dDay}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // eventId가 있으면 Link로 감싸고, 없으면 그대로 반환
  if (eventId) {
    return (
      <Link href={`/event/${eventId}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
