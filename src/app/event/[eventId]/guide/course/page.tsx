"use client";

import { useEffect, useState } from "react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import PageMediaList from "@/components/event/PageMediaList";
import type { PageMediaItem } from "@/types/pageMedia";
import { parsePageMediaResponse } from "@/utils/pageMedia";

export default function GuideCoursePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [images, setImages] = useState<PageMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/course-image`;

        const response = await fetch(API_ENDPOINT);

        if (response.ok) {
          const data = await response.json();
          setImages(parsePageMediaResponse(data, ["coursePageImageUrl"]));
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

  if (error && images.length === 0) {
    return (
      <SubmenuLayout
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "대회 코스",
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
        subMenu: "대회 코스",
      }}
    >
      <div className="container mx-auto px-4 pt-1 pb-4 sm:pt-2 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
          <p className="mb-4 text-sm sm:text-base text-black text-center font-light">
            안전 및 원활한 대회 진행을 위해 코스는 조정될 수 있습니다.
          </p>
          {!isLoading && <PageMediaList items={images} altPrefix="대회 코스" />}
        </div>
      </div>
    </SubmenuLayout>
  );
}
