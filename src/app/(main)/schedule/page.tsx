'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import MarathonCalendar from '@/components/common/MarathonCalendar';
import { marathonEvents } from '@/data/marathonEvents';
import Button from '@/components/common/Button/Button';
import EventCard from '@/components/main/EventSection/EventCard';
import MainHeader from '@/components/main/Header';
import Image from 'next/image';
import Link from 'next/link';
import menubanner from '@/assets/images/main/menubanner.png';
import homeIcon from '@/assets/icons/main/home.svg';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'all' | 'marathon' | 'national'>('calendar');

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
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

        
        {/* 마라톤 캘린더 */}
        {/* 날짜 선택 컨트롤 - 데스크탑/태블릿 */}
        <div className="hidden sm:block mb-6 p-4 border-t border-b border-black">
          <div className="flex flex-row gap-4 items-center justify-between">
          {/* 연도 선택 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="이전 연도"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <span className="px-2 py-1 font-semibold text-lg min-w-[70px] text-center">
                {currentDate.getFullYear()}년
              </span>
              
              <button
                onClick={() => handleDateChange(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="다음 연도"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* 월 선택 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="overflow-x-auto no-scrollbar w-full">
                <div className="flex gap-1 flex-nowrap min-w-max">
              {monthNames.map((month, index) => (
                <Button
                  key={index}
                  onClick={() => handleDateChange(new Date(currentDate.getFullYear(), index, 1))}
                  size="lg"
    tone="white"
    widthType="default"
                      className={clsx('!font-semibold !text-lg flex-shrink-0 whitespace-nowrap',
                    currentDate.getMonth() === index
                      ? '!bg-blue-600 text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  )}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
            </div>
            
             {/* 탭 버튼들 */}
             <div className="flex gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              tone={viewMode === 'calendar' ? 'dark' : 'outlineDark'} 
              variant={viewMode === 'calendar' ? 'solid' : 'outline'}
               className="!w-20"
              onClick={() => handleViewModeChange('calendar')}
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

        {/* 검색창 - 모바일 전용 */}
        <div className="sm:hidden mb-4 px-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="지역명 혹은 대회명을 입력하세요"
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 탭 버튼들 - 모바일 전용 */}
        <div className="sm:hidden mb-4 px-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleViewModeChange('calendar')}
              className={clsx(
                'flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors',
                viewMode === 'calendar'
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
              onClick={() => handleDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
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
              onClick={() => handleDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-4 rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
              aria-label="다음 달"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
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

                 {/* 전체일정 탭 */}
                 {viewMode === 'all' && (
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
                               className="grid grid-cols-[1fr_2fr_1fr_0.8fr] gap-1 py-2 px-1 rounded hover:bg-gray-50"
                             >
                               <div className="text-center text-xs text-gray-900">
                                 {eventDate.getDate()}일 ({event.time})
                               </div>
                               <div className="text-left text-xs text-gray-900 font-medium truncate">
                                 {event.title}
                               </div>
                               <div className="text-center text-xs text-gray-600 truncate">
                                 {event.location}
                               </div>
                               <div className="text-center">
                                 <span className={clsx(
                                   'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                   isPast 
                                     ? 'bg-gray-100 text-gray-600' 
                                     : 'bg-green-100 text-green-800'
                                 )}>
                                   {isPast ? '접수마감' : '접수중'}
                                 </span>
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
                   <div className="hidden sm:block">
                     <div className="flex gap-6">
                       {/* 달력 */}
                       <div className="flex-1">
                         <MarathonCalendar 
                           events={marathonEvents} 
                           currentDate={currentDate}
                           className="w-full"
                         />
                       </div>
                       
                       {/* 대회일정 테이블 */}
                       <div className="flex-1">
                         <h2 className="text-lg font-semibold text-gray-900 mb-4">
                           {currentDate.getMonth() + 1}월 대회 일정
                         </h2>
                         
                         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                           <div className="overflow-x-auto">
                             <table className="w-full">
                               <thead className="bg-gray-50">
                                 <tr>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일자</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대회명</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">개최장소</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                                 </tr>
                               </thead>
                               <tbody className="bg-white divide-y divide-gray-200">
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
                                       <tr key={event.id} className={clsx(isPast && 'opacity-60')}>
                                         <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                           {eventDate.getMonth() + 1}.{eventDate.getDate()}
                                         </td>
                                         <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                           {event.title}
                                         </td>
                                         <td className="px-4 py-4 text-sm text-gray-600">
                                           {event.location}
                                         </td>
                                         <td className="px-4 py-4 whitespace-nowrap">
                                           <span className={clsx(
                                             'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                             isPast 
                                               ? 'bg-gray-100 text-gray-600' 
                                               : 'bg-green-100 text-green-800'
                                           )}>
                                             {isPast ? '접수마감' : '접수중'}
                                           </span>
                                         </td>
                                       </tr>
                                     );
                                   })}
                                 {marathonEvents.filter(event => {
                                   const eventDate = new Date(event.date);
                                   return eventDate.getMonth() === currentDate.getMonth() && 
                                          eventDate.getFullYear() === currentDate.getFullYear();
                                 }).length === 0 && (
                                   <tr>
                                     <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                       이번 달에는 예정된 대회가 없습니다.
                                     </td>
                                   </tr>
                                 )}
                               </tbody>
                             </table>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   </>
                 )}

                 {/* 전마협 대회일정 탭 */}
                 {viewMode === 'marathon' && (
                   <div className="w-full">
                     
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                       {marathonEvents
                         .filter(event => {
                           const eventDate = new Date(event.date);
                           return eventDate.getMonth() === currentDate.getMonth() && 
                                  eventDate.getFullYear() === currentDate.getFullYear() &&
                                  event.type === 'marathon';
                         })
                         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                         .map(event => {
                           const eventDate = new Date(event.date);
                           const today = new Date();
                           const isPast = eventDate < today;
                           
                           // EventCard에 필요한 props 매핑
                           const eventCardProps = {
                             imageSrc: event.imageSrc,
                             imageAlt: event.title,
                             title: event.title,
                             subtitle: event.location,
                             date: `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 ${event.time}`,
                             price: event.category === 'full' ? '풀마라톤' : 
                                    event.category === 'half' ? '하프마라톤' : 
                                    event.category === '10k' ? '10km' : 
                                    event.category === '5k' ? '5km' : '기타',
                             status: isPast ? '접수마감' : '접수중',
                             eventDate: event.date
                           };
                           
                           return (
                             <div key={event.id} className={clsx(
                               isPast && 'opacity-60'
                             )}>
                               <EventCard {...eventCardProps} size="test" className="w-full" />
                             </div>
                           );
                         })}
                       
                       {/* 해당 월에 대회가 없을 때 */}
                       {marathonEvents.filter(event => {
                         const eventDate = new Date(event.date);
                         return eventDate.getMonth() === currentDate.getMonth() && 
                                eventDate.getFullYear() === currentDate.getFullYear();
                       }).length === 0 && (
                         <div className="col-span-2 md:col-span-3 lg:col-span-5 text-center py-16 text-gray-500">
                           <div className="text-6xl mb-4">📅</div>
                           <p className="text-xl font-medium mb-2">이번 달에는 예정된 대회가 없습니다</p>
                           <p className="text-gray-500">다른 월을 선택해보세요</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                 {/* 전국대회 일정 탭 */}
                 {viewMode === 'national' && (
                   <div className="w-full">
                     
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                       {marathonEvents
                         .filter(event => {
                           const eventDate = new Date(event.date);
                           return eventDate.getMonth() === currentDate.getMonth() && 
                                  eventDate.getFullYear() === currentDate.getFullYear() &&
                                  event.type === 'national';
                         })
                         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                         .map(event => {
                           const eventDate = new Date(event.date);
                           const today = new Date();
                           const isPast = eventDate < today;
                           
                           // EventCard에 필요한 props 매핑
                           const eventCardProps = {
                             imageSrc: event.imageSrc,
                             imageAlt: event.title,
                             title: event.title,
                             subtitle: event.location,
                             date: `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 ${event.time}`,
                             price: event.category === 'full' ? '풀마라톤' : 
                                    event.category === 'half' ? '하프마라톤' : 
                                    event.category === '10k' ? '10km' : 
                                    event.category === '5k' ? '5km' : '기타',
                             status: isPast ? '접수마감' : '접수중',
                             eventDate: event.date
                           };
                           
                           return (
                             <div key={event.id} className={clsx(
                               isPast && 'opacity-60'
                             )}>
                               <EventCard {...eventCardProps} size="test" className="w-full" />
                             </div>
                           );
                         })}
                       
                       {/* 해당 월에 대회가 없을 때 */}
                       {marathonEvents.filter(event => {
                         const eventDate = new Date(event.date);
                         return eventDate.getMonth() === currentDate.getMonth() && 
                                eventDate.getFullYear() === currentDate.getFullYear() &&
                                event.type === 'national';
                       }).length === 0 && (
                         <div className="col-span-2 md:col-span-3 lg:col-span-5 text-center py-16 text-gray-500">
                           <div className="text-6xl mb-4">📅</div>
                           <p className="text-xl font-medium mb-2">이번 달에는 예정된 대회가 없습니다</p>
                           <p className="text-gray-500">다른 월을 선택해보세요</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

      </div>
        </div>
      </main>
    </div>
  );
}
