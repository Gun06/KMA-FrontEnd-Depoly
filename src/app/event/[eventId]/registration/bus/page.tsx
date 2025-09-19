"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { BusReservationData, busLocations, paymentMethods } from "./data";

export default function BusPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BusReservationData>({
    departureLocation: '',
    paymentMethod: 'bank_transfer'
  });
  
  const [openDropdown, setOpenDropdown] = useState<'departure' | null>(null);
  const departureRef = useRef<HTMLDivElement>(null);

  // 선택된 출발지 정보
  const selectedLocation = busLocations.find(loc => loc.id === formData.departureLocation);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        departureRef.current && !departureRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: keyof BusReservationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setOpenDropdown(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departureLocation) {
      alert('출발지를 선택해주세요.');
      return;
    }

    // TODO: 실제 버스예약 API 호출
    console.log('버스예약 데이터:', formData);
    
    // 예약 완료 후 다음 단계로 이동
    const queryString = `?departure=${formData.departureLocation}&payment=${formData.paymentMethod}`;
    router.push(`/event/${params.eventId}/registration/bus/confirm${queryString}`);
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 섹션 제목 */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-black text-left">버스 예약 신청</h2>
            <hr className="border-black border-[1.5px] mt-2" />
          </div>

          {/* 안내 문구 */}
          <div className="mb-8 sm:mb-12 text-left">
            <p className="text-sm sm:text-base text-black leading-relaxed font-bold">
              마라톤 대회 당일 이동을 위한 버스를 예약하세요. 출발지를 선택하고 예약을 완료해주세요.
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* 출발지 선택 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
                출발지
              </label>
              <div className="relative" ref={departureRef}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'departure' ? null : 'departure')}
                  className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className={formData.departureLocation ? 'text-black' : 'text-gray-500'}>
                    {selectedLocation ? selectedLocation.name : '출발지를 선택해주세요'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openDropdown === 'departure' && (
                  <div className="absolute top-full left-0 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {busLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => {
                          handleInputChange('departureLocation', location.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-left hover:bg-blue-50 transition-colors ${
                          location.id === formData.departureLocation ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {location.departureTime} 출발 • 정원 {location.capacity}명
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              {location.price.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <hr className="border-gray-200" />

            {/* 결제 금액 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
                결제 금액
              </label>
              <div className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 text-left">
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  {selectedLocation ? selectedLocation.price.toLocaleString() : '0'}원
                </span>
              </div>
            </div>

            {/* 구분선 */}
            <hr className="border-gray-200" />

            {/* 결제수단 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
                결제수단
              </label>
              <div className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 text-left">
                <span className="text-base sm:text-lg text-gray-700">
                  무통장 입금 (계좌이체)
                </span>
              </div>
            </div>

            {/* 구분선 */}
            <hr className="border-gray-200" />

            {/* 안내사항 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-base sm:text-lg font-bold text-black mb-4">안내사항</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 버스는 마라톤 대회 당일 오전에 출발합니다</p>
                <p>• 출발 10분 전까지 해당 장소에 도착해주세요</p>
                <p>• 예약 후 취소는 대회 3일 전까지 가능합니다</p>
                <p>• 버스 내 음식물 섭취는 금지되어 있습니다</p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="text-center pt-6">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-lg font-semibold text-base hover:bg-gray-800 transition-colors"
              >
                다음
              </button>
            </div>
          </form>
        </div>
      </div>
    </SubmenuLayout>
  );
}
