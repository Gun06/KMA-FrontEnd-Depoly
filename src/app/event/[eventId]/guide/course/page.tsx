"use client";

import { useEffect, useState } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import Image from "next/image";

interface EventPageImage {
  imageUrl: string;
  orderNumber: number;
}

export default function GuideCoursePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [images, setImages] = useState<EventPageImage[]>([]);
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
          // API 응답이 배열인 경우 처리
          if (Array.isArray(data) && data.length > 0) {
            // orderNumber로 정렬하여 모든 이미지 저장
            const sortedImages = [...data].sort((a, b) => a.orderNumber - b.orderNumber);
            setImages(sortedImages);
          } else if (data && typeof data === 'object' && 'coursePageImageUrl' in data) {
            // 단일 객체 응답인 경우 (하위 호환성)
            setImages([{ imageUrl: data.coursePageImageUrl, orderNumber: 0 }]);
          } else {
            setImages([]);
          }
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

  // 로딩 상태 제거 - 바로 콘텐츠 표시

  if (error && images.length === 0) {
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
          {/* coursePageImageUrl 이미지 표시 */}
          {images.length > 0 && (
            <div>
              {images.map((image, index) => (
                <div key={`${image.orderNumber}-${index}`} className="flex justify-center">
                  <Image
                    src={image.imageUrl}
                    alt={`대회 코스 이미지 ${index + 1}`}
                    width={800}
                    height={600}
                    priority={index === 0}
                    className="max-w-full h-auto"
                    style={{ touchAction: 'auto' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SubmenuLayout>
  );
}
