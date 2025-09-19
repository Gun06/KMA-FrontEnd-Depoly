"use client";

import { useEffect, useState } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import Image from "next/image";

interface EventCourseInfo {
  coursePageImageUrl: string;
}

export default function GuideCoursePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [eventData, setEventData] = useState<EventCourseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 이벤트 정보 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/course-image`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // API 데이터만 사용
  const imageUrl = eventData?.coursePageImageUrl;

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "대회 코스"
        }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex justify-center">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error && !eventData) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "대회 코스"
        }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
                <div className="text-sm text-gray-400">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "대회 코스"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 sm:mb-4 text-left">출발지 안내</h2>
          <hr className="border-black mb-3 sm:mb-4" style={{ borderWidth: '1.7px' }} />
          
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2 sm:mb-3 text-left">풀코스 안내</h3>
            <div className="text-gray-700 space-y-2 sm:space-y-3 text-left">
              <p className="text-sm sm:text-base leading-relaxed">
                출발지에서 심판의 신호에 따라 배정받은 출발그룹별로 순차적으로 출발합니다.
                <br />
                출발그룹은 최고기록을 바탕으로 배정되었으며 플래카드의 유도 지시에 따라 순서대로 자신의 출발그룹별 지점에 위치해 주시기 바랍니다.
              </p>
            </div>
          </div>
          
          {/* coursePageImageUrl 이미지 표시 */}
          {imageUrl && (
            <div className="flex justify-center">
              <Image
                src={imageUrl}
                alt="대회 코스 이미지"
                width={800}
                height={600}
                priority
                className="max-w-full h-auto select-none pointer-events-none"
                draggable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </SubmenuLayout>
  );
}
