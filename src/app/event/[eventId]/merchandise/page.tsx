"use client";

import { useEffect, useState } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { GuidePageImageStack } from "@/components/event/GuidePageImageStack";

interface EventPageImage {
  imageUrl: string;
  orderNumber: number;
}

export default function MerchandisePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [images, setImages] = useState<EventPageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/souvenir-image`;

        const response = await fetch(API_ENDPOINT);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const sortedImages = [...data].sort((a, b) => a.orderNumber - b.orderNumber);
            setImages(sortedImages);
          } else if (data && typeof data === "object" && "souvenirPageImageUrl" in data) {
            setImages([{ imageUrl: data.souvenirPageImageUrl, orderNumber: 0 }]);
          } else {
            setImages([]);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch {
        setError("이벤트 정보를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (error && !isLoading && images.length === 0) {
    return (
      <SubmenuLayout
        eventId={eventId}
        breadcrumb={{
          mainMenu: "기념품",
          subMenu: "대회 기념품",
        }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
            <div className="flex justify-center">
              <div className="text-center">
                <div className="mb-2 text-gray-500">오류가 발생했습니다</div>
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
        mainMenu: "기념품",
        subMenu: "대회 기념품",
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
          <h2 className="mb-3 text-left text-xl font-extrabold text-gray-900 sm:mb-4 sm:text-2xl">
            대회 기념품
          </h2>
          <hr className="mb-3 border-black sm:mb-4" style={{ borderWidth: "1.7px" }} />

          <div className="mb-4 sm:mb-6">
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              대회 참가자들을 위한 특별한 기념품을 안내합니다.
            </p>
          </div>

          <GuidePageImageStack
            images={images}
            altPrefix="대회 기념품 이미지"
            isLoading={isLoading}
          />
        </div>
      </div>
    </SubmenuLayout>
  );
}
