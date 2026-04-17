"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { fetchSpecialEventImageUrl } from "@/services/publicEventAssets";

export default function GuideEventPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await fetchSpecialEventImageUrl(eventId);
        setImageUrl(url);
      } catch {
        setError("이벤트 이미지를 불러올 수 없습니다.");
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [eventId]);

  return (
    <SubmenuLayout
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "이벤트",
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
          {isLoading ? (
            <div className="flex justify-center mb-6">
              <div className="w-full max-w-4xl h-[600px] bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ) : imageUrl ? (
            <div className="flex justify-center">
              <Image
                src={imageUrl}
                alt="이벤트 안내 이미지"
                width={800}
                height={600}
                priority
                className="max-w-full h-auto"
                style={{ touchAction: "auto" }}
              />
            </div>
          ) : error ? (
            <div className="text-center text-sm text-gray-500">{error}</div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-[800px] min-h-[320px] sm:min-h-[360px] md:min-h-[420px] rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white shadow-sm flex flex-col items-center justify-center px-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold text-gray-800">이벤트 콘텐츠 준비중</p>
                <p className="mt-2 text-sm text-gray-500">
                  곧 업데이트될 예정입니다. 잠시만 기다려 주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SubmenuLayout>
  );
}
