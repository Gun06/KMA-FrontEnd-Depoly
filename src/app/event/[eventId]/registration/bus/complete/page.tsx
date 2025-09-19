"use client";

import { useRouter } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";

export default function BusCompletePage({ params }: { params: { eventId: string } }) {
  const router = useRouter();

  const handleGoToMain = () => {
    router.push(`/event/${params.eventId}`);
  };

  const handleGoToMyPage = () => {
    router.push(`/event/${params.eventId}/mypage`);
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
          {/* 완료 아이콘 */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">버스 예약이 완료되었습니다!</h1>
            <p className="text-lg text-gray-600">마라톤 대회 당일 안전하게 이동하세요</p>
          </div>

          {/* 예약 완료 정보 */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-4">예약 완료 정보</h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-green-600 font-semibold mb-2">예약 번호</div>
                <div className="text-2xl font-bold text-green-700">BUS-2025-001</div>
                <p className="text-sm text-green-600 mt-2">이 번호로 예약을 확인할 수 있습니다</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">예약 상태</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    예약 완료
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">결제 상태</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    결제 대기
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">예약 일시</span>
                  <span className="text-black font-medium">
                    {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 다음 단계 안내 */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">다음 단계</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• 결제가 완료되면 SMS로 안내드립니다</p>
              <p>• 대회 3일 전까지 예약 취소가 가능합니다</p>
              <p>• 출발 10분 전까지 해당 장소에 도착해주세요</p>
              <p>• 마이페이지에서 예약 내역을 확인할 수 있습니다</p>
            </div>
          </div>

          {/* 문의 안내 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-black mb-4">문의사항</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• 버스 예약 관련 문의: 02-1234-5678</p>
              <p>• 운영시간: 평일 09:00 ~ 18:00</p>
              <p>• 이메일: bus@marathon2025.com</p>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleGoToMain}
              className="min-w-[120px] px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              메인으로
            </button>
            <button
              onClick={handleGoToMyPage}
              className="min-w-[120px] px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              마이페이지
            </button>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
