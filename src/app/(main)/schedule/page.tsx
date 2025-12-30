'use client';

import { useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useQueries } from '@tanstack/react-query';
import MarathonCalendar from '@/components/common/MarathonCalendar';
import Button from '@/components/common/Button/Button';
import EventCard from '@/components/main/EventSection/EventCard';
import MainHeader from '@/components/main/Header';
import Image from 'next/image';
import Link from 'next/link';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';
import { flattenScheduleEvents, flattenCalendarEvents, filterScheduleEventsByType } from '@/hooks/useSchedule';
import { fetchScheduleEvents, fetchCalendarEvents } from '@/services/schedule';
import { ScheduleEvent, CalendarEvent } from '@/types/event';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'all' | 'marathon' | 'national'>('all');
  const monthRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const monthScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // 각 월별로 API 호출하여 전체 연도 데이터 수집
  const year = currentDate.getFullYear();
  
  const scheduleQueries = useQueries({
    queries: Array.from({ length: 12 }, (_, i) => ({
      queryKey: ['schedule', year, i + 1],
      queryFn: () => fetchScheduleEvents(year, i + 1),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    })),
  });
  
  const calendarQueries = useQueries({
    queries: Array.from({ length: 12 }, (_, i) => ({
      queryKey: ['calendar', year, i + 1],
      queryFn: () => fetchCalendarEvents(year, i + 1),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    })),
  });
  
  // 모든 쿼리의 로딩 상태와 에러 상태 확인
  const isLoading = scheduleQueries.some(query => query.isLoading);
  const calendarLoading = calendarQueries.some(query => query.isLoading);
  const error = scheduleQueries.find(query => query.error)?.error;
  const calendarError = calendarQueries.find(query => query.error)?.error;
  
  // 모든 월의 데이터를 합치기
  const allScheduleData = useMemo(() => {
    return scheduleQueries
      .map(query => query.data)
      .filter(Boolean)
      .reduce((acc, data) => {
        if (data) {
          const flattened = flattenScheduleEvents(data);
          return [...acc, ...flattened];
        }
        return acc;
      }, [] as ScheduleEvent[]);
  }, [scheduleQueries]);
  
  const allCalendarData = useMemo(() => {
    return calendarQueries
      .map(query => query.data)
      .filter(Boolean)
      .reduce((acc, data) => {
        if (data) {
          const flattened = flattenCalendarEvents(data);
          return [...acc, ...flattened];
        }
        return acc;
      }, [] as CalendarEvent[]);
  }, [calendarQueries]);
  
  // API 데이터를 평면화
  const allEvents = allScheduleData;
  const allCalendarEvents = allCalendarData;
  
  // 달력용 이벤트 데이터 변환 (API 데이터를 MarathonCalendar 형식으로)
  const marathonEvents = allCalendarEvents.map(event => {
    // API 날짜 형식: '10.01(수)' -> '2025-10-01' 형식으로 변환
    const dateStr = event.date; // '10.01(수)'
    const monthDay = dateStr.split('(')[0]; // '10.01'
    const [month, day] = monthDay.split('.'); // ['10', '01']
    const currentYear = currentDate.getFullYear();
    const formattedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    return {
      id: `${formattedDate}-${event.eventName}`,
      title: event.eventName,
      date: formattedDate,
      location: event.region || '장소 미정',
      time: '07:00',
      category: 'other' as const,
      status: 'upcoming' as const,
      type: 'marathon' as const,
      imageSrc: '/assets/images/event/default-event.png' as any
    };
  });
  
  // 전마협 대회만 필터링
  const kmaEvents = filterScheduleEventsByType(allEvents, 'KMA');
  
  // 전국 대회만 필터링  
  const localEvents = filterScheduleEventsByType(allEvents, 'LOCAL');

  // 이벤트를 월별로 그룹화하는 함수
  const groupEventsByMonth = (events: ScheduleEvent[]) => {
    const grouped: { [key: number]: ScheduleEvent[] } = {};
    events.forEach(event => {
      const eventDate = new Date(event.eventDate);
      const month = eventDate.getMonth();
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(event);
    });
    // 각 월별로 날짜순 정렬
    Object.keys(grouped).forEach(month => {
      grouped[parseInt(month)].sort((a, b) => 
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
    });
    return grouped;
  };

  // 전체일정: 전마협 + 전국대회 합치기
  const allCombinedEvents = [...kmaEvents, ...localEvents];
  const allEventsByMonth = useMemo(() => groupEventsByMonth(allCombinedEvents), [allCombinedEvents]);
  const kmaEventsByMonth = useMemo(() => groupEventsByMonth(kmaEvents), [kmaEvents]);
  const localEventsByMonth = useMemo(() => groupEventsByMonth(localEvents), [localEvents]);

  // 현재 탭에 따른 월별 그룹 데이터 선택
  const getEventsByMonth = () => {
    if (viewMode === 'all') return allEventsByMonth;
    if (viewMode === 'marathon') return kmaEventsByMonth;
    if (viewMode === 'national') return localEventsByMonth;
    return {};
  };

  const eventsByMonth = getEventsByMonth();

  // 월 버튼 클릭 시 해당 월 섹션으로 스크롤
  const scrollToMonth = (monthIndex: number) => {
    const element = monthRefs.current[monthIndex];
    if (element) {
      const headerOffset = 200; // 헤더 높이 고려
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    // 월 버튼 클릭 시 해당 월으로 스크롤
    scrollToMonth(newDate.getMonth());
  };

  // 월간 네비게이션 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!monthScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - monthScrollRef.current.offsetLeft);
    setScrollLeft(monthScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !monthScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - monthScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    monthScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleViewModeChange = (mode: 'calendar' | 'all' | 'marathon' | 'national') => {
    setViewMode(mode);
  };

  // 월 이름 배열
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="min-h-[50vh] sm:min-h-screen flex flex-col">
      {/* 헤더 */}
      <MainHeader />
      
      {/* 헤더 아래 여유 공간 */}
      <div className="pt-0 sm:pt-0 md:pt-0"></div>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 */}
        <div className="relative w-full">
          <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
          <div className="hidden lg:block" style={{ height: '150px' }}></div>
          <Image
            src={menubanner}
            alt="메뉴 배너"
            fill
            className="object-cover object-right"
            priority
          />
          
          {/* 배너 위에 페이지 제목과 브레드크럼 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-8 md:px-16 lg:px-32 xl:px-48">
            {/* 페이지 제목 */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black mb-1 sm:mb-2 font-giants-bold">
              대회일정
            </h1>
            
            {/* 브레드크럼 네비게이션 */}
            <nav className="text-xs sm:text-sm md:text-sm text-black">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link 
                  href="/"
                  className="hover:text-gray-700 transition-colors duration-200 flex items-center gap-1 px-1 sm:px-0 text-black font-normal underline"
                >
                  <Image src={homeIcon} alt="홈" className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">홈</span>
                </Link>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
                <span className="text-black font-normal whitespace-nowrap underline">
                  대회일정
                </span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-black" />
                <span className="text-black font-bold whitespace-nowrap underline">
                  대회일정
                </span>
              </div>
            </nav>
          </div>
        </div>
        
        {/* 페이지 콘텐츠 - 데스크탑에서는 최대 너비 제한 */}
        <div className="w-full px-4 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col mx-auto max-w-7xl">

        {/* 날짜 선택 컨트롤 - 데스크탑/태블릿 */}
        <div className="hidden sm:block mb-6 p-4 border-t border-b border-black sticky top-16 bg-white z-10">
          <div className="flex flex-row gap-4 items-center justify-between">
          {/* 연도 선택 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="이전 연도"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <span className="px-2 py-1 font-semibold text-lg min-w-[70px] text-center">
                {currentDate.getFullYear()}년
              </span>
              
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="다음 연도"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* 월 선택 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                ref={monthScrollRef}
                className={clsx(
                  "overflow-x-auto no-scrollbar w-full cursor-grab",
                  isDragging && "cursor-grabbing"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex gap-0.5 flex-nowrap min-w-max">
              {monthNames.map((month, index) => {
                const hasEvents = eventsByMonth[index] && eventsByMonth[index].length > 0;
                return (
                  <Button
                    key={index}
                    onClick={() => handleDateChange(new Date(currentDate.getFullYear(), index, 1))}
                    size="lg"
                    tone="white"
                    widthType="default"
                    className={clsx('!font-semibold !text-lg flex-shrink-0 whitespace-nowrap',
                      currentDate.getMonth() === index
                        ? '!bg-blue-600 text-white'
                        : hasEvents
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-white text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    {month}
                  </Button>
                );
              })}
            </div>
          </div>
            </div>
            
             {/* 탭 버튼들 */}
             <div className="flex gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              tone={viewMode === 'all' ? 'dark' : 'outlineDark'} 
              variant={viewMode === 'all' ? 'solid' : 'outline'}
               className="!w-20"
              onClick={() => handleViewModeChange('all')}
            >
               전체일정
             </Button>
             <Button 
               size="sm" 
               tone={viewMode === 'marathon' ? 'dark' : 'outlineDark'} 
               variant={viewMode === 'marathon' ? 'solid' : 'outline'}
               className="!w-20"
               onClick={() => handleViewModeChange('marathon')}
             >
               전마협
            </Button>
            <Button 
              size="sm" 
               tone={viewMode === 'national' ? 'dark' : 'outlineDark'} 
               variant={viewMode === 'national' ? 'solid' : 'outline'}
               className="!w-20"
               onClick={() => handleViewModeChange('national')}
             >
               전국일정
             </Button>
             </div>
          </div>
        </div>

        {/* 탭 버튼들 - 모바일 전용 */}
        <div className="sm:hidden mb-4 px-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleViewModeChange('all')}
              className={clsx(
                'flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors',
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              전체일정
            </button>
            <button
              onClick={() => handleViewModeChange('marathon')}
              className={clsx(
                'flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors',
                viewMode === 'marathon'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              전마협 대회일정
            </button>
            <button
              onClick={() => handleViewModeChange('national')}
              className={clsx(
                'flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors',
                viewMode === 'national'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              전국대회 일정
            </button>
          </div>
        </div>

        {/* 날짜 선택 컨트롤 - 모바일 전용 */}
        <div className="sm:hidden mb-6 px-2 py-4 border-t border-b border-black">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-4 rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="text-center">
              <div className="text-[10px] font-semibold text-gray-700">{currentDate.getFullYear()}년</div>
              <div className="text-lg font-extrabold text-gray-900">{currentDate.getMonth() + 1}월</div>
            </div>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-4 rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
              aria-label="다음 달"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* 전체일정 / 전마협 / 전국일정 탭 - 월별로 그룹화된 이벤트 표시 */}
        {(viewMode === 'all' || viewMode === 'marathon' || viewMode === 'national') && (
          <div className="w-full">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">대회일정을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-xl font-medium mb-2">대회일정을 불러올 수 없습니다</p>
                <p className="text-gray-500">잠시 후 다시 시도해주세요</p>
              </div>
            ) : (
              <div className="space-y-12">
                {monthNames.map((monthName, monthIndex) => {
                  const monthEvents = eventsByMonth[monthIndex] || [];
                  
                  if (monthEvents.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={monthIndex}
                      ref={(el) => {
                        monthRefs.current[monthIndex] = el;
                      }}
                      id={`month-${monthIndex}`}
                      className="scroll-mt-32"
                    >
                      {/* 월 헤더 */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 sticky top-32 bg-white py-2 z-10">
                        {monthName}
                      </h2>
                      
                      {/* 이벤트 카드 그리드 */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                        {monthEvents.map(event => {
                          const eventDate = new Date(event.eventDate);
                          const today = new Date();
                          const isPast = eventDate < today;
                          
                          // EventCard에 필요한 props 매핑
                          // API 상태 값을 한글로 변환
                          const getStatusText = (status: string) => {
                            if (status === 'OPEN') return '접수중';
                            if (status === 'PENDING') return '비접수';
                            if (status === 'CLOSED') return '접수마감';
                            return '상태불명'; // 예상치 못한 상태 값의 경우
                          };
                          
                          const eventCardProps = {
                            imageSrc: event.eventImgSrc,
                            imageAlt: event.eventNameKr,
                            title: event.eventNameKr,
                            subtitle: event.eventNameEn,
                            date: `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 ${eventDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`,
                            price: `₩${event.lowerPrice.toLocaleString()}`,
                            status: isPast ? '접수마감' : getStatusText(event.status),
                            eventDate: event.eventDate,
                            eventId: event.eventId
                          };
                          
                          return (
                            <div key={event.eventId} className={clsx(isPast && 'opacity-60')}>
                              <EventCard {...eventCardProps} size="test" className="w-full" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* 모든 월에 대회가 없을 때 */}
                {Object.keys(eventsByMonth).length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl font-medium mb-2">
                      {viewMode === 'all' 
                        ? '예정된 대회가 없습니다' 
                        : viewMode === 'marathon'
                        ? '예정된 전마협 대회가 없습니다'
                        : '예정된 전국 대회가 없습니다'}
                    </p>
                    <p className="text-gray-500">다른 연도를 선택해보세요</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 달력 모드 (기존 calendar 탭) */}
        {viewMode === 'calendar' && (
          <>
            {/* 모바일: 달력과 대회일정을 세로로 배치 */}
            <div className="sm:hidden">
              {/* 달력 */}
              <div className="px-0.5 mb-3">
                <MarathonCalendar 
                  events={marathonEvents} 
                  className="w-full"
                  currentDate={currentDate}
                />
              </div>
              
              {/* 대회일정 테이블 - 통합 */}
              <div className="px-0.5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 px-0.5">
                  {currentDate.getMonth() + 1}월 대회 일정
                </h2>
                
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[1fr_2fr_1fr_0.8fr] gap-1 mb-2 pb-2 border-b border-gray-200">
                  <div className="font-bold text-gray-700 text-center text-xs">일자</div>
                  <div className="font-bold text-gray-700 text-center text-xs">대회명</div>
                  <div className="font-bold text-gray-700 text-center text-xs">개최장소</div>
                  <div className="font-bold text-gray-700 text-center text-xs">비고</div>
                </div>
                
                {/* 테이블 데이터 */}
                <div className="space-y-2">
                  {marathonEvents
                    .filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getMonth() === currentDate.getMonth() && 
                             eventDate.getFullYear() === currentDate.getFullYear();
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const isPast = eventDate < today;
                      
                      return (
                        <div 
                          key={event.id} 
                          className={clsx(
                            'grid grid-cols-[1fr_2fr_1fr_0.8fr] gap-1 p-2 rounded-lg transition-colors',
                            isPast 
                              ? 'bg-gray-100 opacity-60' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          {/* 일자 */}
                          <div className={clsx(
                            'font-bold text-center whitespace-nowrap text-xs sm:text-sm',
                            isPast ? 'text-gray-500' : 'text-gray-900'
                          )}>
                            <div>{eventDate.getDate()}일</div>
                            <div className="text-[10px] sm:text-xs">{event.time}</div>
                          </div>
                          
                          {/* 대회명 */}
                          <div className={clsx(
                            'font-medium text-left whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm',
                            isPast ? 'text-gray-500' : 'text-gray-900'
                          )}>
                            {event.title}
                          </div>
                          
                          {/* 개최장소 */}
                          <div className={clsx(
                            'text-left whitespace-nowrap overflow-hidden text-ellipsis text-[10px] sm:text-xs',
                            isPast ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {event.location}
                          </div>
                          
                          {/* 비고 */}
                          <div className={clsx(
                            'text-center whitespace-nowrap text-[10px] sm:text-xs',
                            isPast ? 'text-gray-400' : 'text-gray-500'
                          )}>
                            {isPast ? '접수마감' : '접수중'}
                          </div>
                        </div>
                      );
                    })}
                  {marathonEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.getMonth() === currentDate.getMonth() && 
                           eventDate.getFullYear() === currentDate.getFullYear();
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>이번 달에는 예정된 대회가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 데스크탑: 달력과 대회일정을 가로로 배치 */}
            <div className="hidden sm:flex flex-col lg:flex-row gap-6">
              {/* 마라톤 캘린더 */}
              <div className="w-full lg:flex-1 lg:min-w-[400px] lg:flex-shrink-0">
                <MarathonCalendar 
                  events={marathonEvents} 
                  className="w-full"
                  currentDate={currentDate}
                />
              </div>
              
              {/* 추가 정보 섹션 */}
              <div className="w-full lg:w-[700px] flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border p-6 h-[600px] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentDate.getMonth() + 1}월 대회 일정
                  </h2>
                  
                  {/* 대회 일정 테이블 헤더 */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-3 pb-2 p-2 sm:p-3 border-b border-gray-200">
                    <div className="font-bold text-gray-700 text-center text-xs sm:text-sm">일자</div>
                    <div className="font-bold text-gray-700 text-center text-xs sm:text-sm">대회명</div>
                    <div className="font-bold text-gray-700 text-center text-xs sm:text-sm">개최장소</div>
                    <div className="font-bold text-gray-700 text-center text-xs sm:text-sm">비고</div>
                  </div>
                  
                  <div className="space-y-2">
                    {marathonEvents
                      .filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getMonth() === currentDate.getMonth() && 
                               eventDate.getFullYear() === currentDate.getFullYear();
                      })
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(event => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        const isPast = eventDate < today;
                        
                        return (
                          <div 
                            key={event.id} 
                            className={clsx(
                              'grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 p-2 sm:p-3 rounded-lg transition-colors',
                              isPast 
                                ? 'bg-gray-100 opacity-60' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            )}
                          >
                            {/* 일자 - 굵은 글씨 */}
                            <div className={clsx(
                              'font-bold text-center whitespace-nowrap',
                              'text-xs sm:text-sm md:text-lg',
                              isPast ? 'text-gray-500' : 'text-gray-900'
                            )}>
                              <div>{eventDate.getDate()}일</div>
                              <div className="text-[10px] sm:text-xs">{event.time}</div>
                            </div>
                            
                            {/* 대회명 */}
                            <div className={clsx(
                              'font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis',
                              'text-xs sm:text-sm',
                              isPast ? 'text-gray-500' : 'text-gray-900'
                            )}>
                              {event.title}
                            </div>
                            
                            {/* 개최장소 */}
                            <div className={clsx(
                              'text-center whitespace-nowrap overflow-hidden text-ellipsis',
                              'text-[10px] sm:text-xs',
                              isPast ? 'text-gray-400' : 'text-gray-600'
                            )}>
                              {event.location}
                            </div>
                            
                            {/* 비고 */}
                            <div className={clsx(
                              'text-center whitespace-nowrap',
                              'text-[10px] sm:text-xs',
                              isPast ? 'text-gray-400' : 'text-gray-500'
                            )}>
                              {isPast ? '접수마감' : '접수중'}
                            </div>
                          </div>
                        );
                      })}
                    {marathonEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getMonth() === currentDate.getMonth() && 
                             eventDate.getFullYear() === currentDate.getFullYear();
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>이번 달에는 예정된 대회가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
        </div>
      </main>
    </div>
  );
}
