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
  /** 기존 가격 표시는 유지하되, 우선순위는 categoryNames (코스/거리) */
  price?: string;
  categoryNames?: string;
  status: string;
  eventDate: string; // YYYY-MM-DD 형식
  eventStartDate?: string; // 대회 시작일 (YYYY-MM-DD 형식) - 접수 마감 판단 기준
  eventDeadLine?: string; // 접수 마감일 (YYYY-MM-DD 형식) - 하위 호환성 유지
  eventId?: string; // API에서 받은 이벤트 ID
  eventUrl?: string; // 로컬대회의 경우 외부 URL (eventUrl이 있으면 이걸 우선 사용)
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'test'; // 추가: 사이즈 설정용
  isDragging?: boolean; // 드래그 중인지 여부
  dragDistance?: number; // 드래그 거리 (픽셀)
}

export default function EventCard({
  imageSrc,
  imageAlt,
  title,
  date,
  price,
  categoryNames,
  status,
  eventDate,
  eventStartDate,
  eventDeadLine: _eventDeadLine,
  eventId,
  eventUrl,
  className,
  size = 'large',
  isDragging: _isDragging = false,
  dragDistance: _dragDistance = 0
}: EventCardProps) {
  const formatCategoryNames = (value: string) => {
    const parts = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (parts.length === 0) return '';
    if (parts.length <= 3) {
      return parts.join(' · ');
    }

    const firstThree = parts.slice(0, 3).join(' · ');
    // 마지막 가운데 점 없이 " ... "만 붙이기
    return `${firstThree} ...`;
  };

  const primaryInfoText =
    categoryNames && categoryNames.trim().length > 0
      ? formatCategoryNames(categoryNames)
      : (price ?? '코스 정보 없음');

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

  // API status를 한글로 변환하는 함수
  const translateStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': '접수예정',
      'OPEN': '접수중',
      'FINAL_CLOSED': '접수마감',
      'CLOSED': '접수마감'
    };
    return statusMap[apiStatus] || apiStatus;
  };

  // eventStartDate를 기준으로 D-day 계산 (표시용)
  const { dDay, status: dynamicStatus } = calculateDday(eventStartDate, eventDate);
  
  // 서버에서 받은 status를 한글로 변환하여 사용 (서버 상태 우선)
  // API status가 있으면 항상 그것을 사용하고, 없거나 빈 문자열이면 날짜 기반 계산 사용
  const translatedStatus = status ? translateStatus(status) : '';
  const displayStatus = translatedStatus || dynamicStatus;

  // size에 따른 크기 클래스 설정
  const sizeClasses = {
    small: "w-[100px] h-[130px] md:w-[110px] md:h-[140px] lg:w-[160px] lg:h-[190px]",
    medium: "w-[140px] h-[180px] md:w-[150px] md:h-[220px] lg:w-[240px] lg:h-[320px]",
    large: "w-[160px] md:w-[280px] lg:w-[300px] h-[200px] md:h-[350px] lg:h-[370px]",
    // test: grid 레이아웃용 - 메인 페이지와 동일한 비율 유지
    // 메인 페이지 large: w-[160px] h-[200px] = 0.8 비율
    // grid에서 w-full이므로 높이만 비율에 맞춰 조정
    test: "w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[370px]"
  };

  // size에 따른 이미지 높이 클래스 설정
  const imageHeightClasses = {
    small: "h-24 md:h-28 lg:h-32",
    medium: "h-32 md:h-36 lg:h-40",
    large: "h-24 md:h-44 lg:h-48",
    // test: grid 레이아웃용 - 메인 페이지 large와 동일한 비율
    // large: h-24(96px)/200px = 48%, h-44(176px)/350px = 50.3%, h-48(192px)/370px = 51.9%
    // grid에서는 약 50% 비율로 유지
    test: "h-24 sm:h-36 md:h-44 lg:h-48"
  };

  // size에 따른 정보 영역 높이 클래스 설정
  const infoHeightClasses = { 
    small: "h-[82px] md:h-[86px] lg:h-[92px]",
    medium: "h-[114px] md:h-[118px] lg:h-[124px]",
    large: "h-[128px] md:h-[180px] lg:h-[200px]",
    // test: grid 레이아웃용 - 메인 페이지 large와 동일한 비율 유지
    // 전체 높이에서 이미지 높이와 padding을 뺀 값
    // 모바일: 200px - 96px(이미지) - 16px(padding) = 88px → 128px 유지 (메인과 동일)
    // sm: 280px - 144px(이미지) - 16px = 120px → 약 140px
    // md: 350px - 176px(이미지) - 32px = 142px → 180px 유지 (메인과 동일)
    // lg: 370px - 192px(이미지) - 32px = 146px → 200px 유지 (메인과 동일)
    test: "h-[128px] sm:h-[140px] md:h-[180px] lg:h-[200px]"
  };

  // 접수 상태에 따른 색상 클래스 설정
  const getStatusColors = () => {
    if (displayStatus === '접수마감' || displayStatus === '완료' || displayStatus === '취소') {
      return {
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        dividerColor: 'bg-red-600'
      };
    } else if (displayStatus === '접수예정') {
      return {
        textColor: 'text-gray-900',
        bgColor: 'bg-gray-100',
        dividerColor: 'bg-gray-900'
      };
    } else {
      // 접수중 (기본값)
      return {
        textColor: 'text-blue-600',
        bgColor: 'bg-[#ECF2FE]',
        dividerColor: 'bg-blue-600'
      };
    }
  };

  const statusColors = getStatusColors();

  const cardContent = (
    <div className={clsx(
      sizeClasses[size],
      "select-none bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-2 md:hover:-translate-y-3 lg:hover:-translate-y-5 hover:shadow-2xl",
      className
    )} style={{ filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.05))' }}>
      {/* 이미지 영역 */}
      <div className={clsx("relative w-full overflow-hidden", imageHeightClasses[size])}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover select-none pointer-events-none"
            priority={false}
            style={{ position: 'absolute' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">이미지 없음</span>
          </div>
        )}
        {/* 접수 상태 배지 */}
        <div className={clsx(
          "absolute top-1.5 md:top-3 left-1.5 md:left-3 bg-white/80 text-xs md:text-sm px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-full z-10 backdrop-blur-sm",
          statusColors.textColor
        )}>
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
          {/* 코스/거리(또는 가격) - 이전 가격 스타일과 비슷하게 굵고 크게 유지 */}
          <p className="text-sm md:text-xl font-black text-gray-900 font-pretendard-extrabold line-clamp-1" title={primaryInfoText}>
            {primaryInfoText}
          </p>
          
          {/* 날짜/시간 */}
          <p 
            className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-1"
            title={date}
          >
            {date}
          </p>
        </div>
        
        {/* 하단 상태 정보 및 가기 버튼 */}
        <div className={clsx(
          "flex items-center justify-between mt-2 md:mt-5 lg:mt-6 transition-all duration-300",
          size === 'test' 
            ? "gap-1 sm:gap-1.5 md:gap-2 lg:gap-3" 
            : "gap-2 md:gap-3"
        )}>
          <div className={clsx(
            "rounded-md md:rounded-lg font-medium flex items-center flex-shrink-0 transition-all duration-300",
            // size="test"일 때 더 작은 padding과 텍스트 - 더 부드러운 변화를 위해 breakpoint 간소화
            size === 'test'
              ? "px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2 text-[10px] sm:text-xs md:text-sm gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2"
              : "px-1.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm gap-1 md:gap-2 lg:gap-3",
            statusColors.bgColor,
            statusColors.textColor
          )}>
            <span className="whitespace-nowrap">{displayStatus}</span>
            {(displayStatus === '접수중' || displayStatus === '접수예정') && !dDay.startsWith('D+') && (
              <>
                <div className={clsx(
                  "opacity-60 transition-all duration-300",
                  size === 'test'
                    ? "w-px h-2 sm:h-2.5 md:h-3 lg:h-4"
                    : "w-px h-2.5 md:h-4",
                  statusColors.dividerColor
                )}></div>
                <span className="whitespace-nowrap">{dDay}</span>
              </>
            )}
          </div>
          {(eventId || eventUrl) && (
            <Link
              href={eventUrl || `/event/${eventId}`}
              onClick={(e) => {
                // 버튼 클릭 시 드래그 이벤트 전파 방지
                e.stopPropagation();
                // eventUrl이 있으면 (로컬 대회) 해당 URL로 이동
                if (eventUrl) {
                  e.preventDefault();
                  // 외부 URL인 경우 새 탭에서 열기
                  if (!eventUrl.startsWith('/')) {
                    window.open(eventUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    // 내부 URL인 경우 같은 탭에서 이동
                    window.location.href = eventUrl;
                  }
                }
              }}
              className={clsx(
                "bg-blue-600 hover:bg-blue-700 text-white rounded-md md:rounded-lg font-medium transition-all duration-300 flex items-center flex-shrink-0",
                // size="test"일 때 더 작은 padding과 텍스트 - 더 부드러운 변화를 위해 breakpoint 간소화
                size === 'test'
                  ? "px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2 text-[10px] sm:text-xs md:text-sm"
                  : "px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-xs md:text-sm gap-1 md:gap-1.5"
              )}
              title="바로가기"
              {...(eventUrl && !eventUrl.startsWith('/') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="whitespace-nowrap">바로가기</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  // 카드를 Link로 감싸지 않고 그대로 반환 (가기 버튼으로만 이동)
  return <li className="shrink-0 list-none">{cardContent}</li>;
}
