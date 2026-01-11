"use client";

import { useEffect, useState } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import Image from "next/image";

interface EventPageImage {
  imageUrl: string;
  orderNumber: number;
}

export default function GuideGatheringPage({ params }: { params: { eventId: string } }) {
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
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/meeting-place-image`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          // API 응답이 배열인 경우 처리
          if (Array.isArray(data) && data.length > 0) {
            // orderNumber로 정렬하여 모든 이미지 저장
            const sortedImages = [...data].sort((a, b) => a.orderNumber - b.orderNumber);
            setImages(sortedImages);
          } else if (data && typeof data === 'object' && 'meetingPlacePageImageUrl' in data) {
            // 단일 객체 응답인 경우 (하위 호환성)
            setImages([{ imageUrl: data.meetingPlacePageImageUrl, orderNumber: 0 }]);
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
          subMenu: "집결/출발"
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
        subMenu: "집결/출발"
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
                출발그룹은 최고기록을 바탕으로 배정되었으며 플래카드의 유도 지시에 따라 순서대로 자신의 출발그룹별 지점에 위치해 주시기 바랍니다.
              </p>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <hr className="border-gray-200 border-t mb-3 sm:mb-4" />

            <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2 sm:mb-3 text-left">공통 사항</h3>
            <div className="text-gray-700 space-y-2 sm:space-y-3 text-left">
              <ul className="list-disc space-y-1.5 sm:space-y-2 text-sm sm:text-base leading-relaxed pl-5">
                <li>출발지점에는 적어도 출발 30분 전에 집결해 주시기 바랍니다.</li>
                <li>출발 시간에 늦은 참가자는 맨 후미에서 출발하시기 바랍니다.</li>
                <li>넷타임 기록이 제공되는 만큼 여유를 가지고 천천히 출발하시기 바랍니다.</li>
                <li>마지막 출발 행렬이 출발지를 벗어난 다음 5분 뒤 출발선을 폐쇄합니다.</li>
                <li>이후에는 출발할 수 없으며 임의 출발 시 (출발매트를 통과하지 않을 경우) 기록이 공인되지 않습니다.</li>
                <li>원활한 코스 운영을 위한 조직위원회의 방침이오니 반드시 출발 시각을 지켜 주시기 바랍니다.</li>
              </ul>
            </div>
          </div>
          
          {/* meetingPlacePageImageUrl 이미지 표시 */}
          {images.length > 0 && (
            <div>
              {images.map((image, index) => (
                <div key={`${image.orderNumber}-${index}`} className="flex justify-center">
                  <Image
                    src={image.imageUrl}
                    alt={`집결 출발 안내 이미지 ${index + 1}`}
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
