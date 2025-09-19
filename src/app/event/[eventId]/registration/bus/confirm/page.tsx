"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { busLocations, paymentMethods } from "../data";

export default function BusConfirmPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 예약 데이터 가져오기 (실제로는 상태 관리나 API에서 가져와야 함)
  const departureLocationId = searchParams.get('departure') || 'seoul_station';
  const paymentMethodId = searchParams.get('payment') || 'card';
  
  const selectedLocation = busLocations.find(loc => loc.id === departureLocationId);
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);

  const handleConfirm = () => {
    // TODO: 실제 버스예약 API 호출
    console.log('버스예약 확정:', { departureLocationId, paymentMethodId });
    
    // 예약 완료 후 완료 페이지로 이동
    router.push(`/event/${params.eventId}/registration/bus/complete`);
  };

  const handleBack = () => {
    router.back();
  };

  if (!selectedLocation || !selectedPaymentMethod) {
    return (
      <SubmenuLayout 
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "마라톤 버스예약"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">예약 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

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
          {/* 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">버스 예약 확인</h1>
            <p className="text-lg text-gray-600">예약 정보를 확인하고 확정해주세요</p>
          </div>

          {/* 예약 정보 */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-4">예약 정보</h2>
            
            <div className="space-y-6">
              {/* 출발지 정보 */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">출발지</h3>
                  <p className="text-gray-600">{selectedLocation.name}</p>
                  <p className="text-sm text-gray-500">
                    출발시간: {selectedLocation.departureTime} | 정원: {selectedLocation.capacity}명
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedLocation.price.toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* 결제수단 */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">결제수단</h3>
                  <p className="text-gray-600">{selectedPaymentMethod.label}</p>
                  <p className="text-sm text-gray-500">{selectedPaymentMethod.description}</p>
                </div>
              </div>

              {/* 총 결제금액 */}
              <div className="flex items-center justify-between pt-4">
                <h3 className="text-xl font-bold text-black">총 결제금액</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {selectedLocation.price.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>

          {/* 안내사항 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-black mb-4">예약 안내사항</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• 예약 확정 후 취소는 대회 3일 전까지 가능합니다</p>
              <p>• 결제는 선택하신 방법으로 진행됩니다</p>
              <p>• 예약 확정 시 SMS로 안내드립니다</p>
              <p>• 버스 내 음식물 섭취는 금지되어 있습니다</p>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="min-w-[120px] px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              뒤로가기
            </button>
            <button
              onClick={handleConfirm}
              className="min-w-[120px] px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              예약 확정
            </button>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
