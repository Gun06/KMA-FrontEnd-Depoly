'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useQueries } from '@tanstack/react-query';
import MarathonCalendar from '@/components/common/MarathonCalendar';
import Button from '@/components/common/Button/Button';
import EventCard from '@/components/main/EventSection/EventCard';
import Image from 'next/image';
import Link from 'next/link';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';
import { flattenScheduleEvents, flattenCalendarEvents, filterScheduleEventsByType } from '@/hooks/useSchedule';
import { fetchScheduleEvents, fetchCalendarEvents } from '@/services/schedule';
import { ScheduleEvent, CalendarEvent } from '@/types/event';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'all' | 'marathon' | 'national'>('marathon');
  const monthRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const monthScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isStickyFixed, setIsStickyFixed] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  
  // 각 월별로 API 호출하여 전체 연도 데이터 수집
  const year = currentDate.getFullYear();
  
  // viewMode를 API type 파라미터로 변환
  const apiType = useMemo(() => {
    if (viewMode === 'all') return 'ALL';
    if (viewMode === 'marathon') return 'KMA';
    if (viewMode === 'national') return 'LOCAL';
    return 'ALL';
  }, [viewMode]);
  
  const scheduleQueries = useQueries({
    queries: Array.from({ length: 12 }, (_, i) => ({
      queryKey: ['schedule', year, i + 1, apiType],
      queryFn: () => fetchScheduleEvents(year, i + 1, apiType),
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

  // 스크롤 이벤트로 배너가 넘어가면 fixed로 전환
  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const bannerBottom = bannerRef.current.offsetTop + bannerRef.current.offsetHeight;
        const scrollY = window.scrollY;
        const headerHeight = 64; // 헤더 높이
        
        // 배너가 스크롤되면 fixed로 전환
        setIsStickyFixed(scrollY + headerHeight >= bannerBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 확인

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-[50vh] sm:min-h-screen">
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 메뉴 배너 섹션 */}
        <div ref={bannerRef} className="relative w-full">
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

        <div className="border-b border-gray-100 bg-gray-50/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2 text-center sm:text-center">
            <span>지역에서 진행하는 대회를 등록·관리하려면</span>
            <Link href="/schedule/local" className="text-blue-600 font-medium hover:underline whitespace-nowrap">
              지역대회 바로가기
            </Link>
          </div>
        </div>
        
        {/* 탭 버튼 + 날짜 선택 컨트롤 - 모바일 전용, 하나로 묶어서 상단 고정 */}
        {/* 배너가 스크롤되면 헤더 바로 아래에 고정되도록 스크롤 이벤트로 fixed 전환 */}
        <div 
          className={clsx(
            "sm:hidden z-[100] bg-white shadow-sm",
            isStickyFixed ? "fixed left-0 right-0" : "relative"
          )}
          style={isStickyFixed ? { top: 'var(--kma-main-header-offset, 64px)' } : undefined}
        >
          {/* 탭 버튼들 */}
          <div className="px-2 pt-2 pb-2">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleViewModeChange('marathon')}
                className={clsx(
                  'flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors',
                  viewMode === 'marathon'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                전마협
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
                전국일정
              </button>
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
            </div>
          </div>

          {/* 날짜 선택 컨트롤 */}
          <div className="px-2 py-2 border-t border-b border-l-0 border-r-0 border-[0.5px] border-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                  setCurrentDate(newDate);
                  scrollToMonth(newDate.getMonth());
                }}
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
                onClick={() => {
                  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                  setCurrentDate(newDate);
                  scrollToMonth(newDate.getMonth());
                }}
                className="p-4 rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                aria-label="다음 달"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* 페이지 콘텐츠 - 헤더와 동일한 너비로 맞춤 */}
        {/* 배너와 일정 사이 간격 줄이기 */}
        {/* 데스크탑에서 fixed로 전환될 때 컨텐츠가 겹치지 않도록 padding-top 추가 */}
        <div 
          className="w-full py-2 sm:py-4 lg:py-6" 
          style={{ 
            paddingTop: isStickyFixed 
              ? 'calc(1rem + var(--kma-main-header-offset, 64px))' 
              : undefined 
          }}
        >
          <div className="flex flex-col mx-auto w-full max-w-[1920px]">

        {/* 날짜 선택 컨트롤 - 데스크탑/태블릿 */}
        {/* 배너가 스크롤되면 헤더 바로 아래에 고정되도록 스크롤 이벤트로 fixed 전환 */}
        {/* 헤더와 정확히 맞추기 위해 헤더와 동일한 패딩 적용, 639px~1299px: px-12, 1299px 이상: px-20 */}
        <div 
          className={clsx(
            "hidden sm:block mb-6 py-2 px-4 sm:px-12 min-[1299px]:px-20 border-t border-b border-l-0 border-r-0 border-[0.5px] border-gray-800 bg-white z-20",
            isStickyFixed ? "fixed left-0 right-0" : "relative"
          )}
          style={isStickyFixed ? { top: 'var(--kma-main-header-offset, 64px)' } : undefined}
        >
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
                <div className="flex gap-3 min-[1400px]:gap-5 min-[1600px]:gap-8 min-[1900px]:gap-12 flex-nowrap min-w-max">
              {monthNames.map((month, index) => {
                const hasEvents = eventsByMonth[index] && eventsByMonth[index].length > 0;
                const isCurrentMonth = currentDate.getMonth() === index;
                return (
                  <div key={index} className="flex items-center gap-3 min-[1400px]:gap-5 min-[1600px]:gap-8 min-[1900px]:gap-12 flex-shrink-0">
                    <Button
                      onClick={() => handleDateChange(new Date(currentDate.getFullYear(), index, 1))}
                      size="lg"
                      tone="white"
                      widthType="default"
                      className={clsx('!font-semibold !text-lg flex-shrink-0 whitespace-nowrap !rounded-full !px-3 !py-3 flex items-center justify-center !w-12 !h-12 transition-colors duration-200',
                        isCurrentMonth
                          ? '!bg-[#ECF2FE] text-blue-600'
                          : hasEvents
                          ? 'bg-white text-black hover:!bg-gray-50'
                          : 'bg-white text-gray-400 hover:!bg-gray-50'
                      )}
                    >
                      {month}
                    </Button>
                    {/* 현재 선택된 월에서만 다음 달로 이동하는 > 버튼 표시 */}
                    {isCurrentMonth && index < 11 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextMonth = index + 1;
                          handleDateChange(new Date(currentDate.getFullYear(), nextMonth, 1));
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        aria-label="다음 달"
                        title="다음 달"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
            </div>
            
             {/* 탭 버튼들 */}
             <div className="flex gap-2 flex-shrink-0">
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
             <Button 
              size="sm" 
              tone={viewMode === 'all' ? 'dark' : 'outlineDark'} 
              variant={viewMode === 'all' ? 'solid' : 'outline'}
               className="!w-20"
              onClick={() => handleViewModeChange('all')}
            >
               전체일정
             </Button>
             </div>
          </div>
        </div>

        {/* 전체일정 / 전마협 / 전국일정 탭 - 월별로 그룹화된 이벤트 표시 */}
        {/* 헤더와 정확히 맞추기 위해 헤더와 동일한 패딩 적용, 639px~1299px: px-12, 1299px 이상: px-20 */}
        {(viewMode === 'all' || viewMode === 'marathon' || viewMode === 'national') && (
          <div className="w-full px-4 sm:px-12 min-[1299px]:px-20">
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
                {(() => {
                  // 전체 빈 상태 확인 (현재 년도만 확인)
                  const currentYear = currentDate.getFullYear();
                  const hasAnyEventsInCurrentYear = Object.keys(eventsByMonth).some(key => {
                    const monthEvents = eventsByMonth[parseInt(key)] || [];
                    return monthEvents.some(event => {
                      const eventDate = new Date(event.eventDate);
                      return eventDate.getFullYear() === currentYear;
                    });
                  });
                  
                  // 전체 빈 상태면 전체 메시지만 표시
                  if (!hasAnyEventsInCurrentYear) {
                    return (
                      <div className="text-center py-16 text-gray-500">
                        <div className="text-4xl sm:text-6xl mb-4">📅</div>
                        <p className="text-base sm:text-xl font-medium mb-2">
                          {viewMode === 'all' 
                            ? '예정된 대회가 없습니다' 
                            : viewMode === 'marathon'
                            ? '예정된 전마협 대회가 없습니다'
                            : '예정된 전국 대회가 없습니다'}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500">다른 연도를 선택해보세요</p>
                      </div>
                    );
                  }
                  
                  // 전체 빈 상태가 아니면 월별로 표시
                  return monthNames.map((monthName, monthIndex) => {
                    const monthEvents = eventsByMonth[monthIndex] || [];
                    
                    // 현재 선택된 년도와 일치하는 이벤트만 필터링
                    const filteredMonthEvents = monthEvents.filter(event => {
                      const eventDate = new Date(event.eventDate);
                      return eventDate.getFullYear() === currentYear;
                    });
                    
                    // 해당 년도에 다른 달에 데이터가 있는지 확인 (현재 년도만 확인)
                    const hasEventsInOtherMonths = Object.keys(eventsByMonth).some(key => {
                      const monthKey = parseInt(key);
                      if (monthKey === monthIndex) return false;
                      const otherMonthEvents = eventsByMonth[monthKey] || [];
                      // 현재 년도와 일치하는 이벤트가 있는지 확인
                      return otherMonthEvents.some(event => {
                        const eventDate = new Date(event.eventDate);
                        return eventDate.getFullYear() === currentYear;
                      });
                    });

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
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 sticky top-32 bg-white py-2 z-[5]">
                        {monthName}
                      </h2>
                      
                      {filteredMonthEvents.length === 0 ? (
                        // 해당 달에 대회가 없을 때
                        <div className="text-center py-16 text-gray-500">
                          <div className="text-4xl sm:text-6xl mb-4">📅</div>
                          <p className="text-sm sm:text-lg font-medium mb-2">
                            {monthName}에는 예정된 대회가 없습니다
                          </p>
                          {hasEventsInOtherMonths && (
                            <p className="text-xs sm:text-sm text-gray-400">
                              다른 월을 선택해보세요
                            </p>
                          )}
                        </div>
                      ) : (
                        /* 이벤트 카드 그리드 - 주요대회일정과 동일한 olive 카드 디자인 */
                        /* 915px~1260px 구간에서는 4열, 1260px~1560px: 5열, 1560px 이상: 6열 */
                        <ul className="grid grid-cols-2 sm:grid-cols-3 min-[915px]:grid-cols-4 min-[1260px]:grid-cols-5 min-[1560px]:grid-cols-6 gap-4 md:gap-5 lg:gap-6 auto-rows-fr list-none">
                          {filteredMonthEvents.map(event => {
                            const eventDate = new Date(event.eventDate);
                            const today = new Date();
                            const isPast = eventDate < today;
                            const eventDateStr = typeof event.eventDate === 'string' && event.eventDate.includes('T')
                              ? event.eventDate.split('T')[0]
                              : event.eventDate;
                            const eventDeadLineStr = event.eventDeadLine && typeof event.eventDeadLine === 'string' && event.eventDeadLine.includes('T')
                              ? event.eventDeadLine.split('T')[0]
                              : event.eventDeadLine ?? undefined;
                            
                            const eventCardProps = {
                              imageSrc: event.eventImgSrc,
                              imageAlt: event.eventNameKr,
                              title: event.eventNameKr,
                              subtitle: event.eventNameEn,
                              date: `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 ${eventDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`,
                              categoryNames: event.categoryNames,
                              status: event.status,
                              eventDate: eventDateStr,
                              eventDeadLine: eventDeadLineStr,
                              eventId: event.eventId,
                              eventUrl: event.eventUrl ?? undefined,
                            };
                            
                            return (
                              <EventCard
                                key={event.eventId}
                                {...eventCardProps}
                                size="olive"
                                className={clsx('w-full', isPast && 'opacity-60')}
                              />
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                  });
                })()}
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
  