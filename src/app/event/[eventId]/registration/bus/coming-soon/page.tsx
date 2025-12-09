"use client";

import { useRouter } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";

export default function BusComingSoonPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToMain = () => {
    router.push(`/event/${params.eventId}`);
  };

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "마라톤 버스예약"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 서비스 준비중 안내 */}
          <div className="bg-white rounded-xl p-8 text-center">
            {/* 준비중 아이콘 */}
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* 메인 메시지 */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              본 대회는 셔틀버스 운영 계획이 없습니다.
            </h2>
            
            {/* 상세 설명 */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              본 대회는 셔틀버스 운영 계획이 없습니다.
            </p>





            {/* 문의 안내 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">문의사항</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 버스 예약 관련 문의: 042) 638-1080</p>
                <p>• 운영시간: 평일 09:00 ~ 18:00</p>
                <p>• FAX: 042) 638-1087</p>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGoBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold text-base hover:bg-gray-700 transition-colors"
              >
                이전 페이지로
              </button>
              <button
                onClick={handleGoToMain}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors"
              >
                메인으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
