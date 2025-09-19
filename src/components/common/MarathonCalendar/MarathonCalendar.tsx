'use client';


import clsx from 'clsx';
import type { StaticImageData } from 'next/image';

export interface MarathonEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD 형식
  location: string;
  time: string;
  category: 'full' | 'half' | '10k' | '5k' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed';
  type?: 'marathon' | 'national'; // 전마협/전국대회 구분
  imageSrc: StaticImageData; // 이미지 경로 문자열로 변경
}

interface MarathonCalendarProps {
  events?: MarathonEvent[];
  className?: string;
  currentDate: Date;
}

export default function MarathonCalendar({ events = [], className, currentDate }: MarathonCalendarProps) {
  
  // 현재 월의 첫 번째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // 현재 월의 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ...)
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // 현재 월의 총 일수
  const totalDays = lastDayOfMonth.getDate();
  

  
  // 오늘 날짜인지 확인
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };
  
  // 특정 날짜에 이벤트가 있는지 확인
  const getEventsForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateString);
  };
  
  // 요일 이름 배열
  const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // 캘린더 그리드 생성
  const calendarDays = [];
  
  // 이전 월의 마지막 날들 (첫 번째 주를 채우기 위해)
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // 현재 월의 날들
  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day);
  }
  
  // 다음 월의 첫 번째 날들 (마지막 주를 채우기 위해)
  const remainingDays = 42 - calendarDays.length; // 6주 * 7일 = 42
  for (let i = 0; i < remainingDays; i++) {
    calendarDays.push(null);
  }

  return (
    <div className={clsx('bg-white rounded-lg w-full', className)}>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2 bg-gray-100 py-1">
        {weekdayNames.map((weekday, index) => (
          <div
            key={weekday}
            className={clsx(
              'p-2 md:p-3 text-center text-xs sm:text-sm md:text-lg font-bold',
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            )}
          >
            {weekday}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2 md:p-3" />;
          }
          
          const dayEvents = getEventsForDate(day);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={index}
              className={clsx(
                'p-2 md:p-3 min-h-[50px] sm:min-h-[60px] md:min-h-[80px] transition-colors relative mb-1 md:mb-2',
                isToday(day) && 'bg-blue-50 border-blue-200'
              )}
            >
              <div className={clsx(
                'text-xs sm:text-sm md:text-lg font-bold text-center pb-1 md:pb-2',
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
              )}>
                {day}
              </div>
              
              {hasEvents && (
                <div className="flex justify-center items-center mt-1 md:mt-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
