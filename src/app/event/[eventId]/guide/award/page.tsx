"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trophy } from "lucide-react";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { fetchAwardInfoImageUrl } from "@/services/publicEventAssets";

export default function GuideAwardPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await fetchAwardInfoImageUrl(eventId);
        setImageUrl(url);
      } catch {
        setError("시상안내 이미지를 불러올 수 없습니다.");
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
        subMenu: "시상안내",
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
                alt="시상안내 이미지"
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
              <div className="w-full max-w-[800px] min-h-[320px] sm:min-h-[360px] md:min-h-[420px] rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm flex flex-col items-center justify-center px-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Trophy className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold text-gray-800">시상안내 콘텐츠 준비중</p>
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
